import { describe, expect, it, vi } from "vitest";
import { initializeCopyEmail } from "../src/lib/copy-email";

function fixture() {
  let copy = async () => {};
  const button = {
    dataset: { copyEmail: "public@example.org" },
    hidden: true,
    addEventListener(_name: string, listener: () => Promise<void>) {
      copy = listener;
    },
  };
  const status = { textContent: "" };
  const root = {
    querySelector: (selector: string) =>
      selector === "[data-copy-email]" ? button : status,
  } as Pick<Document, "querySelector">;

  return { root, button, status, copy: () => copy() };
}

describe("copy email", () => {
  it("reveals the button and copies the displayed public address", async () => {
    const { root, button, status, copy } = fixture();
    const writeText = vi.fn().mockResolvedValue(undefined);

    initializeCopyEmail(root, { writeText });
    await copy();

    expect(button.hidden).toBe(false);
    expect(writeText).toHaveBeenCalledWith("public@example.org");
    expect(status.textContent).toBe("Email copied.");
  });

  it("gives a usable fallback when clipboard access is denied", async () => {
    const { root, status, copy } = fixture();
    const writeText = vi.fn().mockRejectedValue(new Error("Clipboard denied"));

    initializeCopyEmail(root, { writeText });
    await copy();

    expect(status.textContent).toBe(
      "Copy unavailable. Select the address to copy it.",
    );
  });
});
