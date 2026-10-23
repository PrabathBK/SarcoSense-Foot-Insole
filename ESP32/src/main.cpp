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

// ==========================================
// 20-Pin Connector → MUX Channel Mapping
// ==========================================
// The insole ribbon has 20 pins total.
// Pins 7, 10, 15, 20 are UNUSED (reference/ground lines → always 0).
// Active pins: 1, 2, 3, 4, 5, 6, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19
//
// Index = connector pin number - 1  (0-based)
// Value = CD74HC4067 MUX channel (0-15), or -1 for unused pin
//
// Pin  1 → C15 (Forefoot Medial)
// Pin  2 → C7  (Midfoot Medial)
// Pin  3 → C11 (Lower Mid Medial)
// Pin  4 → C3  (Arch Medial)
// Pin  5 → C13 (Midfoot Center)
// Pin  6 → C5  (Lower Mid Center)
// Pin  7 → UNUSED
// Pin  8 → C9  (Arch Center)
// Pin  9 → C1  (Forefoot Center)
// Pin 10 → UNUSED
// Pin 11 → C14 (Big Toe)
// Pin 12 → C6  (Lesser Toe)
// Pin 13 → C10 (Forefoot Lateral)
// Pin 14 → C2  (Midfoot Lateral)
// Pin 15 → UNUSED
// Pin 16 → C12 (Heel Lateral)
// Pin 17 → C4  (Heel Medial)
// Pin 18 → C8  (Arch Lateral)
// Pin 19 → C0  (Lower Mid Lateral)
// Pin 20 → UNUSED
const int PIN_MUX_CHANNEL[20] = {
  15, 7, 11, 3, 13, 5, -1, 9, 1, -1, 14, 6, 10, 2, -1, 12, 4, 8, 0, -1
};

int fsrRaw[16];   // raw MUX channel readings [C0..C15]
int fsrOut[20];   // 20-element output: fsrOut[pin-1], zeros for unused pins

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
  // Read all 16 MUX channels
  // ======================
  // C14/C6 and C9/C1 pairs differ only in S3 bit, causing ADC crosstalk.
  // Fix: 1ms settle + 2 dummy reads before each actual read.
  // Total reading time: 16 × ~1.4ms ≈ 22ms (loop runs ~20Hz with delay(30) below)
  for (int ch = 0; ch < 16; ch++) {
    selectChannel(ch);
    delayMicroseconds(1000);   // settle MUX + SIG line RC
    analogRead(SIG);            // dummy flush #1 (clears ADC sample-hold cap)
    delayMicroseconds(200);
    analogRead(SIG);            // dummy flush #2
    delayMicroseconds(100);
    fsrRaw[ch] = analogRead(SIG);
  }

  // ======================
  // Build 20-element output
  // ======================
  // fsrOut[pin-1] = value at that connector pin, 0 for unused pins 7/10/15/20.
  // This makes array index directly correspond to connector pin number.
  for (int pin = 1; pin <= 20; pin++) {
    int ch = PIN_MUX_CHANNEL[pin - 1];
    fsrOut[pin - 1] = (ch < 0) ? 0 : fsrRaw[ch];
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
  for (int i = 0; i < 20; i++) {
    payload += String(fsrOut[i]);
    if (i < 19)
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

  delay(30); // ~20 Hz (22ms reading + 30ms = ~52ms cycle)
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
