// HiveMQ Web Client: https://www.hivemq.com/demos/websocket-client/

#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

Adafruit_MPU6050 mpu;

// ===========================
// Insole Configuration
// ===========================
// Set to "right" or "left" depending on which insole this firmware is flashed to:
#define FOOT_SIDE "left"

// ===========================
// Forward Declarations
// ===========================
void connectWiFi();
void reconnectMQTT();
void selectChannel(byte channel);

// ===========================
// WiFi Settings
// ===========================
const char* ssid = "Hi 2024";
const char* password = "26262626";

// ===========================
// MQTT Settings
// ===========================
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;
const char* mqtt_topic = "smart_insole/" FOOT_SIDE;
const char* mqtt_test_topic = "smart_insole/test";

WiFiClient espClient;
PubSubClient client(espClient);

// ===========================
// CD74HC4067 pins
// ===========================
const int S0 = 19;
const int S1 = 18;
const int S2 = 17;
const int S3 = 16;

const int SIG = 34;

// Mapping of 16 active insole pins to CD74HC4067 MUX channels
// Ordered by Pin Number: [1, 2, 3, 4, 5, 6, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19]
// Pin 1->C15, Pin 2->C7, Pin 3->C11, Pin 4->C3, Pin 5->C13, Pin 6->C5, Pin 8->C9, Pin 9->C1,
// Pin 11->C14 (Big Toe), Pin 12->C6 (Lesser Toe), Pin 13->C10, Pin 14->C2, Pin 16->C12, Pin 17->C4, Pin 18->C8, Pin 19->C0
const byte PIN_CHANNELS[16] = {15, 7, 11, 3, 13, 5, 9, 1, 14, 6, 10, 2, 12, 4, 8, 0};

int fsrValues[16];

void setup() {
  Serial.begin(115200);

  // Multiplexer pins
  pinMode(S0, OUTPUT);
  pinMode(S1, OUTPUT);
  pinMode(S2, OUTPUT);
  pinMode(S3, OUTPUT);

  // ADC setup
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  // MPU6050
  Wire.begin(21, 22);

  if (!mpu.begin()) {
    Serial.println("MPU6050 not found!");
    while (1) {
      delay(100);
    }
  }

  Serial.println("MPU6050 initialized");
  Serial.print("Insole configured for: ");
  Serial.println(FOOT_SIDE);

  // WiFi
  connectWiFi();

  // MQTT
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnectMQTT();
  }

  client.loop();

  // ======================
  // Read 16 FSR sensors
  // ======================
  for (int channel = 0; channel < 16; channel++) {
    selectChannel(channel);
    // Allow MUX output to settle before sampling:
    // 20µs was too short — C9/C1 and C14/C6 pairs differ only in S3,
    // causing ADC to read residual charge from the previous channel.
    // 500µs ensures full RC settling on the SIG line (16 × 500µs = 8ms << 50ms loop).
    delayMicroseconds(500);
    // Dummy read to flush ADC sample-and-hold capacitor from previous channel
    analogRead(SIG);
    delayMicroseconds(100);
    fsrValues[channel] = analogRead(SIG);
  }

  // ======================
  // Read MPU6050
  // ======================
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  // ======================
  // Create JSON payload
  // ======================
  String payload = "{";
  payload += "\"foot\":\"" FOOT_SIDE "\",";
  payload += "\"ts\":" + String(millis()) + ",";

  payload += "\"fsr\":[";
  for (int i = 0; i < 16; i++) {
    payload += String(fsrValues[PIN_CHANNELS[i]]);
    if (i < 15)
      payload += ",";
  }
  
  payload += "],";

  payload += "\"ax\":" + String(a.acceleration.x, 2) + ",";
  payload += "\"ay\":" + String(a.acceleration.y, 2) + ",";
  payload += "\"az\":" + String(a.acceleration.z, 2) + ",";

  payload += "\"gx\":" + String(g.gyro.x, 2) + ",";
  payload += "\"gy\":" + String(g.gyro.y, 2) + ",";
  payload += "\"gz\":" + String(g.gyro.z, 2);

  payload += "}";

  // Publish to specific topic (e.g. smart_insole/right) and also test topic
  client.publish(mqtt_topic, payload.c_str());
  client.publish(mqtt_test_topic, payload.c_str());

  // Serial monitor output
  Serial.println(payload);

  delay(50); // ~20 Hz
}

// ======================
// Select MUX channel
// ======================
void selectChannel(byte channel) {
  digitalWrite(S0, bitRead(channel, 0));
  digitalWrite(S1, bitRead(channel, 1));
  digitalWrite(S2, bitRead(channel, 2));
  digitalWrite(S3, bitRead(channel, 3));
}

// ======================
// WiFi Connection
// ======================
void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi connected");
  Serial.println(WiFi.localIP());
}

// ======================
// MQTT Reconnect
// ======================
void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");

    String clientId = "ESP32_Insole_" FOOT_SIDE "_";
    clientId += String(random(0xffff), HEX);

    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" retrying in 5 seconds");
      delay(5000);
    }
  }
}
