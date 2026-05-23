/**
 * Verifies the Impact.com affiliate API credentials in .env actually authenticate.
 * Read-only: hits GET /Mediapartners/{SID}/Campaigns?PageSize=1.
 *
 * Run manually: npm run impact:verify
 * Never prints the Auth Token.
 */
import "dotenv/config";
import { verifyImpactCredentials } from "../lib/impact/client";

async function main() {
  const sid = process.env.IMPACT_ACCOUNT_SID;
  console.log(`[impact] Verifying credentials for Account SID: ${sid ? sid.slice(0, 4) + "…" : "(missing)"}`);

  const result = await verifyImpactCredentials();
  console.log(`[impact] ok=${result.ok} status=${result.status}`);
  console.log(`[impact] ${result.message}`);

  process.exit(result.ok ? 0 : 1);
}

main().catch((err) => {
  console.error("[impact] verification crashed:", err);
  process.exit(1);
});
