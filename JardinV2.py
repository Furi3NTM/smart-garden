# VOICI LE CODE DU SCRIPT PYTHON, CE SERA LE SCRIPT DU JARDIN QUI ROULE SUR LE RASPBERRY PI

import RPi.GPIO as GPIO
import time
import threading
import Freenove_DHT as DHT
from ADCDevice import *
import paho.mqtt.client as mqtt
import json


DHTPin = 11  # Définir la broche du DHT11
sleep_time = 10
hygro_sleep_time = 1
light_sleep_time = 1

# Configuration du client MQTT pour WebSocket
broker_address = "172.16.207.47"
temperature_topic = "temperature"
humidity_topic = "humidity"
light_intensity_topic = "light_intensity"  # Topic pour l'intensité lumineuse

# Fonction appelée lorsque le client se connecte au serveur
def on_connect(client, userdata, flags, rc):
    global hygro_sleep_time, light_sleep_time
    print(f"Connected with result code {rc}")
    # Abonnement aux sujets
    client.subscribe("interval")
    

# Fonction appelée lors de la publication d'un message
def on_publish(client, userdata, mid):
    print(f"Message Published: {mid}")

# Fonction appelée lors de la réception d'un message
def on_message(client, userdata, message):
    global hygro_sleep_time, light_sleep_time
    payload = message.payload.decode()  # Convertir la payload en chaîne de caractères
    data = json.loads(payload)  # Charger la chaîne JSON dans un dictionnaire Python
    print("Received JSON data:", data)
    
    # Extraire les valeurs des intervalles hygro et light du dictionnaire
    hygro_interval = data.get("hygro_interval")
    light_interval = data.get("light_interval")

    # Utiliser les valeurs extraites comme requis
    print("Hygro interval:", hygro_interval)
    print("Light interval:", light_interval)
    
    # Assure-toi de convertir les valeurs en entiers si nécessaire
    try:
        hygro_sleep_time = int(hygro_interval)
        light_sleep_time = int(light_interval)
        print("INT : " , hygro_interval , light_interval)
    except ValueError as e:
        print("Erreur de conversion en entier:", e)


# Création d'une instance client MQTT pour WebSocket
mqtt_ws_client = mqtt.Client("WebSocketSensorClient", transport='websockets')
mqtt_ws_client.on_connect = on_connect
mqtt_ws_client.on_publish = on_publish
mqtt_ws_client.on_message = on_message

mqtt_ws_client.connect(broker_address, 9001, 60)  # Connexion via WebSocket


# Fonction pour envoyer des données via WebSocket MQTT
def send_data_to_mqtt_ws(topic, value):
    # Conversion directe de la valeur en chaîne de caractères pour la publication
    payload = json.dumps(value)
    result = mqtt_ws_client.publish(topic, payload)
    if result[0] == 0:
        print(f"Sent to WebSocket topic `{topic}`: {payload}")
    else:
        print(f"Failed to send to WebSocket topic `{topic}`")


# Hygrothermographe
def Hygrothermographe():
    global temp_sleep_time
    dht = DHT.DHT(DHTPin)  # Initialisation du capteur DHT11
    while True:
        chk = dht.readDHT11()  # Lecture du DHT11
        if chk is dht.DHTLIB_OK:
            send_data_to_mqtt_ws(temperature_topic, dht.temperature)  # Envoyer la température via WebSocket
            send_data_to_mqtt_ws(humidity_topic, dht.humidity)  # Envoyer l'humidité via WebSocket
        else:
            print("DHT11 read error.")
        time.sleep(hygro_sleep_time)

# Photoresistor
def Photoresistor():
    global light_sleep_time
    adc = ADCDevice()  # Initialisation du dispositif ADC
    if adc.detectI2C(0x48):  # Détection de PCF8591
        adc = PCF8591()
    elif adc.detectI2C(0x4b):  # Détection de ADS7830
        adc = ADS7830()
    else:
        print("No correct I2C address found.")
        exit(-1)

    while True:
        value = adc.analogRead(0)  # Lecture de la valeur analogique
        voltage = value / 255.0 * 3.3  # Calcul de la tension
        send_data_to_mqtt_ws(light_intensity_topic, voltage)  # Envoyer l'intensité lumineuse via WebSocket
        time.sleep(light_sleep_time)

# Fonction principale
def main():
    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BOARD)  # Configuration des broches GPIO

    mqtt_ws_client.loop_start()  # Démarrage de la boucle d'événements MQTT pour WebSocket

    # Création et démarrage des threads pour la lecture des capteurs
    hygro_thread = threading.Thread(target=Hygrothermographe)
    photoresistor_thread = threading.Thread(target=Photoresistor)
    
    hygro_thread.start()
    photoresistor_thread.start()

    try:
        hygro_thread.join()
        photoresistor_thread.join()
    except KeyboardInterrupt:
        print("Program interrupted")
    finally:
        mqtt_ws_client.loop_stop()  # Arrêt de la boucle d'événements
        mqtt_ws_client.disconnect()  # Déconnexion du client MQTT
        GPIO.cleanup()  # Nettoyage des configurations GPIO

if __name__ == '__main__':
    main()
