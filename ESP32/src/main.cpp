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
    delayMicroseconds(20);
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
  for (int i = 15; i >= 0; i--) {
    payload += String(fsrValues[i]);
    if (i > 0)
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
