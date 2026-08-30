import { getFlags } from "@/lib/flags.server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { flags, announcement } = await getFlags();
  return Response.json(
    {
      flags: {
        aiComposer: flags.aiComposer,
        printButton: flags.printButton,
        logoUpload: flags.logoUpload,
        quoteMode: flags.quoteMode,
        recurringTerms: flags.recurringTerms,
      },
      announcement,
    },
    {
      headers: { "Cache-Control": "no-store, max-age=0" },
    }
  );
}
