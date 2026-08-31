import sys
from pathlib import Path

# Ajouter le répertoire api au path Python
current_dir = Path(__file__).resolve().parent
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

from app.main import app
