export async function copyText(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Permission and browser-policy failures can still use the legacy path.
    }
  }

  if (typeof document === "undefined") {
    throw new Error("Clipboard is unavailable");
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  let succeeded = false;
  try {
    succeeded =
      typeof document.execCommand === "function" &&
      document.execCommand("copy");
  } finally {
    textarea.remove();
  }
  if (!succeeded) throw new Error("Clipboard copy failed");
}
