"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminProductsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div className="p-12 flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 text-[#4A0E4E] animate-spin" />
      <span className="text-sm font-semibold text-slate-500">Mengarahkan ke Katalog Menu...</span>
    </div>
  );
}
