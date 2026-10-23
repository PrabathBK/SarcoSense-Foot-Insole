import mqtt, { MqttClient } from "mqtt";
import { getMQTTConfig } from "./mqtt";
import { useSensorStore } from "@/store/sensorStore";
import { InsoleData, FootSide } from "@/types";

let clientInstance: MqttClient | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;
let isInitializing = false;

export function initMQTT(): MqttClient | null {
  if (typeof window === "undefined") return null;

  // If already connected or connecting, don't create a new connection
  if (clientInstance) {
    if (clientInstance.connected) {
      useSensorStore.getState().setBrokerStatus("connected");
    }
    return clientInstance;
  }

  if (isInitializing) return null;
  isInitializing = true;

  const config = getMQTTConfig();
  const store = useSensorStore.getState();
  store.setBrokerStatus("connecting");

  try {
    const client = mqtt.connect(config.url, config.options);
    clientInstance = client;
    isInitializing = false;

    client.on("connect", () => {
      console.log("[MQTT] Connected to HiveMQ broker successfully");
      useSensorStore.getState().setBrokerStatus("connected");

      const topics = [
        config.topics.right,
        config.topics.left,
        config.topics.test,
      ];

      client.subscribe(topics, { qos: 0 }, (err) => {
        if (err) {
          console.error("[MQTT] Subscription error:", err);
        } else {
          console.log("[MQTT] Subscribed to:", topics);
        }
      });
    });

    client.on("message", (topic, message) => {
      try {
        const raw = message.toString();
        const parsed = JSON.parse(raw);

        let foot: FootSide = "right";
        if (parsed.foot === "left" || parsed.foot === "right") {
          foot = parsed.foot;
        } else if (topic.endsWith("/left")) {
          foot = "left";
        } else if (topic.endsWith("/right")) {
          foot = "right";
        }

        const fsrArray: number[] = Array.isArray(parsed.fsr) ? parsed.fsr : [];
        const normalizedFsr: number[] = Array.from({ length: 16 }, (_, i) =>
          typeof fsrArray[i] === "number" ? fsrArray[i] : 0
        );

        const insoleData: InsoleData = {
          foot,
          fsr: normalizedFsr,
          ax: typeof parsed.ax === "number" ? parsed.ax : 0,
          ay: typeof parsed.ay === "number" ? parsed.ay : 0,
          az: typeof parsed.az === "number" ? parsed.az : 0,
          gx: typeof parsed.gx === "number" ? parsed.gx : 0,
          gy: typeof parsed.gy === "number" ? parsed.gy : 0,
          gz: typeof parsed.gz === "number" ? parsed.gz : 0,
          ts: typeof parsed.ts === "number" ? parsed.ts : Date.now(),
        };

        useSensorStore.getState().updateSensorData(insoleData);
      } catch (err) {
        console.warn("[MQTT] Parse error:", err);
      }
    });

    client.on("error", (err) => {
      console.error("[MQTT] Client error:", err.message);
      useSensorStore.getState().setBrokerStatus("error", err.message);
    });

    client.on("close", () => {
      useSensorStore.getState().setBrokerStatus("disconnected");
    });

    client.on("reconnect", () => {
      useSensorStore.getState().setBrokerStatus("connecting");
    });

    // Start global heartbeat watchdog
    if (!heartbeatInterval) {
      heartbeatInterval = setInterval(() => {
        useSensorStore.getState().checkHeartbeats(3000);
      }, 1000);
    }

    return client;
  } catch (err) {
    isInitializing = false;
    const msg = err instanceof Error ? err.message : "Connection failed";
    useSensorStore.getState().setBrokerStatus("error", msg);
    return null;
  }
}

export function reconnectMQTT() {
  if (clientInstance) {
    clientInstance.reconnect();
  } else {
    initMQTT();
  }
}

export function getMQTTClient(): MqttClient | null {
  return clientInstance;
}

