import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-[72px] font-extrabold text-[#e5e7eb]">404</p>
      <h1 className="mt-2 text-[28px] font-bold tracking-tight">Page not found</h1>
      <p className="mt-3 max-w-[420px] text-[16px] text-[#6b7280]">
        The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
      </p>
      <form
        action="https://www.google.com/search"
        method="get"
        className="mt-6 w-full max-w-[400px]"
        role="search"
      >
        <label htmlFor="site-search" className="sr-only">Search invoala.com</label>
        <div className="flex gap-2">
          <input
            id="site-search"
            type="text"
            name="q"
            required
            placeholder="Search invoala.com…"
            className="w-full rounded-lg border border-[#e5e7eb] bg-white px-4 py-2.5 text-[14px] text-[#111827] outline-none placeholder:text-[#6b7280] focus:border-[#166534] focus:ring-[3px] focus:ring-[#166534]/20"
          />
          <input type="hidden" name="as_sitesearch" value="invoala.com" />
          <button
            type="submit"
            className="rounded-lg bg-[#14532d] px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#0f3d22]"
          >
            Search
          </button>
        </div>
      </form>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-[#14532d] px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-[#0f3d22]"
        >
          Go home
        </Link>
        <Link
          href="/#generate"
          className="rounded-lg border border-[#e5e7eb] px-6 py-3 text-[15px] font-semibold text-[#111827] transition hover:bg-[#f3f4f6]"
        >
          Create an invoice
        </Link>
        <Link
          href="/learn"
          className="rounded-lg border border-[#e5e7eb] px-6 py-3 text-[15px] font-semibold text-[#111827] transition hover:bg-[#f3f4f6]"
        >
          Learning center
        </Link>
      </div>
      <div className="mt-10 max-w-[400px]">
        <p className="mb-3 text-[13px] font-medium text-[#6b7280]">Popular pages</p>
        <div className="grid grid-cols-2 gap-2 text-[14px]">
          <Link href="/invoice-generator" className="rounded-lg border border-[#e5e7eb] px-4 py-2 hover:bg-[#f3f4f6]">Invoice Generator</Link>
          <Link href="/invoicing-software" className="rounded-lg border border-[#e5e7eb] px-4 py-2 hover:bg-[#f3f4f6]">Invoicing Software</Link>
          <Link href="/templates" className="rounded-lg border border-[#e5e7eb] px-4 py-2 hover:bg-[#f3f4f6]">Templates</Link>
          <Link href="/learn" className="rounded-lg border border-[#e5e7eb] px-4 py-2 hover:bg-[#f3f4f6]">Learning Center</Link>
          <Link href="/pricing" className="rounded-lg border border-[#e5e7eb] px-4 py-2 hover:bg-[#f3f4f6]">Pricing</Link>
          <Link href="/compare" className="rounded-lg border border-[#e5e7eb] px-4 py-2 hover:bg-[#f3f4f6]">Comparisons</Link>
        </div>
      </div>
    </main>
  );
}
