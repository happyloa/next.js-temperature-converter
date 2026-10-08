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
        backgroundColor: "#ffffff",
        color: "#161616",
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
          color: "#505050",
          borderBottom: "1px solid #d6d6d8",
          paddingBottom: 24,
        }}
      >
        <span>Temperature Studio</span>
        <span style={{ color: "#002fa7" }}>°C / °F / K</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            display: "flex",
            fontSize: 100,
            fontWeight: 700,
            letterSpacing: "-5px",
          }}
        >
          Temperature Studio
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#505050" }}>
          Six temperature scales. Weather around the world.
        </div>
      </div>
      <div style={{ display: "flex", gap: 18 }}>
        {["CELSIUS", "FAHRENHEIT", "KELVIN", "RANKINE"].map((label) => (
          <span
            key={label}
            style={{
              display: "flex",
              borderTop: "2px solid #002fa7",
              padding: "12px 18px",
              fontSize: 20,
              color: "#161616",
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
