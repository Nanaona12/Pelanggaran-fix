// src/types.ts
export type Pelanggaran = {
    id: string;
    tipe_pelanggaran: string;
    catatan_tambahan: string;
    poin: number;
    tanggal: string;
    nis: string;
    nama: string;
    kelas: string;
    tingkat: string;
  };


// type Pelanggaran = {
//     id: string;
//     tipe_pelanggaran: string;
//     catatan_tambahan?: string;
//     poin: number;
//     tanggal: string;
//     nis: string;
//     siswa?: {
//       nama: string;
//       kelas: string;
//       tingkat: string;
//     };
//   };
  