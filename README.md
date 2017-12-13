# A propos

Ce projet a été développé dans le cadre du cours de "Gestion de donnée du Web" de la LP CISIIE de 2017-2018.
 
# Comment installer le projet

Pour fonctionner, le projet à besoin d'une base de données Mongo accessible depuis le port 27017.

Si vous ne disposez pas d'une telle base de données, vous pouvez récupérer une image Docker grâce à la commande suivante :

```
docker run -d -p 27017:27017 mongo:latest
```

Le projet fonctionne grâce à un serveur NodeJS, vous aurez donc besoin de NodeJS et de npm pour aller plus loin.

Une fois NodeJS et npm installés, il faut installer les dépendances du projet :

```
cd GestionDonneeDuWeb/ && npm install
```

Une fois les dépendances installées, il ne reste plus qu'à lancer notre serveur NodeJS :

```
node Server.js
```

Et d'y accéder à l'adresse suivante :  http://localhost:8080/
