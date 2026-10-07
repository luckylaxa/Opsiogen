export type Theme = "light" | "dark";

/** localStorage key for the visitor's choice. */
export const THEME_KEY = "theme";

/** Browser bar colour per theme, matching the ticker at the top. */
export const THEME_BAR: Record<Theme, string> = { light: "#e9e9e9", dark: "#181818" };

/** Runs in <head> before the first paint, so a saved dark choice shows without a flash. */
export const THEME_SCRIPT = `try{if(localStorage.getItem("${THEME_KEY}")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;
