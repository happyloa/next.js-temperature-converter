/**
 * 空氣品質的補充資訊。
 */
export type WeatherAirQuality = {
  aqi: number;
  aqiUnit: string;
  pm25: number;
  pm25Unit: string;
  pm10: number;
  pm10Unit: string;
  time: string;
};

/**
 * 單日預報資料。
 */
export type DailyForecast = {
  date: string;
  high: number;
  low: number;
};

/**
 * 整合 Open-Meteo 預報、地理與空氣品質資料後的儀表板資料結構。
 */
export type WeatherData = {
  location: string;
  administrative: string[];
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
  timezone: string;
  timezoneAbbreviation: string;
  observationTime: string;
  temperature: number;
  temperatureUnit: string;
  apparentTemperature: number;
  apparentTemperatureUnit: string;
  humidity: number;
  humidityUnit: string;
  windSpeed: number;
  windSpeedUnit: string;
  pressure: number;
  pressureUnit: string;
  precipitation: number;
  precipitationUnit: string;
  uvIndex: number;
  uvIndexUnit: string;
  weatherCode: number;
  isDay: boolean;
  dailyHigh: number;
  dailyLow: number;
  dailyTemperatureUnit: string;
  airQuality: WeatherAirQuality | null;
  localTime: string | null;
  utcOffset: string | null;
  dayOfWeek: number | null;
  dailyForecast: DailyForecast[];
};
