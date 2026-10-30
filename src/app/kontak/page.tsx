"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { Phone, MapPin, Clock, MessageSquare } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/SocialIcons";
import {
  getWhatsAppNumber,
  getWhatsAppDisplayNumber,
  buildWhatsAppLink,
} from "@/lib/whatsapp";

export default function ContactPage() {
  const { settings } = useStore();
  const brandName = settings?.brandName || "Dapur Rasa";
  const waLinkNum = getWhatsAppNumber(settings?.whatsappNumber);
  const waDisplayNum = getWhatsAppDisplayNumber(settings?.whatsappNumber);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-24 sm:pb-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold text-amber-800 tracking-wider uppercase">
          Layanan Pelanggan
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-heading mt-1">
          Hubungi {brandName}
        </h1>
        <p className="text-stone-600 text-sm mt-2">
          Kami siap membantu Anda untuk informasi pesanan, jadwal pengiriman, konsultasi snack box, atau pertanyaan seputar menu kami.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
        {/* Contact Cards */}
        <div className="lg:col-span-5 space-y-4">
          {/* WhatsApp Card */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-stone-900 text-base">WhatsApp Resmi</h3>
              <p className="text-xs text-stone-500 mt-0.5">Respon cepat selama jam kerja</p>
              <a
                href={buildWhatsAppLink(null, settings?.whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-emerald-700 hover:underline mt-2 inline-block"
              >
                {waDisplayNum}
              </a>
            </div>
          </div>

          {/* Address Card */}
          {settings?.address && (
            <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-stone-900 text-base">Alamat Dapur</h3>
                <p className="text-xs text-stone-500 mt-0.5">Lokasi pengambilan pesanan (pickup)</p>
                <p className="text-sm text-stone-800 font-medium mt-2 leading-relaxed">
                  {settings.address}
                </p>
              </div>
            </div>
          )}

          {/* Operational Hours */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-stone-900 text-base">Jam Operasional</h3>
              <p className="text-xs text-stone-500 mt-0.5">Jadwal produksi & pengantaran</p>
              <p className="text-sm text-stone-800 font-medium mt-2">
                <span className="block">Senin – Sabtu: 05.00 – 22.00 WIB</span>
                <span className="block text-amber-800 font-semibold text-xs mt-0.5">Hari Minggu: Tutup</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action WhatsApp Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-stone-900">
              Konsultasi Langsung via WhatsApp
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              Memiliki rencana acara hajatan, pengajian, rapat instansi, atau ingin memesan snack box dalam jumlah banyak? Klik tombol di bawah ini untuk terhubung langsung dengan tim kami via WhatsApp.
            </p>

            <div className="pt-4">
              <a
                href={buildWhatsAppLink(
                  `Halo ${brandName}, saya ingin konsultasi pemesanan kue / snack box untuk acara.`,
                  settings?.whatsappNumber
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg transition-all hover:scale-102"
              >
                <Phone className="w-5 h-5" />
                <span>Mulai Percakapan WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-stone-100 flex items-center gap-4 text-xs text-stone-500">
            <span>Ikuti kami di media sosial:</span>
            {settings?.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-700 hover:text-amber-800 font-semibold flex items-center gap-1"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                <span>Instagram</span>
              </a>
            )}
            {settings?.facebookUrl && (
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-700 hover:text-amber-800 font-semibold flex items-center gap-1"
              >
                <FacebookIcon className="w-3.5 h-3.5" />
                <span>Facebook</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
