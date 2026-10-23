import { RecordedSample } from "@/types";

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
    "iso_time",
    "patient_id",
    "patient_name",
    "foot",
    "pin_1_forefoot_medial",
    "pin_2_midfoot_medial",
    "pin_3_lowermid_medial",
    "pin_4_arch_medial",
    "pin_5_midfoot_center",
    "pin_6_lowermid_center",
    "pin_8_arch_center",
    "pin_9_forefoot_center",
    "pin_11_big_toe",
    "pin_12_lesser_toe",
    "pin_13_forefoot_lateral",
    "pin_14_midfoot_lateral",
    "pin_16_heel_lateral",
    "pin_17_heel_medial",
    "pin_18_arch_lateral",
    "pin_19_lowermid_lateral",
    "accel_x",
    "accel_y",
    "accel_z",
    "gyro_x",
    "gyro_y",
    "gyro_z",
  ];

  const rows: string[] = [headers.join(",")];

  samples.forEach((sample) => {
    const isoTime = new Date(sample.timestamp).toISOString();

    // If sample has left foot data
    if (sample.left) {
      const fsr = sample.left.fsr;
      const imu = sample.left.imu;
      rows.push(
        [
          sample.timestamp,
          `"${isoTime}"`,
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
          `"${isoTime}"`,
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
  const timestampStr = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `sarco_gait_${cleanPatientId}_${timestampStr}.csv`;

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

