"""
Abstraction LLM : permet de basculer entre plusieurs fournisseurs sans toucher au reste du code.

Providers supportés :
  - "groq"  : API cloud Groq (rapide, Llama-3.3-70B) - nécessite GROQ_API_KEY
  - "ollama" : modèles locaux (hors-ligne) - nécessite Ollama installé et lancé
  - "mock"  : réponses codées en dur (démo sans LLM / tests)

Le reste du code n'appelle que LLMClient.complete() ou .complete_json(), jamais le SDK
d'un fournisseur : c'est le pattern "strategy" appliqué aux LLM.
"""

import json
import logging
import re
import time
from typing import Any, Dict, List

from app.config import settings

logger = logging.getLogger(__name__)

# Politique de reessai : 3 tentatives, attente 1s puis 2s.
LLM_MAX_TENTATIVES = 3
LLM_ATTENTE_BASE = 1.0

# Erreurs qui ont une chance de disparaitre au prochain essai. Une cle
# invalide ou un modele inexistant echoueront autant de fois qu on insiste.
_MOTS_TEMPORAIRES = (
    "timeout", "timed out", "connection", "network", "unavailable",
    "rate limit", "ratelimit", "429", "500", "502", "503", "504",
    "overloaded", "capacity", "try again",
)


def _est_temporaire(exc: Exception) -> bool:
    """Dit si l erreur vaut la peine d etre retentee."""
    texte = f"{exc.__class__.__name__} {exc}".lower()
    return any(mot in texte for mot in _MOTS_TEMPORAIRES)


def _extract_json(text: str) -> Any:
    """Extrait un objet JSON depuis la sortie du modèle (qui peut ajouter du texte)."""
    if not text:
        raise ValueError("Réponse vide du modèle")
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1 and end > start:
        cleaned = cleaned[start : end + 1]
    return json.loads(cleaned)


class GroqProvider:
    def __init__(self):
        if not settings.GROQ_API_KEY:
            raise RuntimeError(
                "GROQ_API_KEY est vide. Créez une clé gratuite sur https://console.groq.com "
                "et mettez-la dans backend/.env (GROQ_API_KEY=...)."
            )
        from groq import Groq

        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = settings.GROQ_MODEL

    def complete(self, messages: List[Dict[str, str]], temperature: float = 0.2) -> str:
        resp = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
        )
        return resp.choices[0].message.content or ""


