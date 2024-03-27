var mqtt;
var reconnectTimeout = 2000;
var host = "172.16.72.192";   // Changer pour la bonne ip
var port = 9001;              // Changer pour le bon port


// Créer une nouvelle instance de JustGage avec des options de configuration
var gaugeTemp = new JustGage({
    id: "gauge-temperature", 
    value: 0, // Valeur initiale de la jauge
    min: 0, // Valeur minimale de la jauge
    max: 35, // Valeur maximale de la jauge
    title: "Température", // Titre de la jauge (optionnel)
    label: "Degré celcius", // Libellé de la valeur affichée (optionnel)
    levelColors: ["#8fff98", "#4cbb17", "#115d33"],
    
    // Autres options de configuration...
    });
    
    var gaugeHumidity = new JustGage({    
    id: "gauge-humidity", 
    value: 0, // Valeur initiale de la jauge
    min: 0, // Valeur minimale de la jauge
    max: 100, // Valeur maximale de la jauge
    title: "Humidity", // Titre de la jauge (optionnel)
    label: "Pourcentage", // Libellé de la valeur affichée (optionnel)
    levelColors: ["#8fff98", "#4cbb17", "#115d33"], // Couleurs pour les différents niveaux de la jauge
    });


// Fonction pour mettre à jour l'état de la lumière
function updateLightState(isOn) {
    var lightBulb = document.getElementById('light-bulb');
    var bulb = lightBulb.getElementById('bulb'); // Remplacez 'bulb' par l'ID de l'élément correspondant à l'ampoule dans votre SVG
    if (isOn) {
        bulb.style.fill = '#4cbb17'; // Vert
    } else {
        bulb.style.fill = '#9e9e9e'; // Gris
    }
}    

function onFailure(message){
    console.log("Connection Attemp to Host"+host+"Failed");
    setTimeout(MQTTconnect, reconnectTimeout);
}
function onConnect(){
    console.log("Connected");
    // Ici on met tout les subs
    mqtt.subscribe("temperature");
    mqtt.subscribe("humidity");
    mqtt.subscribe("light_intensity");
    mqtt.subscribe("security_alert");
}


function onMessageArrived(msg) {
    var topic = msg.destinationName;
    var payload = msg.payloadString;

    console.log("Message received on topic: " + topic);
    console.log("Payload: " + payload);

       // Mettre à jour la valeur de la jauge en fonction du topic
       switch (topic) {
        case "temperature":
            // Mettre à jour la valeur de la jauge avec la donnée de l'humidité reçue via MQTT
            gaugeTemp.refresh(parseFloat(payload)); // Convertir la payload en nombre flottant
            document.getElementById("subtitle-temp").innerHTML = ("Température ambiante : " + payload + "°");

            break;
        case "humidity":
            // Mettre à jour la valeur de la jauge avec la donnée de l'humidité reçue via MQTT
            gaugeHumidity.refresh(parseFloat(payload)); 
            document.getElementById("subtitle-humidity").innerHTML = ("Humidité de l'air : " + payload + "%");
            break;
        case "light_intensity":
            if (payload > 2.6 ){
                updateLightState(true); // Allumer la lumière
                document.getElementById("subtitle-light").innerHTML = "La lumière est allumé";
            }
            else { 
                updateLightState(false)
                document.getElementById("subtitle-light").innerHTML = "La lumière est fermé";
            }
            break;
        case "security_alert":
            if (payload === "true") {
                // Afficher le modal d'alerte
                document.getElementById('alert-modal').style.display = 'block';
            } else {
                // Cacher le modal d'alerte
                document.getElementById('alert-modal').style.display = 'none';
            }
        break;
        // Ajouter d'autres cas pour d'autres sujets MQTT si nécessaire
        default:
            console.log("Topic non reconnu: " + topic);
            break;
    }
}


function MQTTconnect() {
    console.log("connecting to" + host + " " + port);
    var x = Math.floor(Math.random() * 10000);
    var cname = "orderform-"+x;
    mqtt = new Paho.MQTT.Client(host, port, "/mqtt",cname);
    var options = {
        timeout : 3,
        onSuccess: onConnect,
        onFailure: onFailure,
    };

    mqtt.onMessageArrived = onMessageArrived
    mqtt.connect(options);
}



// Ajouter un délais 
var btnDelais = document.getElementById("delais-btn");

btnDelais.addEventListener("click", function() {
    // Récupérer les valeurs des inputs au moment du clic
    var delais_hygro = document.getElementById("input-hygro").value;
    var delais_light = document.getElementById("input-light").value;

    // Créer un objet JSON avec les valeurs récupérées
    var data = {
        "hygro_interval": parseInt(delais_hygro),
        "light_interval": parseInt(delais_light)
    };

    // Convertir l'objet JSON en chaîne JSON
    var json_data = JSON.stringify(data);

      // Afficher les valeurs récupérées dans la console pour vérification
    console.log(json_data);

    // Envoyer les valeurs récupérées via MQTT
    var interval = new Paho.MQTT.Message(json_data);
    interval.destinationName = "interval";
    mqtt.send(interval);

});



MQTTconnect();