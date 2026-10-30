"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, ExternalLink, Sparkles } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { buildWhatsAppLink, getWhatsAppDisplayNumber, getWhatsAppNumber } from "@/lib/whatsapp";

const DEFAULT_WA_MESSAGE = "Halo Dapur Rasa, saya ingin tanya seputar menu dan pemesanan kue.";

export default function FloatingWhatsAppButton() {
  const pathname = usePathname();
  const { settings } = useStore();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Sembunyikan pada rute admin atau saat proses checkout berlangsung
  if (pathname.startsWith("/admin") || pathname === "/checkout") {
    return null;
  }

  const brandName = settings?.brandName || "Dapur Rasa";
  const rawNumber = settings?.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6285888159765";
  const cleanPhone = getWhatsAppNumber(rawNumber);
  const displayWa = getWhatsAppDisplayNumber(rawNumber);

  // Link resmi click-to-chat dengan pesan default yang ramah & ter-encode ketat
  const waUrl = buildWhatsAppLink(DEFAULT_WA_MESSAGE, cleanPhone);

  return (
    <aside
      aria-label="Kontak WhatsApp Dapur Rasa"
      className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end select-none"
    >
      {/* Popover Bantuan Cepat */}
      {isPopoverOpen && (
        <div className="mb-3 w-72 sm:w-80 bg-white rounded-3xl shadow-2xl border border-stone-200/90 p-4 sm:p-5 animate-scaleIn text-stone-800">
          <div className="flex items-start justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                🧁
              </div>
              <div>
                <p className="font-extrabold text-xs text-stone-900 font-heading leading-tight">{brandName}</p>
                <p className="text-[10.5px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online di WhatsApp
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPopoverOpen(false)}
              className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition cursor-pointer"
              aria-label="Tutup popover"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-stone-600 my-3 leading-relaxed">
            Halo! Ada yang bisa kami bantu seputar menu pastel crispy, risol mayo, brownies, atau pesanan snack box hari ini?
          </p>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white/20" />
            <span>Chat WhatsApp ({displayWa})</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>
      )}

      {/* Floating Action Button (Direct Link to WhatsApp & Hover Indicator) */}
      <div className="flex items-center gap-2.5">
        {/* Tooltip Label Desktop */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 bg-white text-stone-800 hover:text-emerald-700 text-xs font-bold py-2 px-3.5 rounded-2xl shadow-lg border border-stone-200/90 transition-all hover:scale-102 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Chat WhatsApp ({displayWa})</span>
        </a>

        {/* Circular Floating Action Button */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Chat WhatsApp Dapur Rasa ke ${displayWa}`}
          title="Hubungi Kami via WhatsApp"
          className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/40 flex items-center justify-center transition-all hover:scale-108 active:scale-95 cursor-pointer relative"
        >
          {/* Pulsing beacon ping */}
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-300 rounded-full border-2 border-white animate-ping" />
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
          <MessageCircle className="w-7 h-7 sm:w-7 sm:h-7 fill-white/20" />
        </a>
      </div>
    </aside>
  );
}
