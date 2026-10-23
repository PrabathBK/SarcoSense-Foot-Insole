export interface MQTTConfig {
  url: string;
  options: {
    clientId: string;
    clean: boolean;
    connectTimeout: number;
    reconnectPeriod: number;
    keepalive: number;
  };
  topics: {
    left: string;
    right: string;
    test: string;
  };
}

export function getMQTTConfig(): MQTTConfig {
  const host = process.env.NEXT_PUBLIC_MQTT_HOST || "broker.hivemq.com";
  const port = process.env.NEXT_PUBLIC_MQTT_PORT || "8884";
  const protocol = process.env.NEXT_PUBLIC_MQTT_PROTOCOL || "wss";
  const path = process.env.NEXT_PUBLIC_MQTT_PATH || "/mqtt";

  const randomId = Math.random().toString(16).substring(2, 10);
  const clientId = `sarco_web_${randomId}`;

  return {
    url: `${protocol}://${host}:${port}${path}`,
    options: {
      clientId,
      clean: true,
      connectTimeout: 8000,
      reconnectPeriod: 3000,
      keepalive: 60,
    },
    topics: {
      left: process.env.NEXT_PUBLIC_MQTT_TOPIC_LEFT || "smart_insole/left",
      right: process.env.NEXT_PUBLIC_MQTT_TOPIC_RIGHT || "smart_insole/right",
      test: process.env.NEXT_PUBLIC_MQTT_TOPIC_TEST || "smart_insole/test",
    },
  };
}

