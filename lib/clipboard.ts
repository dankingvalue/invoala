// The async Clipboard API requires a "fresh" user gesture in several
// browsers (notably Safari) — if anything async (a fetch, another await)
// happens between the click and the writeText() call, it throws, even
// though the click itself genuinely started the flow. Every "copy link"
// action in this app fetches a share token first, so it always hits this.
// The legacy execCommand path has no such freshness requirement and is
// still universally supported as a synchronous fallback.
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fall through
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
