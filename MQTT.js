var mqtt;
var reconnectTimeout = 2000;
var host = "172.16.207.47";   // Changer pour la bonne ip
var port = 9001;              // Changer pour le bon port

function onFailure(message){
    console.log("Connection Attemp to Host"+host+"Failed");
    setTimeout(MQTTconnect, reconnectTimeout);
}

function onConnect(){
    console.log("Connected");
    
    // Ici on met tout les subs ?
    mqtt.subscribe("temperature");
    mqtt.subscribe("humidity");
    mqtt.subscribe("light_intensity");

    //Ici on met tout les pubs ?
}

function onMessageArrived(msg) {
    var topic = msg.destinationName;
    var payload = msg.payloadString;

    console.log("Message received on topic: " + topic);
    console.log("Payload: " + payload);

    // Traitement des messages en fonction du topic
    switch (topic) {
        case "temperature":
            // Traiter les données de température
            document.getElementById("txtTemperature").innerHTML = payload;
            break;
        case "humidity":
            // Traiter les données d'humidité
            document.getElementById("txtHumidity").innerHTML = payload;
            break;
        case "light_intensity":
            // Traiter les données d'intensité lumineuse
            document.getElementById("txtLightIntensity").innerHTML = payload;
            break;
        default:
            console.log("Topic non reconnu: " + topic);
            break;
    }
}


function MQTTconnect() {
    console.log("connecting to" + host + " " + port);
    var x = Math.floor(Math.random() * 10000);
    var cname = "orderform-"+x;
    mqtt = new Paho.MQTT.Client(host, port,cname);
    var options = {
        timeout : 3,
        onSuccess: onConnect,
        onFailure: onFailure,
    };

    mqtt.onMessageArrived = onMessageArrived
    mqtt.connect(options);
}

MQTTconnect();