# 🦶 SarcoSense — Smart Insole Plantar Pressure & Gait Monitoring Dashboard

Real-time plantar pressure distribution, bilateral balance, and 6-DOF inertial kinematics dashboard engineered for clinical sarcopenia assessment.

---

## 🚀 Quick Start

From the `dashboard` directory:

```bash
# Install dependencies (already completed)
npm install

# Start the local development server
npm run dev
```

Open your browser to: **[http://localhost:3000](http://localhost:3000)**

---

## 🌐 Operating Portals

| Portal | URL | Description |
|---|---|---|
| **Portal Selection** | `http://localhost:3000/` | Central gateway to choose Demo or Clinical mode |
| **Demo Mode** | `http://localhost:3000/demo` | Full engineering view: Dual insole heatmaps, rolling 6-DOF IMU graphs, raw 16-channel FSR matrix table, and trial capture |
| **Clinical Mode** | `http://localhost:3000/clinical` | Streamlined for clinicians: Subject intake, real-time BMI engine, bilateral balance ratio, protocol instructions, and session archiving |

---

## 📡 Real-Time Data Pipeline (MQTT over WebSocket)

```
Physical Insole (ESP32)
   │  (20 Hz JSON via WiFi)
   ▼
broker.hivemq.com:1883 (MQTT)
   │
   ▼
wss://broker.hivemq.com:8884/mqtt (WebSocket)
   │
   ▼
Browser (mqtt.js) ──► Zustand In-Memory Store ──► React Heatmaps & Oscilloscopes
                               │
                               ▼ (on user action: Save / Export)
                      Firebase Firestore & CSV File
```

### MQTT Topics
- `smart_insole/right`: Dedicated topic for the Right Insole
- `smart_insole/left`: Dedicated topic for the Left Insole
- `smart_insole/test`: Backward-compatibility fallback topic

### JSON Packet Format
```json
{
  "foot": "right",
  "ts": 145920,
  "fsr": [0, 0, 116, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  "ax": 0.33, "ay": 1.02, "az": 9.70,
  "gx": 0.00, "gy": 0.00, "gz": 0.02
}
```

---

## 👣 16-Channel Sensor Anatomical Mapping

The sensor array corresponds directly to `foot-numbered.jpeg`.
Formula linking incoming array index to sensor numbers: `index = 16 - sensorNumber` (or `sensorNumber = 16 - index`):

| Row | Anatomical Area | Left Column | Center Column | Right Column |
|---|---|---|---|---|
| **Row 1** | Toes | **#10** (`fsr[6]`) | — | **#2** (`fsr[14]`) |
| **Row 2** | Metatarsals | **#6** (`fsr[10]`) | **#15** (`fsr[1]`) | **#1** (`fsr[15]`) |
| **Row 3** | Anterior Midfoot | **#14** (`fsr[2]`) | **#3** (`fsr[13]`) | **#9** (`fsr[7]`) |
| **Row 4** | Midfoot Arch | **#16** (`fsr[0]`) | **#11** (`fsr[5]`) | **#5** (`fsr[11]`) |
| **Row 5** | Heel-Lead | **#8** (`fsr[8]`) | **#7** (`fsr[9]`) | **#13** (`fsr[3]`) |
| **Row 6** | Heel | **#4** (`fsr[12]`) | — | **#12** (`fsr[4]`) |

---

## 📊 Research CSV Export Schema

Clicking **"Export CSV"** downloads a timestamped dataset (`sarco_gait_{patientId}_{timestamp}.csv`):

```csv
timestamp_ms,iso_time,patient_id,patient_name,foot,fsr_16,fsr_15,...,fsr_1,accel_x,accel_y,accel_z,gyro_x,gyro_y,gyro_z
```

---

## ⚡ ESP32 Firmware Instructions

Firmware code is located at [`ESP32/src/main.cpp`](file:///Users/prabathwijethilaka/Downloads/Sarcopenia/ESP32/src/main.cpp).

### Configuring Insole Side:
At the top of `ESP32/src/main.cpp`:
```cpp
// Change to "left" when flashing the Left foot board:
#define FOOT_SIDE "right"
```

### Uploading with PlatformIO:
1. Hold the `BOOT` button on the ESP32.
2. Tap the `EN` (Reset) button.
3. Release the `BOOT` button.
4. Run:
```bash
cd ESP32 && pio run --target upload
```
