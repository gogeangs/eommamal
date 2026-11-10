// RevenueCat → Supabase: keeps public.subscriptions in step with App Store / Google Play.
// Deploy: supabase functions deploy revenuecat-webhook --no-verify-jwt
// Secrets: supabase secrets set REVENUECAT_WEBHOOK_AUTH=<the Authorization value set in RevenueCat>
// In RevenueCat: Integrations → Webhooks → URL https://<project>.supabase.co/functions/v1/revenuecat-webhook
// The app calls Purchases.logIn(<Supabase user id>), so app_user_id is the family id.
import { createClient } from 'npm:@supabase/supabase-js@2.49.10';

const ENTITLEMENT = 'family';

Deno.serve(async (req) => {
  if (req.headers.get('Authorization') !== Deno.env.get('REVENUECAT_WEBHOOK_AUTH')) {
    return new Response('unauthorized', { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const e = body?.event;
  if (!e?.app_user_id) return new Response('ignored', { status: 200 });

  const familyId: string = e.app_user_id;
  // Anonymous RevenueCat ids ($RCAnonymousID:…) are not families.
  if (!/^[0-9a-f-]{36}$/i.test(familyId)) return new Response('anonymous', { status: 200 });
  if (Array.isArray(e.entitlement_ids) && !e.entitlement_ids.includes(ENTITLEMENT)) return new Response('other entitlement', { status: 200 });

  const expires = e.expiration_at_ms ? new Date(e.expiration_at_ms) : null;
  const ended = ['EXPIRATION'].includes(e.type);
  const active = !ended && (!expires || expires > new Date());

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { error } = await db.from('subscriptions').upsert({
    family_id: familyId,
    active,
    expires_at: expires?.toISOString() ?? null,
    source: String(e.store ?? '').toLowerCase() || null,
    updated_at: new Date().toISOString(),
  });
  if (error) return new Response(error.message, { status: 500 });
  return new Response('ok', { status: 200 });
});
