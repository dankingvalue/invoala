"use client";

import { useEffect } from "react";

// The root layout's <html lang="en"> is static — Next's App Router only
// allows one root layout to own <html>, and moving every existing English
// route under app/[lang]/ to parametrize it would be a large, risky
// restructuring of ~150 live pages for a handful of translated ones. This
// sets the attribute correctly after mount instead, which is what matters
// for screen readers and browser "translate this page" prompts; hreflang
// tags (not this attribute) are what search engines use to serve the right
// language variant.
export function SetHtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = "en";
    };
  }, [lang]);
  return null;
}
