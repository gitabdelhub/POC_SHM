const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const botPhrases = {
  "Hello, Admin System! How can I help you analyze Saham Bank's performance today?": "Bonjour ! Comment puis-je vous aider à analyser les performances de Saham Bank aujourd'hui ?",
  "I'm analyzing the data... The global MRR indicates strong performance in the Moroccan market, especially in mobile engagement.": "D'après mes analyses, le Produit Net Bancaire (PNB) montre d'excellentes performances sur le marché marocain, tirées par l'adoption croissante de nos canaux digitaux.",
  "Here is the detailed report. The churn risk is highest in the Spanish branch due to recent policy changes.": "Voici le rapport détaillé. Le risque de marché reste stable, avec une légère hausse anticipée sur le segment de crédit à la consommation due au contexte inflationniste.",
  "Our AI model suggests focusing on mobile customer acquisition in Q3 to boost overall engagement metrics.": "Notre modèle IA recommande de concentrer les efforts sur l'acquisition de clients digitaux au T3 pour optimiser l'engagement et réduire le coût de service.",
  "I'm sorry, I cannot access that specific dataset. Is there another query I can help with?": "Je suis désolé, je n'ai pas accès à cet ensemble de données spécifique pour le moment. Y a-t-il autre chose que je puisse faire pour vous ?",
  "I am Saham Bank's AI assistant, ready to provide operational intelligence.": "Je suis l'assistant IA de Saham Bank, conçu pour vous fournir une intelligence opérationnelle en temps réel.",
  "Type your question here...": "Posez votre question ici...",
  "Ask AI": "Interroger l'IA",
  "AI Assistant": "Assistant IA Saham"
};

for (const [en, fr] of Object.entries(botPhrases)) {
    html = html.replace(new RegExp(en, 'g'), fr);
}

fs.writeFileSync('index.html', html);
console.log('Fixed chatbot languages');
