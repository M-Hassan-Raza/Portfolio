---
title: "Smart Dustbin with IoT: Arduino, Python, Kotlin & Azure"
date: 2025-02-16
description: "An in-depth look at my IoT-based smart dustbin project, built using Arduino, Python, Kotlin for Android, and Azure for real-time monitoring."
tags: ["IoT", "Arduino", "Kotlin", "Python", "Azure", "ThingSpeak"]
---

## Building a Smart Dustbin with IoT

### Introduction
This project involves the development of a **Smart Dustbin** using **Arduino, Python, Kotlin (Android App), and Azure IoT** to monitor and manage waste levels in real-time. By integrating sensors, cloud computing, and mobile applications, this system enhances waste management efficiency.

### Components & Technologies Used
- **Arduino Uno & ESP8266 WiFi Module** for sensor data collection.
- **Ultrasonic Sensors** to measure garbage levels.
- **Servo Motor** to control the bin lid.
- **Python & Tkinter GUI** for real-time monitoring.
- **Kotlin Android App** for mobile notifications.
- **ThingSpeak & Azure IoT Hub** for cloud-based monitoring.

---

## Hardware Implementation
### Arduino Code for Garbage Level Detection & Smart Lid Control
The Arduino Uno, paired with an **HC-SR04 ultrasonic sensor**, measures the bin’s fill level. The **servo motor** automatically opens the lid when an object is detected nearby.

```cpp
#include <Servo.h>

Servo s1;
const int trigPin = 7;
const int echoPin = 8;
const int doorTrigPin = 11;
const int doorEchoPin = 12;
const int MAX_CAPACITY_CM = 22;
const int DOOR_DISTANCE_THRESHOLD = 10;

void setup() {
  Serial.begin(9600);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(doorTrigPin, OUTPUT);
  pinMode(doorEchoPin, INPUT);
  s1.attach(10);
}

void loop() {
  long duration, cm;
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  duration = pulseIn(echoPin, HIGH);
  cm = duration / 29 / 2;
  Serial.println(cm);
  delay(100);
}
```

### WiFi Connectivity with ESP8266
The **ESP8266 module** enables real-time data transmission to a laptop or cloud.

```cpp
#include <ESP8266WiFi.h>

const char* ssid = "wifi_name";
const char* password = "12345678";
const char* serverIP = "laptop_wifi_adapter_IP";
const int serverPort = 1234;
WiFiClient client;

void setup() {
  Serial.begin(9600);
  WiFi.begin(ssid, password);
}

void loop() {
  if (Serial.available() > 0) {
    int distance = Serial.parseInt();
    if (distance >= 0 && distance <= 400) {
      sendToLaptop(distance);
    }
  }
}

void sendToLaptop(int distance) {
  if (!client.connected()) {
    if (!client.connect(serverIP, serverPort)) return;
  }
  client.println(distance);
}
```

---

## Cloud Integration with ThingSpeak & Azure IoT Hub
### Sending Data to ThingSpeak
Data is published to **ThingSpeak** via MQTT.

```python
def send_to_thingspeak(data):
    topic = "channels/" + CHANNEL_ID + "/publish"
    payload = "field1=" + str(data)
    publish.single(topic, payload, hostname=MQTT_HOST, auth={"username": MQTT_USERNAME, "password": MQTT_PASSWORD})
```

### Sending Data to Azure IoT Hub
For scalable IoT integration, data is sent to **Azure IoT Hub**.

```python
from azure.iot.device.aio import IoTHubDeviceClient
async def send_to_azure_iot_hub(data):
    device_client = IoTHubDeviceClient.create_from_connection_string(CONNECTION_STRING)
    await device_client.connect()
    await device_client.send_message(data)
    await device_client.disconnect()
```

---

## GUI for Real-Time Monitoring
### Tkinter-based Desktop App
A Python **Tkinter** application provides a user-friendly interface to monitor bin levels.

```python
import tkinter as tk
root = tk.Tk()
root.title("Garbage Level Monitoring")
garbage_label = tk.Label(root, text="Garbage Level: 0%")
garbage_label.pack()
root.mainloop()
```

---

## Android App Development (Kotlin)
The **Kotlin-based Android app** receives real-time bin status and sends notifications when the bin is full.

```kotlin
fun checkGarbageLevel(level: Int) {
    if (level > 80) {
        Toast.makeText(this, "Garbage bin almost full!", Toast.LENGTH_LONG).show()
    }
}
```

---

## Future Enhancements
- **AI-based Smart Sorting:** Automatic waste segregation.
- **Solar-Powered Bin:** Sustainable energy source.
- **GPS-enabled Tracking:** Optimize garbage collection routes.

## Conclusion
This smart dustbin project showcases the **power of IoT, cloud computing, and mobile app integration** in waste management. By leveraging **Arduino, Python, Kotlin, and Azure IoT**, we enhance urban sustainability.

**Check out the full project on GitHub at [Here](https://github.com/M-Hassan-Raza/arduino_smart_dustbin), [Here](https://github.com/M-Hassan-Raza/esp8266_smart_dustbin), and [Here](https://github.com/M-Hassan-Raza/smart_dustbin_edge_layer)!**