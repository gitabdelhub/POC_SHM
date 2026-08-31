"""
Service d'embeddings : conversion texte -> vecteur numérique.

Utilise `fastembed` (moteur ONNX, léger, sans PyTorch) avec un modèle multilingue
pour bien comprendre le français. Le modèle est téléchargé au premier lancement.

L'embedding transforme un morceau de texte en "position" dans un espace à N dimensions :
deux textes sémantiquement proches ont des vecteurs proches (similarité cosinus).
"""

from typing import List

from app.config import settings


class EmbeddingService:
    def __init__(self):
        self._model = None
        self.dimension = settings.EMBEDDING_DIM

    def _ensure_model(self):
        if self._model is None:
            from fastembed import TextEmbedding

            self._model = TextEmbedding(model_name=settings.EMBEDDING_MODEL)
            # récupère la dimension réelle du modèle (sécurité si elle diffère du .env)
            sample = list(self._model.embed(["dimension de test"]))[0]
            self.dimension = len(sample)

    def embed(self, texts: List[str]) -> List[List[float]]:
        """Retourne une liste de vecteurs (listes de floats) pour chaque texte."""
        self._ensure_model()
        return [list(vec) for vec in self._model.embed(texts)]

    def embed_one(self, text: str) -> List[float]:
        return self.embed([text])[0]


_embedding_singleton = None


def get_embeddings() -> EmbeddingService:
    global _embedding_singleton
    if _embedding_singleton is None:
        _embedding_singleton = EmbeddingService()
    return _embedding_singleton
