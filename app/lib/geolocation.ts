const POSITION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000,
};

export const requestCurrentPosition = (
  geolocation: Geolocation,
): Promise<GeolocationPosition> =>
  new Promise((resolve, reject) => {
    geolocation.getCurrentPosition(resolve, reject, POSITION_OPTIONS);
  });

export const getGeolocationErrorMessage = (error: unknown): string => {
  const code = (error as Partial<GeolocationPositionError> | null)?.code;

  switch (code) {
    case 1:
      return "位置存取權限被拒絕，請在瀏覽器設定中允許";
    case 2:
      return "無法取得位置資訊";
    case 3:
      return "取得位置逾時，請再試一次";
    default:
      return "取得位置時發生錯誤";
  }
};
