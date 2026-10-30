export interface StoreOperatingStatus {
  isOpen: boolean;
  statusBadge: string;
  statusText: string;
  subText: string;
  noticeText: string;
  scheduleText: string;
  currentTimeWIB: string;
  currentDayName: string;
}

/**
 * Menghitung status operasional toko berdasarkan Waktu Indonesia Barat (WIB, UTC+7).
 * Jam Operasional:
 * - Buka: Senin - Sabtu, 05:00 - 22:00 WIB
 * - Tutup: Minggu sepanjang hari atau di luar rentang jam 05:00 - 22:00 WIB
 */
export function getStoreOperatingStatus(date = new Date()): StoreOperatingStatus {
  // Konversi waktu saat ini ke WIB (UTC+7)
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const wibDate = new Date(utc + 3600000 * 7);

  const day = wibDate.getDay(); // 0: Minggu, 1: Senin, ..., 6: Sabtu
  const hours = wibDate.getHours();
  const minutes = wibDate.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  const OPEN_TIME = 5 * 60; // 05:00 WIB
  const CLOSE_TIME = 22 * 60; // 22:00 WIB

  const isSunday = day === 0;
  const isWithinHours = currentMinutes >= OPEN_TIME && currentMinutes < CLOSE_TIME;
  const isOpen = !isSunday && isWithinHours;

  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const currentDayName = dayNames[day];
  const pad = (n: number) => String(n).padStart(2, "0");
  const currentTimeWIB = `${pad(hours)}:${pad(minutes)} WIB`;

  let statusBadge = "";
  let statusText = "";
  let subText = "";

  if (isOpen) {
    statusBadge = "Dapur Buka (05.00 - 22.00 WIB)";
    statusText = "Dapur Sedang Buka";
    subText = "Siap menerima dan memproses pesanan Anda sekarang";
  } else {
    if (isSunday) {
      statusBadge = "Dapur Tutup (Buka kembali Senin pkl 05.00 WIB)";
      statusText = "Dapur Libur Hari Minggu";
      subText = "Buka kembali hari Senin pkl 05.00 WIB";
    } else if (currentMinutes < OPEN_TIME) {
      statusBadge = "Dapur Tutup (Buka kembali pkl 05.00 WIB)";
      statusText = "Dapur Belum Buka";
      subText = "Buka kembali hari ini pkl 05.00 WIB";
    } else {
      statusBadge = "Dapur Tutup (Buka kembali pkl 05.00 WIB)";
      statusText = "Dapur Sedang Tutup";
      subText = day === 6 ? "Buka kembali hari Senin pkl 05.00 WIB" : "Buka kembali besok pkl 05.00 WIB";
    }
  }

  const scheduleText = "Senin - Sabtu: 05.00 - 22.00 WIB | Minggu: Libur (Pre-Order Tetap Diterima)";
  const noticeText = isOpen
    ? "Dapur buka dan siap melayani pesanan Anda."
    : "Dapur sedang istirahat/tutup. Pesanan Anda tetap akan diterima sebagai Pre-Order dan diproses saat dapur buka kembali.";

  return {
    isOpen,
    statusBadge,
    statusText,
    subText,
    noticeText,
    scheduleText,
    currentTimeWIB,
    currentDayName,
  };
}
