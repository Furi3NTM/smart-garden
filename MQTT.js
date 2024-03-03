var mqtt;
var reconnectTimeout = 2000;
// Assurez-vous que l'adresse IP et le port sont corrects et correspondent à votre configuration MQTT.
var host = "172.16.207.47"; // L'adresse IP de votre broker MQTT
var port = 9001; // Le port sur lequel le broker MQTT écoute les connexions WebSocket

function onFailure(message) {
    console.log("Connection Attempt to Host " + host + " Failed");
    console.log("Error Message: ", message.errorMessage);
    setTimeout(MQTTconnect, reconnectTimeout);
}

function onConnect() {
    console.log("Connected to " + host + " on port " + port);

    // S'abonner aux topics souhaités ici
    console.log("Subscribing to topics: temperature, humidity, light_intensity");
    mqtt.subscribe("temperature");
    mqtt.subscribe("humidity");
    mqtt.subscribe("light_intensity");
}

function onMessageArrived(message) {
    var out_msg = "Message received: " + message.payloadString;
    out_msg += " on Topic: " + message.destinationName;
    console.log(out_msg);
    
    // Ici, vous pouvez ajouter du code pour mettre à jour l'interface utilisateur avec les données reçues
}

function MQTTconnect() {
    console.log("Connecting to " + host + " on port " + port);
    var clientId = "webClient_" + parseInt(Math.random() * 10000);

    // Création de l'instance du client MQTT. Assurez-vous que le chemin est correct pour votre configuration.
    // Utilisez "ws://" pour une connexion non sécurisée et "wss://" pour une connexion sécurisée.
    mqtt = new Paho.MQTT.Client("ws://" + host, port, "/mqtt", clientId);

    // Définir les callbacks
    var options = {
        timeout: 3,
        onSuccess: onConnect,
        onFailure: onFailure,
        useSSL: false // Mettez ceci à true si vous utilisez "wss://" pour une connexion sécurisée
    };

    mqtt.onMessageArrived = onMessageArrived;
    mqtt.connect(options); // Connecter le client
}

MQTTconnect(); // Démarrer la connexion
