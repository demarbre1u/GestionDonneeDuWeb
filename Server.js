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

app.get('/updatedb', (req, res) =>
{
    axios.get("https://geoservices.grand-nancy.org/arcgis/rest/services/public/VOIRIE_Parking/MapServer/0/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=nom%2Cadresse%2Cplaces%2Ccapacite&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentsOnly=false&datumTransformation=&parameterValues=&rangeValues=&f=pjson")
    .then( response =>
    {
        MongoClient.connect("mongodb://localhost:27017/test", (error, db) => 
        {
            if(error) console.log(error);
            
            let parkings = db.collection("parking");
            
            parkings.remove();
       
            response.data.features.forEach(element => 
            {
                let toInsert = 
                {
                    nom: element.attributes.NOM,
                    adresse: element.attributes.ADRESSE,
                    places: element.attributes.PLACES,
                    capacite: element.attributes.CAPACITE,
                    x: element.geometry.x,
                    y: element.geometry.y
                }

                parkings.insert(toInsert, null);
            });

            db.close();
        });
    });

    res.redirect("/");
})

app.post('/location', (req, res) => 
{
    let parkingTab = [];    
    MongoClient.connect("mongodb://localhost:27017/test", (err, db) =>
    {
        if(err) console.log(err);

        let parkings = db.collection("parking").find().toArray( (err, results) =>
        {
            results.forEach( (elem, index) =>
            {
                parkingTab.push(elem);
            });
        });
    });    

    var geocodeParams = 
    {
        "address": req.body.adresse
    };
       
    gmAPI.geocode(geocodeParams, function(err, result)
    {
        if(result.results.length > 0)
        {
            parkingTab.sort( (a, b) => 
            {
                let location = result.results[0].geometry.location;

                let distA = Math.sqrt( Math.pow(a.x - location.lat, 2) + Math.pow(a.y - location.lng, 2));
                let distB = Math.sqrt( Math.pow(b.x - location.lat, 2) + Math.pow(b.y - location.lng, 2));

                return distA - distB;
            })
        }
            
        res.render('location', {
            adresseValide: result.results[0],
            p1: parkingTab[0], 
            p2: parkingTab[1],
            p3: parkingTab[2]
        })
    });
});

app.listen(8080);