import { use } from "react";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { catalog, isProductKey, type ProductKey } from "@/config/catalog";
import { OrderFlow } from "@/components/order/OrderFlow";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Order" });
  return { title: t("title") };
}

export default function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ product?: string; plan?: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const { product: productParam, plan: planParam } = use(searchParams);

  const product: ProductKey = isProductKey(productParam) ? productParam : "pos";
  const plans = catalog[product].plans;
  const plan = plans.some((p) => p.id === planParam)
    ? (planParam as string)
    : catalog[product].defaultPlan;

  return (
    <main className="relative z-10 mx-auto min-h-screen w-full max-w-5xl px-6 pb-28 pt-36">
      <OrderFlow product={product} initialPlan={plan} />
    </main>
  );
}
