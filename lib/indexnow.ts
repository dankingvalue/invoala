import { SITE_URL } from "@/lib/seo";

// public/914e6d604e87440c9626f87883b504ef.txt is the verification file this
// key must match — IndexNow checks that <host>/<key>.txt exists and its
// body equals this exact string before accepting a submission.
const INDEXNOW_KEY = "914e6d604e87440c9626f87883b504ef";

export async function submitToIndexNow(urls: string[]): Promise<{ ok: boolean; status: number; error?: string }> {
  if (urls.length === 0) return { ok: true, status: 200 };
  const host = new URL(SITE_URL).host;

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
      signal: AbortSignal.timeout(15000),
    });
    // IndexNow returns 200 (processed) or 202 (accepted) on success; no body.
    if (res.ok || res.status === 202) return { ok: true, status: res.status };
    return { ok: false, status: res.status, error: `IndexNow responded ${res.status}` };
  } catch (err) {
    return { ok: false, status: 0, error: err instanceof Error ? err.message : "Network error" };
  }
}
