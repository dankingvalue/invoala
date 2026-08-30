"use client";

import { useEffect, useState, FormEvent } from "react";
import { Panel, SectionHead, StatCard } from "@/components/admin/Panel";

type SeoPage = {
  url: string;
  title: string;
  type: string;
  inSitemap: boolean;
  indexable: boolean;
};

type Redirect = {
  id: string;
  source: string;
  destination: string;
  status_code: number;
  active: number;
  created_by: string | null;
  created_at: number;
};

type SeoData = {
  pages: SeoPage[];
  redirects: Redirect[];
  sitemapUrl: string;
  robotsUrl: string;
  counts: Record<string, number>;
};

type SeoOverride = {
  path: string;
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  updatedAt?: number;
};

const TYPE_ORDER = ["PRODUCT", "TOOL", "TEMPLATE", "SOLUTION", "ARTICLE", "COMPARISON", "LEGAL", "PRIVATE"];

export function SeoTab() {
  const [data, setData] = useState<SeoData | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [statusCode, setStatusCode] = useState("301");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [overrides, setOverrides] = useState<SeoOverride[]>([]);
  const [selPath, setSelPath] = useState("");
  const [form, setForm] = useState({
    seoTitle: "",
    metaDescription: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    robotsIndex: true,
    robotsFollow: true,
  });
  const [savedNote, setSavedNote] = useState<{ ok: boolean; text: string } | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/seo");
      if (res.ok) setData(await res.json());
    } catch {}
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/seo")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d) setData(d);
      })
      .catch(() => {});
    fetch("/api/admin/seo/overrides")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.overrides) setOverrides(d.overrides);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  async function loadOverrides() {
    try {
      const res = await fetch("/api/admin/seo/overrides");
      if (res.ok) {
        const d = (await res.json()) as { overrides: SeoOverride[] };
        setOverrides(d.overrides);
      }
    } catch {}
  }

  function selectPage(path: string) {
    setSelPath(path);
    const ov = overrides.find((o) => o.path === path);
    setForm({
      seoTitle: ov?.seoTitle ?? "",
      metaDescription: ov?.metaDescription ?? "",
      canonicalUrl: ov?.canonicalUrl ?? "",
      ogTitle: ov?.ogTitle ?? "",
      ogDescription: ov?.ogDescription ?? "",
      ogImage: ov?.ogImage ?? "",
      robotsIndex: ov?.robotsIndex ?? true,
      robotsFollow: ov?.robotsFollow ?? true,
    });
    setSavedNote(null);
  }

  async function saveOverride() {
    setSavedNote(null);
    if (!selPath) return;
    try {
      const res = await fetch("/api/admin/seo/overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: selPath, ...form }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && json.ok) {
        setSavedNote({ ok: true, text: "Saved. Takes effect instantly on dynamic pages; other pages on next deploy." });
        await loadOverrides();
      } else {
        setSavedNote({ ok: false, text: json.error || "Failed to save." });
      }
    } catch {
      setSavedNote({ ok: false, text: "Network error." });
    }
  }

  async function clearOverride() {
    setSavedNote(null);
    if (!selPath) return;
    try {
      const res = await fetch(`/api/admin/seo/overrides?path=${encodeURIComponent(selPath)}`, { method: "DELETE" });
      const json = (await res.json()) as { ok?: boolean };
      if (res.ok && json.ok) {
        setSavedNote({ ok: true, text: "Override removed." });
        setForm({ seoTitle: "", metaDescription: "", canonicalUrl: "", ogTitle: "", ogDescription: "", ogImage: "", robotsIndex: true, robotsFollow: true });
        await loadOverrides();
      }
    } catch {}
  }

  async function addRedirect(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await fetch("/api/seo/redirects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, destination, statusCode: Number(statusCode) }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && json.ok) {
        setMsg({ ok: true, text: "Redirect saved. It takes effect within a minute." });
        setSource("");
        setDestination("");
        await load();
      } else {
        setMsg({ ok: false, text: json.error || "Failed to save." });
      }
    } catch {
      setMsg({ ok: false, text: "Network error." });
    }
  }

  async function toggle(r: Redirect) {
    await fetch("/api/seo/redirects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: r.id, source: r.source, destination: r.destination, statusCode: r.status_code, active: r.active === 0 }),
    }).catch(() => {});
    await load();
  }

  async function remove(r: Redirect) {
    await fetch(`/api/seo/redirects?id=${r.id}`, { method: "DELETE" }).catch(() => {});
    await load();
  }

  const counts = data?.counts ?? {};
  const pages = data?.pages ?? [];
  const filtered = typeFilter === "ALL" ? pages : pages.filter((p) => p.type === typeFilter);

  // SEO warnings: missing title/description, duplicates, noindex, missing OG
  const effectiveTitle = (p: SeoPage) =>
    overrides.find((o) => o.path === p.url)?.seoTitle ?? p.title;
  const warnings = pages
    .filter((p) => p.indexable)
    .flatMap((p): { url: string; type: string; label: string }[] => {
      const out: { url: string; type: string; label: string }[] = [];
      if (!effectiveTitle(p)) out.push({ url: p.url, type: p.type, label: "Missing title" });
      const dup = pages.find(
        (q) => q.url !== p.url && q.indexable && effectiveTitle(q) === effectiveTitle(p) && effectiveTitle(p)
      );
      if (dup) out.push({ url: p.url, type: p.type, label: `Duplicate title (also ${dup.url})` });
      const ov = overrides.find((o) => o.path === p.url);
      if (ov?.robotsIndex === false) out.push({ url: p.url, type: p.type, label: "Marked noindex via override" });
      return out;
    })
    .slice(0, 12);

  const selectedPage = pages.find((p) => p.url === selPath);
  const previewTitle =
    (form.seoTitle || selectedPage?.title || "Untitled page") +
    (form.seoTitle && !form.seoTitle.includes("Invoala") ? " | Invoala" : "");
  const previewUrl = form.canonicalUrl || `https://www.invoala.com${selPath}`;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Indexable pages" value={String(counts.indexable ?? 0)} />
        <StatCard label="In sitemap" value={String(counts.inSitemap ?? 0)} />
        <StatCard label="Private (noindex)" value={String(counts.private ?? 0)} />
        <StatCard label="Active redirects" value={String(counts.redirects ?? 0)} />
      </div>

      <Panel>
        <SectionHead
          title="Sitemap & robots"
          subtitle="Both are served automatically from code — check them live."
        />
        <ul className="mt-4 space-y-2 text-[14px]">
          <li>
            <a href={data?.sitemapUrl} target="_blank" rel="noopener noreferrer" className="text-[#166534] hover:underline">
              {data?.sitemapUrl ?? "sitemap.xml"}
            </a>
          </li>
          <li>
            <a href={data?.robotsUrl} target="_blank" rel="noopener noreferrer" className="text-[#166534] hover:underline">
              {data?.robotsUrl ?? "robots.txt"}
            </a>
          </li>
          <li className="text-[13px] text-[#6b7280]">
            {counts.tools ?? 0} tools · {counts.templates ?? 0} templates · {counts.solutions ?? 0} solutions ·{" "}
            {counts.articles ?? 0} articles · {counts.comparisons ?? 0} comparisons
          </li>
        </ul>
      </Panel>

      <Panel>
        <SectionHead
          title="Per-page SEO overrides"
          subtitle="Override titles, descriptions, canonicals, OG, and robots for any public page. Dynamic pages pick changes up instantly."
        />
        <div className="mt-4 grid gap-6 lg:grid-cols-[320px_1fr]">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#6b7280]" htmlFor="seo-path">
              Page
            </label>
            <select
              id="seo-path"
              value={selPath}
              onChange={(e) => selectPage(e.target.value)}
              className="w-full rounded-xl border border-[#e5e7eb] px-3.5 py-2.5 text-[14px] outline-none focus:border-[#166534]"
            >
              <option value="">Select a public page…</option>
              {pages.filter((p) => p.indexable).map((p) => (
                <option key={p.url} value={p.url}>
                  {p.url}
                </option>
              ))}
            </select>
            {overrides.length ? (
              <div className="mt-3">
                <p className="mb-1.5 text-[12px] font-medium text-[#6b7280]">Active overrides ({overrides.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {overrides.map((o) => (
                    <button
                      key={o.path}
                      type="button"
                      onClick={() => selectPage(o.path)}
                      className={`rounded-md px-2 py-1 font-mono text-[11px] transition ${selPath === o.path ? "bg-[#166534] text-white" : "bg-[#f3f4f6] text-[#6b7280] hover:text-[#111827]"}`}
                    >
                      {o.path}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="ov-title" className="mb-1.5 block text-[13px] font-medium text-[#6b7280]">SEO title</label>
                <input id="ov-title" value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} placeholder="Leave empty to keep the default" className="w-full rounded-xl border border-[#e5e7eb] px-3.5 py-2.5 text-[14px] outline-none focus:border-[#166534] focus:ring-[3px] focus:ring-[#166534]/20" />
              </div>
              <div>
                <label htmlFor="ov-canonical" className="mb-1.5 block text-[13px] font-medium text-[#6b7280]">Canonical URL</label>
                <input id="ov-canonical" value={form.canonicalUrl} onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })} placeholder="https://www.invoala.com/…" className="w-full rounded-xl border border-[#e5e7eb] px-3.5 py-2.5 text-[14px] outline-none focus:border-[#166534] focus:ring-[3px] focus:ring-[#166534]/20" />
              </div>
            </div>
            <div>
              <label htmlFor="ov-desc" className="mb-1.5 block text-[13px] font-medium text-[#6b7280]">Meta description</label>
              <textarea id="ov-desc" value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} rows={3} maxLength={180} placeholder="Leave empty to keep the default" className="w-full resize-none rounded-xl border border-[#e5e7eb] px-3.5 py-2.5 text-[14px] outline-none focus:border-[#166534] focus:ring-[3px] focus:ring-[#166534]/20" />
              <p className="mt-1 text-[11px] text-[#6b7280]">{form.metaDescription.length}/180</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="ov-og-title" className="mb-1.5 block text-[13px] font-medium text-[#6b7280]">OG title</label>
                <input id="ov-og-title" value={form.ogTitle} onChange={(e) => setForm({ ...form, ogTitle: e.target.value })} className="w-full rounded-xl border border-[#e5e7eb] px-3.5 py-2.5 text-[14px] outline-none focus:border-[#166534]" />
              </div>
              <div>
                <label htmlFor="ov-og-image" className="mb-1.5 block text-[13px] font-medium text-[#6b7280]">OG image URL</label>
                <input id="ov-og-image" value={form.ogImage} onChange={(e) => setForm({ ...form, ogImage: e.target.value })} placeholder="https://… or /path.png" className="w-full rounded-xl border border-[#e5e7eb] px-3.5 py-2.5 text-[14px] outline-none focus:border-[#166534]" />
              </div>
            </div>
            <div>
              <label htmlFor="ov-og-desc" className="mb-1.5 block text-[13px] font-medium text-[#6b7280]">OG description</label>
              <input id="ov-og-desc" value={form.ogDescription} onChange={(e) => setForm({ ...form, ogDescription: e.target.value })} className="w-full rounded-xl border border-[#e5e7eb] px-3.5 py-2.5 text-[14px] outline-none focus:border-[#166534]" />
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-[13px] font-medium text-[#6b7280]">
                <input type="checkbox" checked={form.robotsIndex} onChange={(e) => setForm({ ...form, robotsIndex: e.target.checked })} className="h-4 w-4 accent-[#166534]" />
                Indexable
              </label>
              <label className="flex items-center gap-2 text-[13px] font-medium text-[#6b7280]">
                <input type="checkbox" checked={form.robotsFollow} onChange={(e) => setForm({ ...form, robotsFollow: e.target.checked })} className="h-4 w-4 accent-[#166534]" />
                Follow links
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => void saveOverride()} disabled={!selPath} className="rounded-xl bg-[#166534] px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#14532d] disabled:opacity-40">
                Save override
              </button>
              <button type="button" onClick={() => void clearOverride()} disabled={!selPath} className="rounded-xl border border-[#e5e7eb] px-5 py-2.5 text-[14px] font-semibold text-[#d70015] transition hover:bg-[#fef2f2] disabled:opacity-40">
                Remove override
              </button>
              {savedNote ? (
                <span className={`text-[13px] ${savedNote.ok ? "text-[#00875a]" : "text-[#d70015]"}`}>{savedNote.text}</span>
              ) : null}
            </div>
          </div>
        </div>

        {selPath ? (
          <div className="mt-6 rounded-xl border border-[#e5e7eb] bg-white p-5">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-[#6b7280]">Search result preview</p>
            <p className="text-[18px] leading-snug text-[#1a0dab]">{previewTitle || "Untitled"}</p>
            <p className="mt-0.5 text-[13px] text-[#006621]">{previewUrl}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-[#4d5156]">
              {form.metaDescription || selectedPage?.title || "No description yet — search engines will pick text from the page."}
            </p>
          </div>
        ) : null}

        <div className="mt-6 border-t border-[#e5e7eb] pt-4">
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-[#6b7280]">Warnings ({warnings.length})</p>
          {warnings.length === 0 ? (
            <p className="text-[13px] text-[#00875a]">No obvious issues on indexable pages.</p>
          ) : (
            <ul className="space-y-1.5">
              {warnings.map((w, i) => (
                <li key={`${w.url}-${i}`} className="flex flex-wrap items-center gap-2 text-[13px]">
                  <span className="rounded bg-[#fef3c7] px-1.5 py-0.5 text-[11px] font-medium text-[#92400e]">{w.label}</span>
                  <code className="font-mono text-[12px] text-[#111827]">{w.url}</code>
                  <span className="text-[#9ca3af]">{w.type}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Panel>

      <Panel>
        <SectionHead title="Redirect manager" subtitle="301/308 redirects, applied globally within a minute." />
        <form onSubmit={addRedirect} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_110px_auto]">
          <input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="/old-invoice-maker"
            aria-label="Source path"
            className="w-full rounded-xl border border-[#e5e7eb] px-3.5 py-2.5 text-[14px] outline-none focus:border-[#166534] focus:ring-[3px] focus:ring-[#166534]/20"
          />
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="/invoice-generator"
            aria-label="Destination path"
            className="w-full rounded-xl border border-[#e5e7eb] px-3.5 py-2.5 text-[14px] outline-none focus:border-[#166534] focus:ring-[3px] focus:ring-[#166534]/20"
          />
          <select
            value={statusCode}
            onChange={(e) => setStatusCode(e.target.value)}
            aria-label="Status code"
            className="w-full rounded-xl border border-[#e5e7eb] px-3.5 py-2.5 text-[14px] outline-none focus:border-[#166534]"
          >
            <option value="301">301</option>
            <option value="308">308</option>
          </select>
          <button
            type="submit"
            className="rounded-xl bg-[#166534] px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#14532d]"
          >
            Add redirect
          </button>
        </form>
        {msg ? (
          <p className={`mt-3 text-[13px] ${msg.ok ? "text-[#00875a]" : "text-[#d70015]"}`}>{msg.text}</p>
        ) : null}
        {data?.redirects.length ? (
          <ul className="mt-5 space-y-2">
            {data.redirects.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-[#e5e7eb] px-3 py-2 text-[13px]">
                <code className="font-mono text-[#111827]">{r.source}</code>
                <span className="text-[#9ca3af]">&rarr;</span>
                <code className="font-mono text-[#166534]">{r.destination}</code>
                <span className="rounded bg-[#f3f4f6] px-1.5 py-0.5 text-[11px] font-medium">{r.status_code}</span>
                <button
                  type="button"
                  onClick={() => void toggle(r)}
                  className={`ml-auto rounded-md px-2 py-1 text-[12px] font-medium transition ${r.active ? "bg-[#dcfce7] text-[#166534]" : "bg-[#f3f4f6] text-[#6b7280]"}`}
                >
                  {r.active ? "Active" : "Paused"}
                </button>
                <button
                  type="button"
                  onClick={() => void remove(r)}
                  className="rounded-md px-2 py-1 text-[12px] font-medium text-[#d70015] transition hover:bg-[#fef2f2]"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-[13px] text-[#6b7280]">No redirects yet. Example: /old-invoice-maker &rarr; /invoice-generator.</p>
        )}
      </Panel>

      <Panel>
        <SectionHead title="Pages inventory" subtitle="URL, type, sitemap status, and indexability for every public page." />
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTypeFilter("ALL")}
            className={`rounded-full px-3 py-1 text-[12px] font-medium transition ${typeFilter === "ALL" ? "bg-[#166534] text-white" : "bg-[#f3f4f6] text-[#6b7280] hover:text-[#111827]"}`}
          >
            All ({pages.length})
          </button>
          {TYPE_ORDER.filter((t) => pages.some((p) => p.type === t)).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition ${typeFilter === t ? "bg-[#166534] text-white" : "bg-[#f3f4f6] text-[#6b7280] hover:text-[#111827]"}`}
            >
              {t} ({pages.filter((p) => p.type === t).length})
            </button>
          ))}
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#e5e7eb] text-[#6b7280]">
                <th className="py-2 pr-4 font-medium">URL</th>
                <th className="py-2 pr-4 font-medium">Title</th>
                <th className="py-2 pr-4 font-medium">Type</th>
                <th className="py-2 pr-4 font-medium">Sitemap</th>
                <th className="py-2 font-medium">Indexable</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.url} className="border-b border-[#f3f4f6]">
                  <td className="py-2 pr-4 font-mono text-[#166534]">{p.url}</td>
                  <td className="max-w-[280px] truncate py-2 pr-4 text-[#111827]">{p.title}</td>
                  <td className="py-2 pr-4 text-[#6b7280]">{p.type}</td>
                  <td className="py-2 pr-4">{p.inSitemap ? <Badge ok>yes</Badge> : <Badge ok={false}>no</Badge>}</td>
                  <td className="py-2">{p.indexable ? <Badge ok>yes</Badge> : <Badge ok={false}>noindex</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Badge({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${ok ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#b91c1c]"}`}>
      {children}
    </span>
  );
}
