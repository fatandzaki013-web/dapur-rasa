"use client";

import { useEffect } from "react";

/**
 * SecurityShield Component
 * Mengamankan website dari upaya inspeksi, scraping, pembajakan kode, dan view-source (Ctrl+U / F12).
 * Tidak mengubah tampilan website sedikitpun (render null).
 */
export default function SecurityShield() {
  useEffect(() => {
    // 1. Tangkal kombinasi tombol keyboard pengintip kode (Ctrl+U, F12, DevTools, dsb)
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      const key = e.key ? e.key.toLowerCase() : "";

      // Blokir Ctrl+U / Cmd+U (View Page Source)
      if (isCtrlOrMeta && key === "u") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Blokir F12 (Developer Tools)
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Blokir Ctrl+Shift+I / Cmd+Option+I (Inspect Element)
      if (isCtrlOrMeta && e.shiftKey && key === "i") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Blokir Ctrl+Shift+J / Cmd+Option+J (Console)
      if (isCtrlOrMeta && e.shiftKey && key === "j") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Blokir Ctrl+Shift+C / Cmd+Option+C (Element Selector)
      if (isCtrlOrMeta && e.shiftKey && key === "c") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Blokir Ctrl+S / Cmd+S (Save Webpage HTML)
      if (isCtrlOrMeta && key === "s") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 2. Blokir Klik Kanan (Context Menu) di luar field input teks
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      // Izinkan klik kanan hanya jika pengguna sedang mengetik di input teks atau textarea (misal untuk paste alamat)
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // 3. Bersihkan konsol dan berikan notice keamanan resmi jika devtools dibuka lewat browser menu
    try {
      if (process.env.NODE_ENV === "production") {
        console.clear();
        console.log(
          "%c⛔ SISTEM KEAMANAN TERENKRIPSI DAPUR RASA",
          "color: #b91c1c; font-size: 16px; font-weight: 800; padding: 4px 0;"
        );
        console.log(
          "%cSeluruh akses, aset, dan kredensial dilindungi oleh enkripsi SSL & verifikasi server-side ketat.",
          "color: #475569; font-size: 12px;"
        );
      }
    } catch {
      // Safe fallback
    }

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("contextmenu", handleContextMenu, { capture: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("contextmenu", handleContextMenu, { capture: true });
    };
  }, []);

  return null;
}
