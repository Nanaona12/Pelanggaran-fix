import React from 'react';
import { Pelanggaran } from '../types'; // pastikan tipe dideklarasikan atau diimpor

type Props = {
  data: Pelanggaran[];
  bulan: string;
  tahun: string;
};

const ReportsDetail: React.FC<Props> = ({ data, bulan, tahun }) => {
  return (
    <div id="laporan-pdf" className="p-6 text-sm font-sans">
      {/* Header Sekolah */}
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <div className="flex items-center space-x-4">
          <img src="/logosmp1pwk.png" alt="Logo Sekolah" className="w-20 h-20 object-contain" />
          <div>
            <h1 className="text-lg font-bold uppercase">SMPN 1 PURWAKARTA</h1>
            <p>JL. Kolonel Kornel Singawinata, No. 60, Negeri Kidul, Nagri Kidul, Kec. Purwakarta, Kabupaten Purwakarta, Jawa Barat 41111</p>
            <p>Email: smp1purwakarta@gmail.com, Phone: (0264) 200210
            </p>
          </div>
        </div>
      </div>

      {/* Judul Laporan */}
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold uppercase underline">Laporan Pelanggaran</h2>
        <p>Per-Bulan : {bulan} - {tahun}</p>
      </div>

      {/* Tabel Data */}
      <table className="w-full border border-collapse text-sm">
        <thead className="bg-gray-200">
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">No</th>
            <th className="border px-2 py-1">NIS</th>
            <th className="border px-2 py-1">Nama Siswa</th>
            <th className="border px-2 py-1">Kelas</th>
            <th className="border px-2 py-1">Tipe Pelanggaran</th>
            <th className="border px-2 py-1">Catatan Pelanggaran</th>
            <th className="border px-2 py-1">Poin</th>
            <th className="border px-2 py-1">Tanggal</th>
          </tr>
        </thead>
        <tbody>
        {data.map((pelanggaran, index) => (
          <tr key={pelanggaran.id}>
            <td className="border px-2 py-1 text-center">{index + 1}</td>
            <td className="border px-2 py-1 text-center">{pelanggaran.nis}</td>
            <td className="border px-2 py-1">{pelanggaran.nama || '-'}</td>
            <td className="border px-2 py-1">{pelanggaran.kelas || '-'}</td>
            <td className="border px-2 py-1">{pelanggaran.tipe_pelanggaran}</td>
            <td className="border px-2 py-1">{pelanggaran.catatan_tambahan}</td>
            <td className="border px-2 py-1 text-center">{pelanggaran.poin}</td>
            <td className="border px-2 py-1 text-center">{pelanggaran.tanggal}</td>
          </tr>
          
        ))}
      </tbody>
      
      </table>
    </div>
  );
};

export default ReportsDetail;
