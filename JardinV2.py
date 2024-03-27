import time
import threading
import json

import RPi.GPIO as GPIO
import Freenove_DHT as DHT
import paho.mqtt.client as mqtt

from ADCDevice import *
from rpi_ws281x import *
from PCF8574 import *
from Adafruit_LCD1602 import *
from gpiozero import LED, DistanceSensor


# GPIO initialisation
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BOARD)

# Pompe
PIN_POMPE = 16
GPIO.setup(PIN_POMPE, GPIO.OUT)
GPIO.output(PIN_POMPE, GPIO.HIGH) 

# LED initialisation
LED_COUNT      = 8      # Number of LED pixels.
LED_PIN        = 18      # GPIO pin connected to the pixels (18 uses PWM!).
LED_FREQ_HZ    = 800000  # LED signal frequency in hertz (usually 800khz)
LED_DMA        = 10      # DMA channel to use for generating signal (try 10)
LED_BRIGHTNESS = 255     # Set to 0 for darkest and 255 for brightest
LED_INVERT     = False   # True to invert the signal (when using NPN transistor level shift)
LED_CHANNEL    = 0       # set to '1' for GPIOs 13, 19, 41, 45 or 53

# LED alert
redLED = LED(13)  #33 en BOARD
greenLED = LED(26) #35 en BOARD
yellowLED = LED(19) #37 en BOARD

greenLED.on()
yellowLED.on()
redLED.on()

# Variable globale
DHTPin = 11  #17 en BCM

sleep_time = 10
hygro_sleep_time = 10
light_sleep_time = 10

global_temperature = 0
global_humidity = 0
global_moisture_sensor = 0

# Alert
low_water_alert = False
high_water_alert = False
security_alert = False

# Configuration du client MQTT pour WebSocket
broker_address = "172.16.72.192"
temperature_topic = "temperature"
humidity_topic = "humidity"
light_intensity_topic = "light_intensity" 
moisture_sensor_topic = "moisture_sensor"
security_alert_topic = "security_alert"

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
    global global_temperature, global_humidity
    # Conversion directe de la valeur en chaîne de caractères pour la publication
    payload = json.dumps(value)
    result = mqtt_ws_client.publish(topic, payload)
    if result[0] == 0:
        print(f"Sent to WebSocket topic `{topic}`: {payload}")
        if topic == "temperature":
            global_temperature = payload
        if topic == "humidity":
            global_humidity = payload    
    else:
        print(f"Failed to send to WebSocket topic `{topic}`")


# --------------------------------------------------------------------------------------------------------#

# Water pump
def WaterPump():
    try:
        # Allumer la pompe
        GPIO.output(PIN_POMPE, GPIO.LOW)
        print("Allumage de la pompe...")
        time.sleep(2)  # Laisser la pompe fonctionner pendant 5 secondes
        # Éteindre la pompe
        GPIO.output(PIN_POMPE, GPIO.HIGH)
        print("Arrêt de la pompe...")
    except KeyboardInterrupt:
        print("Arrêt forcé de l'utilisateur.")


def SecuritySensor():
    global security_alert
    ultrasonic = DistanceSensor(echo=20, trigger=25)
    try:
        while True:
            print(ultrasonic.distance)
            time.sleep(1)
            if ultrasonic.distance <= 0.6:
                security_alert = True
                print(security_alert)
            else :
                security_alert = False    
    except KeyboardInterrupt:
        # Arrête la boucle lorsque l'utilisateur appuie sur Ctrl+C
        print("Arrêt de la mesure de distance.")


# Hygrothermographe
def Hygrothermographe():
    global temp_sleep_time, global_humidity, global_temperature
    dht = DHT.DHT(DHTPin)  # Initialisation du capteur DHT11
    while True:
        chk = dht.readDHT11()  # Lecture du DHT11
        if chk is dht.DHTLIB_OK: 
        
            send_data_to_mqtt_ws(temperature_topic, dht.temperature)  # Envoyer la température via WebSocket
            global_temperature = dht.temperature
            send_data_to_mqtt_ws(humidity_topic, dht.humidity)  # Envoyer l'humidité via WebSocket
            global_humidity = dht.humidity
        else:
            print("DHT11 read error.")
        time.sleep(hygro_sleep_time)

# Photoresistor
def Photoresistor():
    global light_sleep_time
    adc = ADCDevice()  
    if adc.detectI2C(0x48):  
        adc = PCF8591()
    elif adc.detectI2C(0x4b):
        adc = ADS7830()
    else:
        print("No correct I2C address found.")
        exit(-1)

    while True:
        value = adc.analogRead(0)  # Lecture de la valeur analogique
        voltage = value / 255.0 * 3.3  # Calcul de la tension
        send_data_to_mqtt_ws(light_intensity_topic, voltage)  # Envoyer l'intensité lumineuse via WebSocket
        time.sleep(light_sleep_time)

