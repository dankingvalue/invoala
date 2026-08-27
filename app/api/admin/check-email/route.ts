export const dynamic = "force-dynamic";
export async function GET() {
  const v = process.env.ADMIN_EMAIL;
  return Response.json({ has: !!v, len: v?.length, first3: v?.substring(0, 3) });
}
