"use client";

import { useEffect } from "react";
import { initMQTT, reconnectMQTT } from "@/lib/mqttService";
import { useSensorStore } from "@/store/sensorStore";

export function useBrokerStatus() {
  const brokerStatus = useSensorStore((s) => s.brokerStatus);
  const brokerError = useSensorStore((s) => s.brokerError);

  useEffect(() => {
    initMQTT();
  }, []);

  return {
    brokerStatus,
    brokerError,
    isConnected: brokerStatus === "connected",
    reconnect: reconnectMQTT,
  };
}

export function useMQTT() {
  const brokerStatus = useSensorStore((s) => s.brokerStatus);
  const brokerError = useSensorStore((s) => s.brokerError);
  const left = useSensorStore((s) => s.left);
  const right = useSensorStore((s) => s.right);

  useEffect(() => {
    // Initialize singleton connection on first client-side load
    initMQTT();
  }, []);

  return {
    brokerStatus,
    brokerError,
    isConnected: brokerStatus === "connected",
    left,
    right,
    reconnect: reconnectMQTT,
  };
}