# Moisture Sensor
def MoistureSensor():
    global global_moisture_sensor, light_sleep_time, low_water_alert, high_water_alert
    adc = ADCDevice()  
    if adc.detectI2C(0x48):  
        adc = PCF8591()
    elif adc.detectI2C(0x4b):
        adc = ADS7830()
    else:
        print("No correct I2C address found.")
        exit(-1)

    while True:
        value = adc.analogRead(1)  # Lecture de la valeur analogique
        #send_data_to_mqtt_ws(moisture_sensor_topic, value)  # Envoyer la valeur via WebSocket
        print(value)
        # Alert pour le niveau d'eau, si il manque d'eau alerte jaune, si il y a trop d'eau, alert rouge.
        if value > 180:
                greenLED.off()
                redLED.off()
                yellowLED.on()  
                low_water_alert = True
                high_water_alert = False
                # Part la pompe
                WaterPump() 
        if value < 115 : 
            greenLED.off()
            yellowLED.off()  
            redLED.on()
            low_water_alert = False
            high_water_alert = True
        else : 
            yellowLED.off()
            redLED.off()
            if not low_water_alert:
                greenLED.on()
            low_water_alert = False
            high_water_alert - False
        time.sleep(light_sleep_time)


# LED
def LED_animation():
    col=[Color(255,255,255)]
    while True:
        for c in range(1):
            for i in range(8):
                led_strip.setPixelColor(i,col[c])
                time.sleep(0.1)
                led_strip.show()
                    
# Panneau LCD     
def LCD_panel():
    global security_alert
    mcp.output(3,1)     
    lcd.begin(16,2)     
    while(True):  
        if security_alert:
         lcd.clear()
         lcd.setCursor(0,0)  
         lcd.message( '  GET OUT OF'+'\n' )
         lcd.message( '  MY GARDEN !' )   
         redLED.on()
         greenLED.off() 
         send_data_to_mqtt_ws(security_alert_topic, True)
         sleep(1) 
        else:
         lcd.clear()
         lcd.setCursor(0,0)  
         lcd.message( 'Temp : ' + str(global_temperature)+ " C" +'\n' )
         lcd.message( 'Humidity :' +str(global_humidity) + "%" )   
         redLED.off()
         greenLED.on()    
         send_data_to_mqtt_ws(security_alert_topic, False)
         sleep(1)
   
PCF8574_address = 0x27
PCF8574A_address = 0x3F  
try:
    mcp = PCF8574_GPIO(PCF8574_address)
except:
    try:
        mcp = PCF8574_GPIO(PCF8574A_address)
    except:
        print ('I2C Address Error !')
        exit(1)

lcd = Adafruit_CharLCD(pin_rs=0, pin_e=2, pins_db=[4,5,6,7], GPIO=mcp)

# --------------------------------------------------------------------------------------------------------#    

# Destroy
def destroy():
    lcd.clear()
    redLED.off()  
    greenLED.off()  
    yellowLED.off() 
    GPIO.cleanup() 
    for i in range(LED_COUNT):
        led_strip.setPixelColor(i, Color(0, 0, 0))  # Définir la couleur de chaque LED à noir
    led_strip.show()  

# Main 
def main():
    global low_water_alert

    if low_water_alert:
        yellowLED.on()
        greenLED.off()
        redLED.off()
    if high_water_alert:
        redLED.on()
        greenLED.off()
        yellowLED.off()    

    mqtt_ws_client.loop_start()  # Démarrage de la boucle d'événements MQTT pour WebSocket

    # Création et démarrage des threads pour la lecture des capteurs
    hygro_thread = threading.Thread(target=Hygrothermographe)
    photoresistor_thread = threading.Thread(target=Photoresistor)
    moistureSensor_thread = threading.Thread(target=MoistureSensor)
    led_thread = threading.Thread(target=LED_animation)
    lcd_thread = threading.Thread(target=LCD_panel)
    security_sensor_thread  = threading.Thread(target=SecuritySensor)
    
    hygro_thread.start()
    photoresistor_thread.start()
    moistureSensor_thread.start()
    led_thread.start()
    lcd_thread.start()
    security_sensor_thread.start()

    try:
        hygro_thread.join()
        photoresistor_thread.join()
        moistureSensor_thread.join()
        led_thread.join()
        lcd_thread.join()
        security_sensor_thread.join()

    except KeyboardInterrupt:
        print("Program interrupted")
    finally:
        mqtt_ws_client.loop_stop()  # Arrêt de la boucle d'événements
        mqtt_ws_client.disconnect()  # Déconnexion du client MQTT
        destroy()

if __name__ == '__main__':
    led_strip = Adafruit_NeoPixel(LED_COUNT, LED_PIN, LED_FREQ_HZ, LED_DMA, LED_INVERT, LED_BRIGHTNESS, LED_CHANNEL)
    led_strip.begin()
    main()
  
