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
import re
from typing import Any, Dict, List

from app.config import settings


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

    def complete(self, messages: List[Dict[str, str]], temperature: float = 0.2) -> str:
        last = messages[-1]["content"] if messages else ""
        if "NO_SQL" in last or "mode" in last and "RAG" in last:
            if "sql" in last and "json" in last:
                return (
                    '{"mode": "sql", "sql": "SELECT COUNT(*) AS total FROM fact_engagement;",'
                    ' "sql_explanation": "Compte le nombre total d\'engagements."}'
                )
        return json.dumps(
            {
                "mode": "sql",
                "sql": "SELECT COUNT(*) AS total FROM fact_engagement;",
                "sql_explanation": "Compte le nombre total d'engagements.",
            }
        )


class LLMClient:
    def __init__(self):
        self.provider = self._build_provider()

    def _build_provider(self):
        name = settings.LLM_PROVIDER.lower()
        if name == "groq":
            return GroqProvider()
        if name == "ollama":
            return OllamaProvider()
        if name == "mock":
            return MockProvider()
        raise ValueError(f"LLM_PROVIDER inconnu : {name} (groq | ollama | mock)")

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
        return self.provider.complete(messages, temperature=temperature)

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
