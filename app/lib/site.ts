const DEFAULT_SITE_URL = "https://next-js-temperature-convert.vercel.app";

/** 解析公開網站網址；未設定時使用正式站網址，並移除結尾斜線以便組合路徑。 */
export const resolveSiteUrl = (value: string | undefined): string =>
  (value?.trim() || DEFAULT_SITE_URL).replace(/\/+$/, "");

export const SITE_URL = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
