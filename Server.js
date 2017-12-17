const express = require('express');
const axios = require("axios");
const GoogleMapsAPI = require('googlemaps');
const MongoClient = require('mongodb').MongoClient
const path = require('path');
const config = {
    key: 'AIzaSyDyt7zqjs_1un_Op6JFcm43pCAI0glKDEw',
    stagger_time: 1000, 
    secure: true, 
    encode_polyines: false
}
const gmAPI = new GoogleMapsAPI(config);
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.urlencoded());
app.use(express.json());
app.use(express.static('public'));

app.set('view engine', 'ejs');

app.get('/', (req, res) =>
{
    res.sendFile(path.join(__dirname + "/public/html/index.html"));
});

let updatedb = () =>
{
    // On récupère en AJAX les données de nos parkings
    axios.get("https://geoservices.grand-nancy.org/arcgis/rest/services/public/VOIRIE_Parking/MapServer/0/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=nom%2Cadresse%2Cplaces%2Ccapacite&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentsOnly=false&datumTransformation=&parameterValues=&rangeValues=&f=pjson")
    .then( response =>
    {
        // On se connecte à notre base de données Mongo
        MongoClient.connect("mongodb://localhost:27017/test", (error, db) => 
        {
            if(error) console.log("[Error] There was an issue while trying to connect to MongoDB. Please check if your MongoDB service is running, or if it's listening on the right port.");
            
            let parkings = db.collection("parking");
            
            parkings.remove();
       
            // Pour chaque parking récupéré, on l'insère dans notre base de données
            response.data.features.forEach(element => 
            {
                var geocodeParams = 
                {
                    "address": element.attributes.ADRESSE + ", Nancy"
                };
                   
                // On récupère la latitude et la longitude de notre adresse via l'API GoogleMap
                gmAPI.geocode(geocodeParams, function(err, result)
                {                    
                    let toInsert = 
                    {
                        nom: element.attributes.NOM,
                        adresse: element.attributes.ADRESSE,
                        places: element.attributes.PLACES == null ? 0 : element.attributes.PLACES,
                        capacite: element.attributes.CAPACITE,
                        x: result.results[0].geometry.location.lat,
                        y: result.results[0].geometry.location.lng
                    }
    
                    parkings.insert(toInsert, null);
                });
            });

        });

        console.log("Database updated successfuly!");
    }).catch( (error) =>
    {
        console.log("There was a problem while trying to fetch data. The service you're trying to access may be down.");
    });
}

// Route pour forcer l'update de la base de données
app.get('/updatedb', (req, res) =>
{
    updatedb();  

    res.redirect("/");
})

app.post('/location', (req, res) => 
{
    // On récupère la liste des parkings
    let parkingTab = [];    
    MongoClient.connect("mongodb://localhost:27017/test", (err, db) =>
    {
        if(err) console.log("[Error] There was an issue while trying to connect to MongoDB. Please check if your MongoDB service is running, or if it's listening on the right port.");

        let parkings = db.collection("parking").find().toArray( (err, results) =>
        {
            results.forEach( (elem, index) =>
            {
                parkingTab.push(elem);
            });
        });
    });    

    // On récupère l'adresse dans la requête
    let geocodeParams = 
    {
        "address": req.body.adresse
    };
       
    // On récupère la latitude et la longitude de notre adresse via l'API GoogleMap
    gmAPI.geocode(geocodeParams, function(err, result)
    {
        if(result != undefined && result.results.length > 0)
        {
            // On trie notre tableau en fonction de la proximité des parkings par rapport à notre adresse
            parkingTab.sort( (a, b) => 
            {
                let location = result.results[0].geometry.location;

                let distA = Math.sqrt( Math.pow(a.x - location.lat, 2) + Math.pow(a.y - location.lng, 2));
                let distB = Math.sqrt( Math.pow(b.x - location.lat, 2) + Math.pow(b.y - location.lng, 2));

                return distA - distB;
            })
        }
            
        // On render notre page avec les 3 parkings les plus proches
        res.render('location', {
            adresseValide: result != undefined ? result.results[0] : false,
            p1: parkingTab[0], 
            p2: parkingTab[1],
            p3: parkingTab[2]
        })
    });
});

// On update la base de données au démarrage du serveur, puis toutes les 30min
updatedb();
setInterval( () =>
{
    updatedb();
}, 1000 * 60 * 30);

app.listen(8080);