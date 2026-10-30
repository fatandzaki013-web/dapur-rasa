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

  // Jika kosong atau nomor placeholder/dummy lama bawaan template (misal 6281234567890), arahkan ke nomor resmi
  if (!clean || clean === "6281234567890" || clean === "081234567890" || clean === "628123456789") {
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
 * - Normalisasi line breaks (\r\n -> \n)
 * - Mencegah pesan terpotong atau rusak
 */
export function sanitizeWhatsAppMessage(text?: string | null): string {
  if (!text) return "";
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

/**
 * Strict RFC 3986 URL Encoding:
 * Menjamin seluruh parameter query pesan dibungkus ketat menggunakan encodeURIComponent(pesan)
 * sebelum digabungkan ke URL tujuan (https://wa.me/... atau api.whatsapp.com/send).
 *
 * Karakter khusus seperti baris baru (\n), simbol (&, #, %, +, ", '), kurung,
 * serta emotikon tetap utuh dan tidak menyebabkan URL query terpotong saat dibuka
 * di WhatsApp Web maupun aplikasi mobile.
 */
export function encodeWhatsAppMessage(text?: string | null): string {
  const clean = sanitizeWhatsAppMessage(text);
  if (!clean) return "";

  // encodeURIComponent standar tidak meng-encode ! ' ( ) *
  // Dengan me-replace karakter tersebut ke bentuk %HEX, kita mencegah URL query terpotong atau rusak
  return encodeURIComponent(clean).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
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
  const encodedMsg = encodeWhatsAppMessage(message);

  if (!encodedMsg) {
    return `https://wa.me/${phone}`;
  }

  return `https://wa.me/${phone}?text=${encodedMsg}`;
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
  const encodedMsg = encodeWhatsAppMessage(message);

  if (!encodedMsg) {
    return `https://api.whatsapp.com/send?phone=${phone}`;
  }

  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMsg}`;
}
