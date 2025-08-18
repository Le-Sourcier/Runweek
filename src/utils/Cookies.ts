// utils/cookies.ts
export const setCookie = (
  name: string,
  value: string,
  options: { [key: string]: any } = {}
) => {
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  for (const [key, optionValue] of Object.entries(options)) {
    if (optionValue === true) {
      cookie += `; ${key}`;
    } else if (optionValue !== false) {
      cookie += `; ${key}=${optionValue}`;
    }
  }

  document.cookie = cookie;
};

export const getCookie = (name: string): string | undefined => {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=");
    if (decodeURIComponent(cookieName) === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return undefined;
};

export const removeCookie = (name: string) => {
  document.cookie = `${encodeURIComponent(
    name
  )}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};
