export function initializeCopyEmail(
  root: Pick<Document, "querySelector"> = document,
  clipboard: Pick<Clipboard, "writeText"> | undefined = navigator.clipboard,
) {
  const button = root.querySelector<HTMLButtonElement>("[data-copy-email]");
  const status = root.querySelector<HTMLElement>("[data-copy-status]");
  const email = button?.dataset.copyEmail;
  if (!button || !status || !email) return;

  button.hidden = false;
  button.addEventListener("click", async () => {
    status.textContent = "";

    try {
      if (!clipboard) throw new Error("Clipboard unavailable");
      await clipboard.writeText(email);
      status.textContent = "Email copied.";
    } catch {
      status.textContent = "Copy unavailable. Select the address to copy it.";
    }
  });
}
