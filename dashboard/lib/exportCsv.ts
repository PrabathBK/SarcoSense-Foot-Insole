import { RecordedSample } from "@/types";

/**
 * Formats a timestamp into Sri Lanka Standard Time (SLST, UTC+05:30)
 * in readable format: YYYY-MM-DD HH:mm:ss.SSS
 */
export function formatSriLankaTime(timestamp: number): string {
  const slDate = new Date(timestamp + 5.5 * 60 * 60 * 1000);
  const year = slDate.getUTCFullYear();
  const month = String(slDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(slDate.getUTCDate()).padStart(2, "0");
  const hours = String(slDate.getUTCHours()).padStart(2, "0");
  const minutes = String(slDate.getUTCMinutes()).padStart(2, "0");
  const seconds = String(slDate.getUTCSeconds()).padStart(2, "0");
  const ms = String(slDate.getUTCMilliseconds()).padStart(3, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${ms}`;
}

export function exportSessionToCSV(
  samples: RecordedSample[],
  patientId: string,
  patientName: string
) {
  if (!samples || samples.length === 0) {
    alert("No sensor samples captured to export.");
    return;
  }

  const headers = [
    "timestamp_ms",
    "local_time_sl",
    "patient_id",
    "patient_name",
    "foot",
    "fsr_16",
    "fsr_15",
    "fsr_14",
    "fsr_13",
    "fsr_12",
    "fsr_11",
    "fsr_10",
    "fsr_9",
    "fsr_8",
    "fsr_7",
    "fsr_6",
    "fsr_5",
    "fsr_4",
    "fsr_3",
    "fsr_2",
    "fsr_1",
    "accel_x",
    "accel_y",
    "accel_z",
    "gyro_x",
    "gyro_y",
    "gyro_z",
  ];

  const rows: string[] = [headers.join(",")];

  samples.forEach((sample) => {
    const slTime = formatSriLankaTime(sample.timestamp);

    // If sample has left foot data
    if (sample.left) {
      const fsr = sample.left.fsr;
      const imu = sample.left.imu;
      rows.push(
        [
          sample.timestamp,
          `"${slTime}"`,
          `"${patientId}"`,
          `"${patientName.replace(/"/g, '""')}"`,
          "left",
          ...fsr,
          imu.ax,
          imu.ay,
          imu.az,
          imu.gx,
          imu.gy,
          imu.gz,
        ].join(",")
      );
    }

    // If sample has right foot data
    if (sample.right) {
      const fsr = sample.right.fsr;
      const imu = sample.right.imu;
      rows.push(
        [
          sample.timestamp,
          `"${slTime}"`,
          `"${patientId}"`,
          `"${patientName.replace(/"/g, '""')}"`,
          "right",
          ...fsr,
          imu.ax,
          imu.ay,
          imu.az,
          imu.gx,
          imu.gy,
          imu.gz,
        ].join(",")
      );
    }
  });

  const csvContent = rows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const cleanPatientId = patientId.replace(/[^a-zA-Z0-9_-]/g, "_");
  const slNow = formatSriLankaTime(Date.now()).replace(/[:.]/g, "-").replace(" ", "_");
  const fileName = `sarco_gait_${cleanPatientId}_${slNow}.csv`;

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

