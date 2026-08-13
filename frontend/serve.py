"""Serveur statique du frontend, avec URL affichée et ouverte dans le navigateur.

Usage : npm run dev (via package.json) — remplace `python -m http.server` qui
n'affiche rien à l'écran.
"""
import http.server
import socketserver
import webbrowser

PORT = 5500
URL = f"http://localhost:{PORT}"


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        # Reste silencieux : seul l'URL d'accès est affichée au démarrage.
        pass


with socketserver.TCPServer(("", PORT), QuietHandler) as httpd:
    print(f"\n  Frontend Saham Bank : {URL}", flush=True)
    print(f"  (Ctrl+C pour arrêter)\n", flush=True)
    webbrowser.open(URL)  # ouvre le navigateur automatiquement
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n  Frontend arrêté.", flush=True)
