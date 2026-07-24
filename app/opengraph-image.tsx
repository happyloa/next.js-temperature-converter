import { ImageResponse } from "next/og";

export const alt = "Temperature Studio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#0c1210",
        color: "#edf5f1",
        padding: "72px 84px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 28,
          color: "#93a39c",
        }}
      >
        <span>Temperature Studio</span>
        <span>CONVERT / WEATHER / INSIGHT</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", fontSize: 86, fontWeight: 700 }}>
          Temperature, made clear.
        </div>
        <div style={{ display: "flex", fontSize: 34, color: "#c4d0cb" }}>
          Six scales, global weather and practical context in one workspace.
        </div>
      </div>
      <div style={{ display: "flex", gap: 18 }}>
        {["CELSIUS", "FAHRENHEIT", "KELVIN", "RANKINE"].map((label) => (
          <span
            key={label}
            style={{
              display: "flex",
              border: "1px solid #2c3c35",
              borderRadius: 8,
              padding: "12px 18px",
              fontSize: 20,
              color: "#edf5f1",
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>,
    size,
  );
}
