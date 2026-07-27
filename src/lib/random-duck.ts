export const RANDOM_DUCK_IMAGE_ENDPOINT =
  "https://random-d.uk/api/v2/randomimg?type=jpg";

export async function initializeRandomDuck(
  root: Pick<Document, "querySelector"> = document,
) {
  const frame = root.querySelector<HTMLElement>("[data-duck-frame]");
  const image = root.querySelector<HTMLImageElement>("[data-duck-image]");
  const status = root.querySelector<HTMLElement>("[data-duck-status]");

  if (!frame || !image || !status) return false;

  const showError = () => {
    frame.dataset.state = "error";
    frame.setAttribute("aria-busy", "false");
    image.hidden = true;
    status.hidden = false;
    status.textContent = "The emergency duck has temporarily waddled off.";
  };

  image.addEventListener(
    "load",
    () => {
      frame.dataset.state = "ready";
      frame.setAttribute("aria-busy", "false");
      image.hidden = false;
      status.hidden = true;
    },
    { once: true },
  );
  image.addEventListener("error", showError, { once: true });
  image.src = RANDOM_DUCK_IMAGE_ENDPOINT;

  return true;
}
