import "../globals.css";
import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import Link from "next/link";
import { isAdmin, isAdminConfigured } from "@/lib/adminAuth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { LogoutButton } from "@/components/admin/LogoutButton";

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-ar",
  display: "swap",
});

export const metadata: Metadata = {
  title: "لوحة الحجازي",
  robots: { index: false, follow: false },
};

const nav = [
  { href: "/admin", label: "نظرة عامة" },
  { href: "/admin/orders", label: "الطلبات" },
  { href: "/admin/leads", label: "العملاء المحتملون" },
  { href: "/admin/licenses", label: "التراخيص" },
  { href: "/admin/projects", label: "المشاريع" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdmin();

  return (
    <html lang="ar" dir="rtl" className={`${plexArabic.variable} h-full antialiased`}>
      <body className="min-h-full bg-ink-900 font-body text-bone">
        {!authed ? (
          <AdminLogin configured={isAdminConfigured()} />
        ) : (
          <div className="mx-auto min-h-screen w-full max-w-6xl px-6 pb-20">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-brass/15 py-6">
              <Link href="/admin" className="font-display-ar text-2xl font-semibold text-brass">
                الحجازي <span className="text-sm text-bone-muted">· لوحة التحكم</span>
              </Link>
              <nav className="flex flex-wrap items-center gap-1">
                {nav.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    className="rounded-full px-4 py-2 text-sm text-bone-muted transition-colors hover:bg-ink-800 hover:text-bone"
                  >
                    {n.label}
                  </Link>
                ))}
                <LogoutButton />
              </nav>
            </header>
            <main className="pt-8">{children}</main>
          </div>
        )}
      </body>
    </html>
  );
}
