/* ==========================================================================
   SAHAM BANK ANALYTICS PORTAL — Configuration d'environnement (optionnel)
   ==========================================================================

   À QUOI SERT CE FICHIER ?

   Le portail devine tout seul où se trouve l'API :
     - sur localhost        -> http://localhost:8000   (ton PC, développement)
     - sur un vrai domaine  -> même origine que la page (production)

   Dans 90 % des cas, tu n'as RIEN à faire ici.

   QUAND FAUT-IL Y TOUCHER ?

   Uniquement si le frontend et l'API sont sur DEUX domaines différents.
   C'est le cas classique d'un déploiement :

       frontend  ->  https://saham-portal.vercel.app     (Vercel)
       API       ->  https://saham-api.onrender.com      (Render)

   Là, le frontend doit savoir où joindre l'API. Décommente la ligne ci-dessous
   et mets l'URL de TON API Render :

       window.SAHAM_API_BASE = 'https://saham-api.onrender.com';

   ATTENTION : pas de "/" à la fin de l'URL.

   N'OUBLIE PAS : ajoute aussi l'URL du frontend dans CORS_ORIGINS
   (backend/.env), sinon le navigateur bloquera les appels.

   ========================================================================== */

// window.SAHAM_API_BASE = 'https://saham-api.onrender.com';
