"use client";

import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

/** Big breadth statement: dozens of capabilities streaming past in marquee rows. */

const POS_AR = [
  "نقطة بيع", "ورديات", "خزينة موحّدة", "بنوك وتحويلات", "آجل", "أقساط", "نقاط ولاء",
  "واتساب CRM", "حملات", "قوالب رسائل", "مخازن متعددة", "نقل بين الفروع", "جرد فعلي",
  "٤ طرق تكلفة", "باركود", "ملصقات باركود", "مصمّم طباعة", "حراري وA4", "أوامر توريد",
  "أوامر شراء", "مرتجعات", "عروض أسعار", "موردين", "عملاء", "كشوف حسابات", "أعمار ديون",
  "ضريبة القيمة المضافة", "+١٠٠ تقرير", "لوحة صاحب المحل", "تحليلات", "مصروفات", "إيرادات",
  "سحوبات", "موظفين", "رواتب", "سلف", "صلاحيات مستخدمين", "سجل نشاط", "فروع متعددة",
  "نسخ احتياطي", "استعادة", "أوفلاين", "ترخيص وحماية", "بحث شامل", "إشعارات",
  "اختصارات لوحة المفاتيح", "ثيمات قابلة للتخصيص", "متعدد الوحدات", "أصناف (مقاس×لون)",
  "سيريال / IMEI", "ضمان", "صلاحية FEFO", "ميزان (باركود وزن)", "عروض وخصومات", "شيكات",
  "أوامر صيانة", "وضع مطاعم", "أسعار ذهب", "استيراد أصناف",
];

const POS_EN = [
  "Point of sale", "Shifts", "Unified treasury", "Banks & transfers", "Credit", "Installments",
  "Loyalty points", "WhatsApp CRM", "Campaigns", "Message templates", "Multi-warehouse",
  "Branch transfers", "Physical count", "4 costing methods", "Barcode", "Barcode labels",
  "Print designer", "Thermal & A4", "Purchase orders", "Supply orders", "Returns", "Quotations",
  "Suppliers", "Customers", "Account statements", "Debt aging", "VAT", "100+ reports",
  "Owner dashboard", "Analytics", "Expenses", "Revenues", "Withdrawals", "Employees", "Payroll",
  "Advances", "User roles", "Activity log", "Multi-branch", "Backup", "Restore", "Offline",
  "License & security", "Global search", "Notifications", "Keyboard shortcuts", "Custom themes",
  "Multi-unit", "Variants (size×color)", "Serial / IMEI", "Warranty", "FEFO expiry",
  "Scale barcodes", "Promotions", "Cheques", "Repair orders", "Restaurant mode", "Gold rates",
  "Item import",
];

const EC_AR = [
  "واجهة متجر", "كتالوج منتجات", "أقسام وفئات", "بحث فوري", "فلترة ذكية", "مقاسات وألوان",
  "معارض صور", "استيراد مجمع", "سلة تسوق", "إتمام الشراء", "بوابات دفع", "دفع عند الاستلام",
  "مناطق شحن", "تتبع الشحن", "فواتير أوتوماتيك", "حسابات العملاء", "سجل طلبات", "قائمة مفضّلات",
  "نقاط ولاء", "كوبونات خصم", "عروض تلقائية", "تقييمات ونجوم", "صور تقييمات", "مودريشن",
  "لوحة تحكم", "تحليلات مبيعات", "تقارير مخزون", "رؤى العملاء", "إشعارات فورية", "إيميلات أوتوماتيك",
  "رسائل نصية", "استرداد العربات", "SEO متكامل", "خريطة موقع", "بيانات منظمة", "مدونة ومقالات",
  "صفحات", "وسوم ميتا", "تطبيق موبايل", "إشعارات push", "واتساب تكامل", "مشاركة اجتماعية",
  "دخول اجتماعي", "عربي وإنجليزي", "RTL", "عملات متعددة", "تصدير تقارير", "تصدير Excel/PDF",
  "مخطط غرف ثلاثي الأبعاد", "معاينة ثلاثي الأبعاد", "مخازن متعددة", "إدارة موردين",
  "صلاحيات مستخدمين", "نسخ احتياطي", "تحديثات مستمرة", "دعم فني",
];

const EC_EN = [
  "Storefront", "Product catalog", "Categories", "Instant search", "Smart filtering", "Size & color variants",
  "Image galleries", "Bulk import", "Shopping cart", "Checkout", "Payment gateways", "Cash on delivery",
  "Shipping zones", "Shipment tracking", "Auto invoices", "Customer accounts", "Order history", "Wishlists",
  "Loyalty points", "Discount coupons", "Auto promotions", "Ratings & reviews", "Photo reviews", "Moderation",
  "Owner dashboard", "Sales analytics", "Inventory reports", "Customer insights", "Push notifications", "Auto emails",
  "SMS alerts", "Cart recovery", "Built-in SEO", "Sitemap", "Structured data", "Blog & articles",
  "Pages", "Meta fields", "Mobile app", "Push notifications", "WhatsApp integration", "Social sharing",
  "Social login", "Arabic & English", "RTL layout", "Multi-currency", "Report export", "Excel/PDF export",
  "3D room planner", "3D product viewer", "Multi-warehouse", "Supplier management",
  "User roles", "Backup & restore", "Continuous updates", "Technical support",
];

function Row({ items, reverse, dur }: { items: string[]; reverse?: boolean; dur: number }) {
  const doubled = [...items, ...items];
  return (
    <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      <div
        className="flex shrink-0 gap-3 pe-3"
        style={{ animation: `marquee ${dur}s linear infinite`, animationDirection: reverse ? "reverse" : "normal" }}
      >
        {doubled.map((f, i) => (
          <span
            key={i}
            className="whitespace-nowrap rounded-full border border-brass/18 bg-ink-800/60 px-4 py-2 text-sm text-bone-muted transition-colors hover:border-brass/50 hover:text-bone"
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

export function FeatureIndex({ worldKey, featuresAr, featuresEn }: { worldKey: string; featuresAr?: string[]; featuresEn?: string[] }) {
  const t = useTranslations(`Worlds.${worldKey}`);
  const locale = useLocale();
  const all = locale === "ar" ? (featuresAr ?? POS_AR) : (featuresEn ?? POS_EN);
  const n = Math.ceil(all.length / 4);
  const rows = [all.slice(0, n), all.slice(n, 2 * n), all.slice(2 * n, 3 * n), all.slice(3 * n)];

  return (
    <section className="relative overflow-hidden py-24">
      <div className="relative mx-auto mb-12 max-w-3xl px-6 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-brass">{t("indexKicker")}</p>
        <h2 className="font-display mt-4 text-3xl font-semibold text-bone sm:text-5xl">
          {t("indexTitle")}
        </h2>
        <p className="mt-4 text-bone-muted">{t("indexBody")}</p>
      </div>
      <div className={cn("flex flex-col gap-3")}>
        {rows.map((r, i) => (
          <Row key={i} items={r} reverse={i % 2 === 1} dur={38 + i * 6} />
        ))}
      </div>
    </section>
  );
}
