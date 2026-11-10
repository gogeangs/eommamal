// In-app subscription (App Store / Google Play).
// The web build cannot sell subscriptions; the native app (Capacitor shell) provides a store plugin.
// The plugin is looked up at runtime, so the web bundle carries no store code.
// Native setup: docs/SUBSCRIPTION.md (RevenueCat Capacitor plugin, product + entitlement ids below).

export const PRODUCT_ID = 'eommamal_family_monthly';
export const ENTITLEMENT = 'family';
/** Shown until the store reports its localized price. */
export const FALLBACK_PRICE = '₩4,900';

export interface SubStatus { active: boolean; until?: string }
export interface Store {
  /** true inside the App Store / Google Play app */
  native: boolean;
  price(): Promise<string>;
  status(): Promise<SubStatus>;
  purchase(): Promise<SubStatus>;
  restore(): Promise<SubStatus>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type Purchases = Record<string, (...a: any[]) => Promise<any>>;

function plugin(): Purchases | null {
  const cap = (window as any).Capacitor;
  return cap?.isNativePlatform?.() ? (cap.Plugins?.Purchases ?? null) : null;
}

const fromInfo = (info: any): SubStatus => {
  const e = info?.entitlements?.active?.[ENTITLEMENT];
  return e ? { active: true, until: e.expirationDate ?? undefined } : { active: false };
};

async function currentPackage(P: Purchases) {
  const { current } = await P.getOfferings();
  return current?.availablePackages?.find((x: any) => x.product?.identifier === PRODUCT_ID) ?? current?.availablePackages?.[0];
}

function nativeStore(P: Purchases): Store {
  return {
    native: true,
    async price() {
      try { return (await currentPackage(P))?.product?.priceString ?? FALLBACK_PRICE; } catch { return FALLBACK_PRICE; }
    },
    async status() { return fromInfo((await P.getCustomerInfo()).customerInfo); },
    async purchase() {
      const pkg = await currentPackage(P);
      if (!pkg) throw new Error('구독 상품을 불러오지 못했어요.');
      return fromInfo((await P.purchasePackage({ aPackage: pkg })).customerInfo);
    },
    async restore() { return fromInfo((await P.restorePurchases()).customerInfo); },
  };
}

const webStore: Store = {
  native: false,
  price: async () => FALLBACK_PRICE,
  status: async () => ({ active: false }),
  purchase: async () => { throw new Error('구독은 앱(App Store·Google Play)에서 할 수 있어요.'); },
  restore: async () => ({ active: false }),
};

export const store = (): Store => {
  const P = plugin();
  return P ? nativeStore(P) : webStore;
};

/** Ties store purchases to the signed-in family, so the server (and the web version) knows about the subscription. */
export async function identifyBuyer(userId: string) {
  const P = plugin();
  if (!P?.logIn) return;
  try { await P.logIn({ appUserID: userId }); } catch { /* offline: retried on next sign-in */ }
}
