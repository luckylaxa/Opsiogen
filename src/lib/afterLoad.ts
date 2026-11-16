/**
 * Run once the page has finished loading, its main image included, so a video
 * near the top never competes with that image for the connection. Returns a
 * function that cancels the wait.
 */
export function afterPageLoad(run: () => void): () => void {
  if (document.readyState === "complete") {
    run();
    return () => {};
  }
  window.addEventListener("load", run, { once: true });
  return () => window.removeEventListener("load", run);
}
