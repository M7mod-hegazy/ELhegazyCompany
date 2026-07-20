"use client";

import { useRouter } from "next/navigation";
import { adminLogout } from "@/app/actions/admin";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await adminLogout();
        router.refresh();
      }}
      className="rounded-full px-4 py-2 text-sm text-oxblood-tint transition-colors hover:bg-ink-800"
    >
      خروج
    </button>
  );
}
