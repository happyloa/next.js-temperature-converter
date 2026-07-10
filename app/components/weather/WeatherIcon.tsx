import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
} from "lucide-react";

import { getWeatherIconKind } from "../../lib/weather";

export function WeatherIcon({
  code,
  isDay,
  className,
}: {
  code: number;
  isDay: boolean;
  className?: string;
}) {
  const kind = getWeatherIconKind(code);
  const props = { className, "aria-hidden": true } as const;

  if (kind === "clear") return isDay ? <Sun {...props} /> : <Moon {...props} />;
  if (kind === "partly-cloudy")
    return isDay ? <CloudSun {...props} /> : <CloudMoon {...props} />;
  if (kind === "cloudy") return <Cloud {...props} />;
  if (kind === "fog") return <CloudFog {...props} />;
  if (kind === "snow") return <CloudSnow {...props} />;
  if (kind === "storm") return <CloudLightning {...props} />;
  return <CloudRain {...props} />;
}
