var mqtt;
var reconnectTimeout = 2000;
var host = "192.168.2.101";   // Changer pour la bonne ip
var port = 9001;              // Changer pour le bon port

function onFailure(message){
    console.log("Connection Attemp to Host"+host+"Failed");
    setTimeout(MQTTconnect, reconnectTimeout);
}

function onConnect(){
    console.log("Connected");

    // Ici on met tout les subs ?
    mqtt.subscribe("topicTest");

    //Ici on met tout les pubs ?
}

function onMessageArrived(msg){
    out_msg = "Message received" + msg.payloadString +"<br>";
    out_msg = out_msg+"Message received Topic "+ msg.destinationName;
    console.log(out_msg);
}

function MQTTconnect() {
    console.log("connecting to" + host + " " + port);
    var x = Math.floor(Math.random() * 10000);
    var cname = "orderform-"+x;
    mqtt = new Paho.MQTT.Client(host, port,cname);
    var options = {
        timeout : 3,
        onSucces: onConnect,
        onFailure: onFailure,
    };

    mqtt.onMessageArrived = onMessageArrived
    mqtt.connect(options);
}

MQTTconnect();