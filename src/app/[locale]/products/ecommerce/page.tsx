import { Fragment } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { getWorld } from "@/config/worlds";
import { EcommerceShell } from "@/components/world/EcommerceShell";
import { WorldHero } from "@/components/world/WorldHero";
import { KineticStatement } from "@/components/world/KineticStatement";
import { ProofBand } from "@/components/world/ProofBand";
import { EcommerceAbilitiesBento } from "@/components/world/EcommerceAbilitiesBento";
import { StoryChapter } from "@/components/world/StoryChapter";
import { ModuleGallery } from "@/components/world/ModuleGallery";
import { HorizontalFeatures } from "@/components/world/HorizontalFeatures";
import { FeatureIndex } from "@/components/world/FeatureIndex";
import { WorldProof } from "@/components/world/WorldProof";
import {
  TrustStrip,
  BigNumbers,
  CompareTable,
  PullQuote,
  SparkDivider,
  CapabilityWheel,
} from "@/components/world/sections";
import { Pricing } from "@/components/world/Pricing";
import { LiveStoreBand } from "@/components/world/LiveStoreBand";
import { CtaBand } from "@/components/site/CtaBand";

const KEY = "ecommerce" as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: `Worlds.${KEY}` });
  return { title: t("hero"), description: t("promise") };
}

export default async function EcommerceWorldPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const world = getWorld(KEY);
  if (!world) notFound();
  const t = await getTranslations({ locale, namespace: `Worlds.${KEY}` });

  return (
    <EcommerceShell accent={world.accent} worldKey={world.key}>
      <PageHero
        videoKey="ecommerce"
        kicker={t("hero")}
        title={t("promise")}
        zone="bottom-left"
      />
      <WorldHero worldKey={world.key} num={world.num} accent={world.accent} />
      <KineticStatement worldKey={world.key} />
      <LiveStoreBand worldKey={world.key} href={world.externalHref} />
      <ProofBand world={world} plate="page-ecommerce" />
      <TrustStrip worldKey={world.key} />
      <EcommerceAbilitiesBento worldKey={world.key} />
      <BigNumbers worldKey={world.key} />

      {world.chapters.map((c, idx) => (
        <Fragment key={c.id}>
          <StoryChapter worldKey={world.key} chapter={c} index={idx} />
          {world.modulesAfter === c.id && world.modules && (
            <ModuleGallery worldKey={world.key} modules={world.modules} />
          )}
        </Fragment>
      ))}

      <PullQuote worldKey={world.key} id="quote1" />
      <HorizontalFeatures worldKey={world.key} ids={["catalog","orders","customers","coupons","reviews","shipping","tax","inventory","blog","social","localization","search","notifications","export"]} />
      <SparkDivider />
      <CompareTable worldKey={world.key} />
      <CapabilityWheel worldKey={world.key} />
      <FeatureIndex worldKey={world.key} featuresAr={["واجهة متجر","كتالوج منتجات","أقسام وفئات","بحث فوري","فلترة ذكية","مقاسات وألوان","معارض صور","استيراد مجمع","سلة تسوق","إتمام الشراء","بوابات دفع","دفع عند الاستلام","مناطق شحن","تتبع الشحن","فواتير أوتوماتيك","حسابات العملاء","سجل طلبات","قائمة مفضّلات","نقاط ولاء","كوبونات خصم","عروض تلقائية","تقييمات ونجوم","صور تقييمات","مودريشن","لوحة تحكم","تحليلات مبيعات","تقارير مخزون","رؤى العملاء","إشعارات فورية","إيميلات أوتوماتيك","رسائل نصية","استرداد العربات","SEO متكامل","خريطة موقع","بيانات منظمة","مدونة ومقالات","صفحات","وسوم ميتا","تطبيق موبايل","إشعارات push","واتساب تكامل","مشاركة اجتماعية","دخول اجتماعي","عربي وإنجليزي","RTL","عملات متعددة","تصدير تقارير","تصدير Excel/PDF","مخطط غرف ثلاثي الأبعاد","معاينة ثلاثي الأبعاد","مخازن متعددة","إدارة موردين","صلاحيات مستخدمين","نسخ احتياطي","تحديثات مستمرة","دعم فني"]} featuresEn={["Storefront","Product catalog","Categories","Instant search","Smart filtering","Size & color variants","Image galleries","Bulk import","Shopping cart","Checkout","Payment gateways","Cash on delivery","Shipping zones","Shipment tracking","Auto invoices","Customer accounts","Order history","Wishlists","Loyalty points","Discount coupons","Auto promotions","Ratings & reviews","Photo reviews","Moderation","Owner dashboard","Sales analytics","Inventory reports","Customer insights","Push notifications","Auto emails","SMS alerts","Cart recovery","Built-in SEO","Sitemap","Structured data","Blog & articles","Pages","Meta fields","Mobile app","Push notifications","WhatsApp integration","Social sharing","Social login","Arabic & English","RTL layout","Multi-currency","Report export","Excel/PDF export","3D room planner","3D product viewer","Multi-warehouse","Supplier management","User roles","Backup & restore","Continuous updates","Technical support"]} />
      <PullQuote worldKey={world.key} id="quote2" />
      <WorldProof worldKey={world.key} items={world.proof} />
      <Pricing worldKey={world.key} />
      <CtaBand />
    </EcommerceShell>
  );
}
