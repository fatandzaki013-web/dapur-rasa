/**
 * Utilitas Terpusat WhatsApp Dapur Rasa
 * Mendukung format dinamis via Environment Variable (NEXT_PUBLIC_WHATSAPP_NUMBER)
 * dengan fallback resmi ke 6285888159765.
 */

export const DEFAULT_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6285888159765";

/**
 * Format nomor WhatsApp ke format internasional standar (tanpa tanda +, spasi, atau dash).
 * Contoh: "085888159765" -> "6285888159765"
 *         "+62 858-8815-9765" -> "6285888159765"
 */
export function getWhatsAppNumber(customNumber?: string | null): string {
  const source = (customNumber && customNumber.trim()) || DEFAULT_WHATSAPP_NUMBER;
  let clean = source.replace(/[^0-9]/g, "");

  if (!clean) {
    clean = DEFAULT_WHATSAPP_NUMBER.replace(/[^0-9]/g, "");
  }

  if (clean.startsWith("0")) {
    clean = "62" + clean.slice(1);
  } else if (!clean.startsWith("62")) {
    clean = "62" + clean;
  }

  return clean;
}

/**
 * Format nomor WhatsApp ke format tampilan lokal ramah pengguna (awalan 0).
 * Contoh: "6285888159765" -> "085888159765"
 */
export function getWhatsAppDisplayNumber(customNumber?: string | null): string {
  const wa = getWhatsAppNumber(customNumber);
  if (wa.startsWith("62")) {
    return "0" + wa.slice(2);
  }
  return wa;
}

/**
 * Sanitasi pesan teks agar rapi saat dibuka di WhatsApp.
 */
export function sanitizeWhatsAppMessage(text?: string | null): string {
  if (!text) return "";
  return text.trim();
}

/**
 * Buat tautan resmi WhatsApp Click-to-Chat (wa.me).
 * Contoh: buildWhatsAppLink("Halo Dapur Rasa", "085888159765")
 *         -> "https://wa.me/6285888159765?text=Halo%20Dapur%20Rasa"
 */
export function buildWhatsAppLink(
  message?: string | null,
  customNumber?: string | null
): string {
  const phone = getWhatsAppNumber(customNumber);
  const cleanMsg = sanitizeWhatsAppMessage(message);

  if (!cleanMsg) {
    return `https://wa.me/${phone}`;
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(cleanMsg)}`;
}

/**
 * Buat URL WhatsApp API (api.whatsapp.com/send).
 * Sesuai untuk window.open redirect checkout & modal ulasan.
 */
export function buildWhatsAppApiUrl(
  message?: string | null,
  customNumber?: string | null
): string {
  const phone = getWhatsAppNumber(customNumber);
  const cleanMsg = sanitizeWhatsAppMessage(message);

  if (!cleanMsg) {
    return `https://api.whatsapp.com/send?phone=${phone}`;
  }

  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(cleanMsg)}`;
}