class OllamaProvider:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL.rstrip("/")
        self.model = settings.OLLAMA_MODEL

    def complete(self, messages: List[Dict[str, str]], temperature: float = 0.2) -> str:
        import httpx

        with httpx.Client(timeout=300) as client:
            resp = client.post(
                f"{self.base_url}/api/chat",
                json={
                    "model": self.model,
                    "messages": messages,
                    "stream": False,
                    "temperature": temperature,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return data.get("message", {}).get("content", "")


class MockProvider:
    """Réponses codées en dur pour tester le pipeline sans aucun LLM."""

    OOB_KEYWORDS = ("météo", "temps", "football", "blague", "qui es-tu")

    def complete(self, messages: List[Dict[str, str]], temperature: float = 0.2) -> str:
        system = messages[0]["content"] if messages else ""
        last = messages[-1]["content"] if messages else ""

        # 2e appel : rédaction de la réponse à partir des vrais résultats.
        if "Rédige une réponse professionnelle" in system:
            return (
                "Voici les résultats de votre analyse : la base contient les "
                "informations demandées, résumées dans le tableau ci-dessus."
            )

        # 1er appel : génération du plan (SQL ou hors-sujet).
        if "Question de l'utilisateur" in last:
            if any(k in last.lower() for k in self.OOB_KEYWORDS):
                return json.dumps(
                    {
                        "mode": "oob",
                        "answer": (
                            "Cette question dépasse le périmètre des données "
                            "disponibles. Je peux analyser les clients, crédits, "
                            "risques et performances des agences Saham Bank."
                        ),
                        "sql": None,
                        "sql_explanation": None,
                        "chart_type": "none",
                    }
                )
            return json.dumps(
                {
                    "mode": "sql",
                    "sql": "SELECT COUNT(*) AS total FROM fact_engagement",
                    "sql_explanation": "Compte le nombre total d'engagements.",
                    "chart_type": "none",
                }
            )

        return json.dumps(
            {
                "mode": "sql",
                "sql": "SELECT COUNT(*) AS total FROM fact_engagement",
                "sql_explanation": "Compte le nombre total d'engagements.",
                "chart_type": "none",
            }
        )


class LLMClient:
    """
    Client LLM avec repli automatique (fallback).

    Pourquoi un repli ? Le fournisseur cloud peut etre indisponible :
    quota depasse, cle expiree, coupure reseau, panne du service.
    Sans repli, le chatbot leve une exception et devient muet -- typiquement
    le jour de la demonstration.

    Avec repli, on bascule sur MockProvider : les reponses sont plus pauvres,
    mais l'application reste debout. C'est le principe de la
    "degradation gracieuse" (graceful degradation).

    L'attribut `degraded` indique si on tourne en mode degrade, ce qui permet
    a l'API de le signaler honnetement dans sa reponse.
    """

    def __init__(self):
        self.degraded = False
        self.degraded_reason = None
        self.provider = self._build_provider()

    def _build_provider(self):
        name = settings.LLM_PROVIDER.lower()

        if name == "mock":
            return MockProvider()

        if name not in ("groq", "ollama"):
            raise ValueError(f"LLM_PROVIDER inconnu : {name} (groq | ollama | mock)")

        try:
            if name == "groq":
                return GroqProvider()
            return OllamaProvider()
        except Exception as exc:  # cle absente, SDK manquant, service injoignable...
            self.degraded = True
            self.degraded_reason = f"{name} indisponible ({exc.__class__.__name__}) : {exc}"
            logger.warning(
                "LLM '%s' indisponible, repli sur le mode mock. Raison : %s",
                name,
                exc,
            )
            return MockProvider()

    def complete(
        self,
        prompt: str,
        system: str = None,
        temperature: float = 0.2,
    ) -> str:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        if isinstance(self.provider, MockProvider):
            return self.provider.complete(messages, temperature=temperature)

        # --- Reessai avant d abandonner ---------------------------------
        # Une coupure d une seconde ou un depassement momentane du quota
        # (8 000 tokens/min chez Groq) ne doit PAS condamner toute la session.
        # L ancienne version remplacait definitivement self.provider par le
        # mock des le premier echec : le chatbot restait muet jusqu au
        # redemarrage du serveur.
        derniere = None
        for tentative in range(1, LLM_MAX_TENTATIVES + 1):
            try:
                reponse = self.provider.complete(messages, temperature=temperature)
                # Un appel qui repasse efface l etat degrade : l interface doit
                # refleter la realite du moment, pas une panne passee.
                self.degraded = False
                self.degraded_reason = None
                return reponse
            except Exception as exc:
                derniere = exc
                if tentative < LLM_MAX_TENTATIVES and _est_temporaire(exc):
                    attente = LLM_ATTENTE_BASE * tentative
                    logger.warning(
                        "Appel LLM echoue (%d/%d) : %s. Nouvel essai dans %.0fs.",
                        tentative, LLM_MAX_TENTATIVES, exc, attente,
                    )
                    time.sleep(attente)
                    continue
                break

        self.degraded = True
        self.degraded_reason = f"{derniere.__class__.__name__} : {derniere}"
        logger.warning(
            "Appel LLM abandonne apres %d tentatives, repli sur le mock. Raison : %s",
            LLM_MAX_TENTATIVES, derniere,
        )
        # On GARDE le vrai fournisseur : la prochaine question le retentera.
        return MockProvider().complete(messages, temperature=temperature)

    def complete_json(
        self,
        prompt: str,
        system: str = None,
        temperature: float = 0.0,
    ) -> Any:
        raw = self.complete(prompt, system=system, temperature=temperature)
        return _extract_json(raw)


_llm_singleton = None


def get_llm() -> LLMClient:
    """Retourne un client LLM (instancié une seule fois par process)."""
    global _llm_singleton
    if _llm_singleton is None:
        _llm_singleton = LLMClient()
    return _llm_singleton
