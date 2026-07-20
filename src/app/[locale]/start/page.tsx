import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import { ProjectBrief } from "@/components/start/ProjectBrief";

export default function StartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <main className="relative z-10 min-h-screen px-6 pb-28 pt-36">
      <div className="mx-auto max-w-2xl">
        <ProjectBrief />
      </div>
    </main>
  );
}
