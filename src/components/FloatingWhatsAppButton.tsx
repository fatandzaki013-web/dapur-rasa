"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { buildWhatsAppLink, getWhatsAppDisplayNumber } from "@/lib/whatsapp";

export default function FloatingWhatsAppButton() {
  const pathname = usePathname();
  const { settings } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  // Jangan tampilkan di halaman admin atau checkout
  if (pathname.startsWith("/admin") || pathname === "/checkout") {
    return null;
  }

  const brandName = settings?.brandName || "Dapur Rasa";
  const displayWa = getWhatsAppDisplayNumber(settings?.whatsappNumber);
  const waUrl = buildWhatsAppLink(
    `Halo ${brandName}, saya ingin bertanya tentang menu kue / pemesanan snack box.`,
    settings?.whatsappNumber
  );

  return (
    <aside
      aria-label="Kontak WhatsApp"
      className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end"
    >
      {/* Popover Bubble */}
      {isOpen && (
        <div className="mb-3 w-72 bg-white rounded-2xl shadow-2xl border border-stone-200 p-4 animate-scaleIn text-stone-800">
          <div className="flex items-start justify-between pb-2 border-b border-stone-100">
            <div>
              <p className="font-extrabold text-xs text-stone-900 font-heading">{brandName}</p>
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online di WhatsApp
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition cursor-pointer"
              aria-label="Tutup pesan bantuan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-stone-600 my-3 leading-relaxed">
            Ada yang bisa kami bantu seputar pesanan kue atau snack box hari ini?
          </p>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat via WhatsApp ({displayWa})</span>
          </a>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="flex items-center gap-2">
        {!isOpen && (
          <span className="hidden sm:inline-block bg-white text-stone-700 text-xs font-bold py-1.5 px-3 rounded-full shadow-lg border border-stone-200 animate-fadeIn">
            Chat Kami
          </span>
        )}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Buka Chat WhatsApp"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl hover:shadow-emerald-500/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer relative"
        >
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-ping" />
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-white/20" />
        </button>
      </div>
    </aside>
  );
}
