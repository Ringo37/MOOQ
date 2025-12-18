import {
  isMantineColorScheme,
  type MantineColorScheme,
  type MantineColorSchemeManager,
} from "@mantine/core";

export function cookieColorSchemeManager(): MantineColorSchemeManager {
  return {
    get: (defaultValue) => {
      if (typeof window === "undefined") {
        return defaultValue;
      }

      const value = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`color-scheme=`))
        ?.split("=")[1];

      return isMantineColorScheme(value) ? value : defaultValue;
    },

    set: (value) => {
      document.cookie = `color-scheme=${value}; max-age=31536000; path=/; SameSite=Lax`;
    },

    // eslint-disable-next-line
    subscribe: (_onUpdate) => {},

    unsubscribe: () => {},

    clear: () => {
      document.cookie = `color-scheme=; max-age=0; path=/`;
    },
  };
}

export function getColorScheme(request: Request): MantineColorScheme {
  const cookieHeader = request.headers.get("Cookie") || "";

  const match = cookieHeader.match(new RegExp(`color-scheme=([^;]+)`));
  const value = match ? match[1] : "";

  return isMantineColorScheme(value) ? value : "light";
}
