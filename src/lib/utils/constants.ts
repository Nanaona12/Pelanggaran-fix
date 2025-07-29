// List kelas yang tersedia
export const kelasList = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"
];

// List tingkat (kelas 7–9)
export const tingkatList = [7, 8, 9];

// Tipe pelanggaran
export const tipePelanggaran = [
  "Kejahatan",
  "Kesusilaan",
  "Kenakalan",
  "Pornografi",
  "Bullying",
  "Kedisiplinan",
  "Kesopanan",
];

// Mapping poin per tipe pelanggaran
export const poinPerTipe: Record<string, number> = {
  Kejahatan: 100,
  Kesusilaan: 90,
  Kenakalan: 70,
  Pornografi: 80,
  Bullying: 85,
  Kedisiplinan: 60,
  Kesopanan: 50,
};

export const pelanggaran = {
  Kejahatan: {
    "Pembunuhan": 100,
    "Perampokan": 100,
    "Pemerkosaan": 100,
  },
  Kesusilaan: {
    "Perzinaan (hamil/menghamili)": 100,
    "Homoseksual/Lesbian": 100,
    "Eksibisionisme/mempertontonkan organ sensitif": 100,
  },
  Kenakalan: {
    "Tawuran/perkelahian": 100,
    "Narkoba/Miras": 100,
    "Merokok/membawa rokok/vape": 50,
    "Penggelapan Uang/pencurian Berat (>Rp100.000,-)": 50,
    "Penggelapan Uang/pencurian Sedang (Rp50.000,- s.d. Rp100.000,-)": 30,
    "Penggelapan Uang/pencurian Ringan (<Rp50.000,-)": 10,
    "Pemerasan Berat (menggunakan senjata tajam)": 50,
    "Pemerasan Sedang (dengan kekerasan fisik)": 30,
    "Pemerasan Ringan (dengan kata-kata merendahkan)": 10,
    "Pengancaman Berat (menggunakan senjata tajam)": 50,
    "Pengancaman Sedang (dengan kekerasan fisik)": 30,
    "Pengancaman Ringan (dengan kata-kata merendahkan)": 10,
  },
  "Pornografi/Pornoaksi": {
    "Menyebarkan video/gambar porno": 50,
    "Membuat konten berbau pornografi": 50,
    "Menonton/mengkoleksi konten pornografi": 30,
    "Menunjukkan gestur/simbol porno": 10,
  },
  Bullying: {
    "Fisik": 50,
    "Verbal": 50,
    "Non verbal/sosial": 50,
    "Kekerasan/pelecehan seksual": 50,
    "Cyberbullying": 50,
  },
  Kedisiplinan: {
    // Waktu
    "Absen 3 hari berturut-turut (alpa)": 30,
    "Absen 2 hari berturut-turut (alpa)": 15,
    "Pulang sebelum waktunya/bolos": 10,
    "Datang terlambat": 5,

    // Barang Bawaan
    "Membawa makeup tidak sesuai ketentuan": 10,
    "Membawa benda tak ada hubungannya dengan kbm": 10,
    "Membawa type-X (cair/kertas)": 10,
    "Tidak membawa bekal makanan/minuman": 10,
    "Membawa makanan/minuman kemasan plastik": 10,
    "Lupa tidak menyiapkan geber/beas kaheman": 5,

    // Aktivitas di dalam kelas/lorong
    "Berduaan dengan lawan jenis/berpacaran": 15,
    "Berbuat iseng kepada teman": 10,
    "Merusak/mengotori fasilitas kelas": 10,
    "Membuang sampah sembarangan (kelas/lorong)": 10,
    "Mengganggu ketenangan belajar": 10,
    "Tidak mengikuti arahan guru": 10,
    "Tidak melakukan tugas piket kebersihan": 10,
    "Tidak mengerjakan tugas dari guru": 10,
    "Keluar kelas tanpa izin/keperluan yang jelas": 10,
    "Bermain bola (di dalam kelas)": 10,
    "Tidur": 5,

    // Aktivitas di luar kelas
    "Merusak fasilitas sekolah": 10,
    "Membuang sampah sembarangan (luar kelas)": 10,
    "Bermain bola pada waktu istirahat kedua": 10,
    "Keluar lingkungan/gerbang sekolah tanpa izin": 10,
    "Tidak berjama'ah dzuhur/jum'at di masjid (muslim)": 5,
    "Tidak sholat dzuhur (muslimah)": 5,

    // Pakaian
    "Menggunakan seragam tidak sesuai ketentuan": 10,
    "Model seragam tidak sesuai ketentuan": 10,
    "Atribut tidak lengkap": 10,
    "Datang/pulang tidak menggunakan sepatu": 10,

    // Penampilan/rambut/makeup
    "Panjang rambut laki-laki lebih dari 3 cm": 10,
    "Menggunakan perhiasan/makeup berlebihan": 10,
    "Memakai kerudung kelihatan rambut/tidak rapi": 10,
    "Menggunakan aksesoris (laki-laki)": 10,
    "Kuku panjang (putra/putri)": 10,
  },
  Kesopanan: {
    "Tidak memberi salam pada guru": 5,
    "Menggunakan hp saat guru bicara": 5,
    "Berbicara kasar/jorok": 5,
  },
};

export function hitungPoin(tipe: string, catatan: string): number {
  return pelanggaran[tipe]?.[catatan] ?? 0;
}
