---
title: "Smart Dustbin: IoT with Arduino, Python, Kotlin & Azure"
date: 2025-02-16
description: "An IoT garbage monitoring system built with Arduino sensors, ESP8266 WiFi, a Python desktop dashboard, and a Kotlin Android app — and what I learned about hardware constraints."
tags: ["IoT", "Arduino", "Kotlin", "Python", "Azure", "ThingSpeak"]
---

A university project where I built a garbage bin that knows how full it is and tells you about it. An ultrasonic sensor measures the fill level, an ESP8266 sends the data over WiFi, and you can monitor it from a desktop GUI or an Android app.

## The Hardware

An Arduino Uno with an HC-SR04 ultrasonic sensor measures distance to the garbage surface. A servo motor opens the lid when someone approaches (second ultrasonic sensor detects proximity). The Arduino sends distance readings over serial to an ESP8266, which transmits them over WiFi.

```cpp
// The core measurement is simple — pulse timing to distance conversion
long duration = pulseIn(echoPin, HIGH);
long cm = duration / 29 / 2;
```

The ESP8266 connects to a laptop or cloud endpoint over TCP and forwards the readings.

## What Actually Worked

**The sensor accuracy was better than expected.** The HC-SR04 reliably measured garbage levels within 1-2cm accuracy in a 22cm bin. The math is basic physics (speed of sound / 2 for round trip), and it just works.

**ThingSpeak for quick visualization.** Publishing sensor data to ThingSpeak via MQTT gave us a real-time dashboard with almost no code. For prototyping IoT, it's hard to beat.

**The Android app was overkill but fun.** We built a Kotlin app that shows bin status and sends notifications when it's full. In practice, a simple web dashboard would've been enough, but the exercise of piping IoT data all the way to a phone notification was worth it.

## What I'd Change

**Power management was an afterthought.** The Arduino and ESP8266 run continuously, which drains batteries fast. A production system would need sleep modes — wake up, take a reading, transmit, sleep. We never implemented this because we had wall power during the demo.

**WiFi reliability.** The ESP8266 drops connections silently. Our code had a basic reconnect loop, but it wasn't robust. In a real deployment, you'd want MQTT with QoS 1 (at-least-once delivery) and proper offline buffering.

**The Azure IoT Hub integration was premature.** We added it because it sounded impressive for the project defense. ThingSpeak was doing everything we needed. Don't add cloud infrastructure complexity to a project that works fine without it.

## The Real Lesson

The hardest part of IoT isn't the code — it's the physical constraints. Sensor placement matters (mount it wrong and you measure the bin wall, not the garbage). WiFi range matters (the ESP8266 has a weak antenna). Power matters. These are problems you don't encounter in pure software projects, and they taught me more than the actual code did.

Source code: [Arduino](https://github.com/M-Hassan-Raza/arduino_smart_dustbin) | [ESP8266](https://github.com/M-Hassan-Raza/esp8266_smart_dustbin) | [Edge Layer](https://github.com/M-Hassan-Raza/smart_dustbin_edge_layer)
