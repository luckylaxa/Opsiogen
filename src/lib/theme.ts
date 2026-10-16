export type Theme = "light" | "dark";

/** localStorage key for the visitor's choice. */
export const THEME_KEY = "theme";

/** Browser bar colour per theme, matching the hero band behind the header. */
export const THEME_BAR: Record<Theme, string> = { light: "#edeaed", dark: "#121115" };

/** Runs in <head> before the first paint, so a saved dark choice shows without a flash. */
export const THEME_SCRIPT = `try{if(localStorage.getItem("${THEME_KEY}")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;
