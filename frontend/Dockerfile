FROM nginx:alpine

# Le portail est un site statique : nginx sert directement les fichiers.
#
# ATTENTION (bug corrige) : la version precedente ne copiait que index.html
# et le logo. Les feuilles de style css/main.css et css/chatbot.css, pourtant
# referencees dans index.html, n'arrivaient jamais dans l'image -> le portail
# s'affichait SANS styles quand on le lancait avec Docker.
COPY index.html /usr/share/nginx/html/index.html
COPY logo_saham.png /usr/share/nginx/html/logo_saham.png
COPY config.js /usr/share/nginx/html/config.js
COPY css/ /usr/share/nginx/html/css/

EXPOSE 80
