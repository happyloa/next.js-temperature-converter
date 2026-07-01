import { ImageResponse } from "next/og";

export const alt = "溫度工作室 - Temperature Studio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadGoogleFont(text: string, weight: number) {
  const url = `https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const match = css.match(
    /src: url\(([^)]+)\) format\('(?:opentype|truetype)'\)/,
  );

  if (match) {
    const response = await fetch(match[1]);
    if (response.ok) {
      return await response.arrayBuffer();
    }
  }

  throw new Error("無法載入 Noto Sans TC 字型資料");
}

export default async function OpengraphImage() {
  const title = "溫度工作室";
  const subtitleZh = "溫度轉換．全球天氣．智慧洞察";
  const subtitleEn = "Temperature Intelligence Platform";
  const units = ["°C", "°F", "K"];
  const allText = title + subtitleZh + subtitleEn + units.join("");

  const [regular, bold] = await Promise.all([
    loadGoogleFont(allText, 400),
    loadGoogleFont(allText, 700),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f172a",
          position: "relative",
          fontFamily: '"Noto Sans TC"',
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -160,
            width: 500,
            height: 500,
            borderRadius: 500,
            backgroundColor: "rgba(56, 189, 248, 0.18)",
            filter: "blur(120px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -180,
            left: -140,
            width: 480,
            height: 480,
            borderRadius: 480,
            backgroundColor: "rgba(56, 189, 248, 0.12)",
            filter: "blur(120px)",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 24px",
            borderRadius: 999,
            border: "1px solid rgba(56, 189, 248, 0.4)",
            backgroundColor: "rgba(14, 116, 144, 0.25)",
            color: "#38bdf8",
            fontSize: 26,
            marginBottom: 36,
          }}
        >
          <span>⚡</span>
          <span>{subtitleEn}</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
          }}
        >
          <span style={{ fontSize: 96, display: "flex" }}>🌡️</span>
          <span
            style={{
              fontSize: 108,
              fontWeight: 700,
              color: "#f8fafc",
              letterSpacing: -2,
            }}
          >
            {title}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 34,
            color: "#94a3b8",
          }}
        >
          {subtitleZh}
        </div>

        <div
          style={{
            display: "flex",
            gap: 20,
            marginTop: 56,
          }}
        >
          {units.map((unit) => (
            <div
              key={unit}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 28px",
                borderRadius: 999,
                border: "1px solid rgba(71, 85, 105, 0.6)",
                backgroundColor: "rgba(2, 6, 23, 0.65)",
                color: "#e2e8f0",
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              {unit}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Noto Sans TC", data: regular, weight: 400, style: "normal" },
        { name: "Noto Sans TC", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
