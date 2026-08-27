export async function GET() {
  const adminEmail = process.env.ADMIN_EMAIL;
  return Response.json({
    hasAdminEmail: !!adminEmail,
    adminEmailValue: adminEmail ? adminEmail.substring(0, 3) + "***" : null,
    length: adminEmail?.length,
  });
}
