// Point d'entree a la racine pour les hebergements (ex. cPanel/Passenger) qui
// exigent "server.js" a la racine du projet et ignorent/reinitialisent un champ
// "fichier de demarrage" personnalise (ex. "src/server.js"). Le vrai code vit
// dans src/server.js ; ce fichier n'est qu'un pont.
require('./src/server.js');
