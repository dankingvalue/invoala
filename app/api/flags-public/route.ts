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
        maintenanceMode: flags.maintenanceMode,
        signupPrompt: flags.signupPrompt,
        trustpilotStrip: flags.trustpilotStrip,
        proTeaser: flags.proTeaser,
        emailCapture: flags.emailCapture,
      },
      announcement,
    },
    {
      headers: { "Cache-Control": "no-store, max-age=0" },
    }
  );
}
