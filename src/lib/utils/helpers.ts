// lib/helpers.ts

/**
 * Mengembalikan status sesuai akumulasi poin berdasarkan SOP TATIB SMPN 1 Purwakarta.
 * Nilai ambang batas sesuai dokumen resmi.
 */
export function tentukanStatus(poin: number): string {
  if (poin >= 100) return "SPD - Surat Pengunduran Diri";
  if (poin >= 75) return "SP2 - Surat Peringatan Kedua";
  if (poin >= 50) return "SP1 - Surat Peringatan Pertama";
  if (poin >= 30) return "SPW - Surat Panggilan Wali Kelas";
  if (poin > 0) return "TLG - Teguran Langsung Guru";
  return "Aman";
}

/**
 * Memberikan class warna status untuk badge atau tabel.
 */
export function getStatusColor(status: string): string {
  if (status.startsWith("SPD")) return "bg-red-600 text-white";
  if (status.startsWith("SP2")) return "bg-red-500 text-white";
  if (status.startsWith("SP1")) return "bg-yellow-400 text-black";
  if (status.startsWith("SPW")) return "bg-blue-200 text-black";
  if (status.startsWith("TLG")) return "bg-gray-200 text-black";
  return "bg-green-100 text-black";
}

