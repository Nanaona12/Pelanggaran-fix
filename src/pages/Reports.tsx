import React, { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient'; // ✅ Pastikan path ini benar!
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';

// ✅ Tipe data yang diperbaiki
interface Pelanggaran {
  id: number;
  nis: string;
  'tipe pelanggaran': string;
  'Catatan Tambahan': string | null;
  poin: number;
  'Dokumentasi Pendukung': string | null;
  tanggal: string;
  // ✅ Perbaikan di sini: siswa sekarang adalah array objek, atau null
  siswa:
    | {
        nama: string;
        kelas: string;
        tingkat: number;
      }[]
    | null;
}

const monthList = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const Reports = () => {
  const { user, role, loading: authLoading } = useAuth();

  const currentYear = new Date().getFullYear();
  const [bulan, setBulan] = useState('Januari');
  const [tahun, setTahun] = useState(currentYear.toString());
  const [data, setData] = useState<Pelanggaran[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const pdfContentRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (authLoading || !user || role !== 'admin') {
      setLoading(false);
      return;
    }

    try {
      const monthIndex = monthList.indexOf(bulan) + 1;
      const startDate = `${tahun}-${monthIndex.toString().padStart(2, '0')}-01`;

      let nextMonthIndex = monthIndex + 1;
      let nextYear = parseInt(tahun);
      if (nextMonthIndex > 12) {
        nextMonthIndex = 1;
        nextYear += 1;
      }
      const endDate = `${nextYear}-${nextMonthIndex
        .toString()
        .padStart(2, '0')}-01`;

      const { data: fetchedData, error: fetchError } = await supabase
        .from('pelanggaran')
        .select(
          `id, nis, poin, "tipe pelanggaran", "Catatan Tambahan", "Dokumentasi Pendukung", tanggal, siswa(nama, kelas, tingkat)`
        )
        .gte('tanggal', startDate)
        .lt('tanggal', endDate);

      if (fetchError) {
        throw fetchError;
      }

      // ✅ Casting ke tipe Pelanggaran[] yang sudah diperbaiki
      const validData = fetchedData as Pelanggaran[];
      setData(validData);

      const counted = validData.reduce((acc: Record<string, number>, curr) => {
        acc[curr['tipe pelanggaran']] =
          (acc[curr['tipe pelanggaran']] || 0) + 1;
        return acc;
      }, {});
      setSummary(counted);
    } catch (err: any) {
      console.error('Gagal mengambil data laporan:', err.message);
      setError('Gagal memuat laporan: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [bulan, tahun, user, role, authLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExportPDF = async () => {
    if (!pdfContentRef.current) {
      console.error('Elemen PDF tidak ditemukan.');
      setError('Gagal mengekspor PDF: Konten tidak ditemukan.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const canvas = await html2canvas(pdfContentRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      const margin = 10;
      const contentWidth = pdfWidth - margin * 2;
      const contentHeight = (imgProps.height * contentWidth) / imgProps.width;

      let position = 0;
      let heightLeft = pdfHeight;

      pdf.addImage(
        imgData,
        'PNG',
        margin,
        position + margin,
        contentWidth,
        contentHeight
      );
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(
          imgData,
          'PNG',
          margin,
          position + margin,
          contentWidth,
          contentHeight
        );
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save(`Laporan_Pelanggaran_${bulan}_${tahun}.pdf`);
    } catch (pdfError: any) {
      console.error('Gagal mengekspor PDF:', pdfError.message);
      setError('Gagal mengekspor PDF: ' + pdfError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (data.length === 0) {
      setError('Tidak ada data untuk diekspor ke Excel.');
      return;
    }
    setError(null);
    const dataForExcel = data.map((item) => ({
      ID: item.id,
      NIS: item.nis,
      'Tipe Pelanggaran': item['tipe pelanggaran'],
      'Catatan Tambahan': item['Catatan Tambahan'] || '-',
      Poin: item.poin,
      Tanggal: item.tanggal,
      'Dokumentasi Pendukung': item['Dokumentasi Pendukung'] || '-',
      // ✅ Perbaikan di sini: Akses siswa[0]
      'Nama Siswa':
        item.siswa && item.siswa.length > 0 ? item.siswa[0].nama : 'N/A',
      Kelas: item.siswa && item.siswa.length > 0 ? item.siswa[0].kelas : 'N/A',
      Tingkat:
        item.siswa && item.siswa.length > 0 ? item.siswa[0].tingkat : 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan');
    XLSX.writeFile(workbook, `Laporan_Pelanggaran_${bulan}_${tahun}.xlsx`);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const importedData = XLSX.utils.sheet_to_json(ws);

          console.log('Data siap diimpor:', importedData);

          const formattedData = importedData.map((row: any) => ({
            nis: row.NIS,
            'tipe pelanggaran': row['Tipe Pelanggaran'],
            'Catatan Tambahan': row.Catatan,
            poin: row.Poin,
            tanggal: row.Tanggal,
            'Dokumentasi Pendukung': row['Dokumentasi Pendukung'] || null,
          }));

          const { error: insertError } = await supabase
            .from('pelanggaran')
            .insert(formattedData);
          if (insertError) {
            throw insertError;
          }
          alert('Data berhasil diimpor!');
          fetchData();
        } catch (innerErr: any) {
          console.error(
            'Gagal memproses file Excel atau mengimpor:',
            innerErr.message
          );
          setError('Gagal impor data: ' + innerErr.message);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsBinaryString(file);
    } catch (outerErr: any) {
      console.error('Kesalahan membaca file:', outerErr.message);
      setError('Kesalahan membaca file: ' + outerErr.message);
      setLoading(false);
    }
  };

  const totalInsiden = Object.values(summary).reduce((a, b) => a + b, 0);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Memuat autentikasi...</p>
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yellow-50">
        <div
          className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md"
          role="alert"
        >
          <p className="font-bold">Akses Ditolak!</p>
          <p>Anda tidak memiliki izin untuk melihat halaman laporan.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-600 text-xl">
        <p>Memuat laporan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 text-lg">
        <p>Terjadi Kesalahan:</p>
        <p className="mt-2 text-base">{error}</p>
        <p className="mt-4 text-sm text-gray-700">
          Mohon periksa koneksi atau coba lagi nanti.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6">
        📊 Laporan Pelanggaran Siswa
      </h2>

      <Card className="bg-white p-6 rounded-lg shadow-md mb-8">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700">
            Pilih Periode Laporan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4 mb-6">
            <div className="flex-1 min-w-[120px] space-y-2">
              <Label htmlFor="bulan">Bulan</Label>
              <Select value={bulan} onValueChange={setBulan}>
                <SelectTrigger id="bulan" className="rounded-md">
                  <SelectValue placeholder="Pilih bulan" />
                </SelectTrigger>
                <SelectContent>
                  {monthList.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[100px] space-y-2">
              <Label htmlFor="tahun">Tahun</Label>
              <Select value={tahun} onValueChange={setTahun}>
                <SelectTrigger id="tahun" className="rounded-md">
                  <SelectValue placeholder="Pilih tahun" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(3)].map((_, i) => {
                    const year = (currentYear - i).toString();
                    return (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={fetchData}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              disabled={loading}
            >
              Buat Laporan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ✅ Konten Laporan untuk PDF Export (Disembunyikan, dirender ke ref) */}
      {/* Ini adalah komponen yang akan di-render dan kemudian diubah menjadi PDF */}
      <div
        ref={pdfContentRef}
        style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}
      >
        <ReportsContentForPDF
          data={data}
          bulan={bulan}
          tahun={tahun}
          summary={summary}
          totalInsiden={totalInsiden}
        />
      </div>

      {/* Ringkasan Statistik Pelanggaran (Tampilan di UI) */}
      <Card className="bg-white p-6 rounded-lg shadow-md mb-8">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700">
            Ringkasan Statistik
          </CardTitle>
          <CardDescription>
            Statistik pelanggaran berdasarkan jenis untuk periode yang dipilih.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totalInsiden === 0 && !loading && !error ? (
            <p className="text-gray-500 text-center py-4">
              Tidak ada data pelanggaran untuk periode ini.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(summary).map(([tipe, count]) => (
                <div
                  key={tipe}
                  className="bg-blue-50 border border-blue-200 p-5 rounded-lg text-center transform hover:scale-105 transition-transform duration-200"
                >
                  <h4 className="font-semibold text-blue-800 text-lg mb-1">
                    {tipe}
                  </h4>
                  <p className="text-4xl font-extrabold text-blue-700">
                    {count}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    ({((count / totalInsiden) * 100).toFixed(1)}% dari total)
                  </p>
                </div>
              ))}
              {totalInsiden > 0 && (
                <div className="bg-green-50 border border-green-200 p-5 rounded-lg text-center transform hover:scale-105 transition-transform duration-200 col-span-1 sm:col-span-2 lg:col-span-1 flex items-center justify-center">
                  <div>
                    <h4 className="font-semibold text-green-800 text-lg mb-1">
                      Total Insiden
                    </h4>
                    <p className="text-4xl font-extrabold text-green-700">
                      {totalInsiden}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Opsi Ekspor & Impor */}
      <Card className="bg-white p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700">
            Opsi Laporan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              Ekspor Laporan
            </h3>
            <Button
              onClick={handleExportPDF}
              className="flex items-center justify-center w-full px-6 py-3 bg-red-600 text-white font-medium rounded-md shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
              disabled={loading || data.length === 0}
            >
              <span className="mr-2">📄</span> Ekspor ke PDF
            </Button>
            <Button
              onClick={handleExportExcel}
              className="flex items-center justify-center w-full px-6 py-3 bg-green-600 text-white font-medium rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
              disabled={loading || data.length === 0}
            >
              <span className="mr-2">📊</span> Ekspor ke Excel
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              Impor Data Pelanggaran
            </h3>
            <div className="space-y-2">
              <Label htmlFor="import-file">
                Pilih file Excel (.xlsx, .xls)
              </Label>
              <Input
                id="import-file"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleImportExcel}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer rounded-md"
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informasi Tambahan */}
      <Card className="bg-white p-6 rounded-lg shadow-md mt-8">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700">
            Tentang Laporan Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-6 text-gray-600 space-y-1">
            <li>
              Laporan ini merinci data pelanggaran siswa berdasarkan periode
              bulan dan tahun yang dipilih.
            </li>
            <li>Menyediakan statistik jumlah insiden per jenis pelanggaran.</li>
            <li>
              Fitur ekspor memungkinkan Anda menyimpan laporan dalam format PDF
              atau Excel.
            </li>
            <li>
              Fitur impor memungkinkan Anda menambahkan data pelanggaran dari
              file Excel.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;

// ✅ Komponen baru untuk konten PDF (ini menggantikan ReportsDetail di dalam div tersembunyi)
// Ini akan dirender secara terpisah hanya untuk tujuan ekspor PDF
interface ReportsContentForPDFProps {
  data: Pelanggaran[];
  bulan: string;
  tahun: string;
  summary: Record<string, number>;
  totalInsiden: number;
}

const ReportsContentForPDF: React.FC<ReportsContentForPDFProps> = ({
  data,
  bulan,
  tahun,
  summary,
  totalInsiden,
}) => {
  return (
    <div className="p-8 bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
      
      <div className="flex items-center space-x-4">
        <img src="/logosmp1pwk.png" alt="Logo Sekolah" className="w-20 h-20 object-contain" />
        <div>
          <h1 className="text-lg font-bold uppercase">SMPN 1 PURWAKARTA</h1>
          <p>JL. Kolonel Kornel Singawinata, No. 60, Negeri Kidul, Nagri Kidul, Kec. Purwakarta, Kabupaten Purwakarta, Jawa Barat 41111</p>
          <p>Email: smp1purwakarta@gmail.com, Phone: (0264) 200210
          </p>
        </div>
      </div>
      <br />

      <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">
        Laporan Pelanggaran Siswa
      </h1>
      <h2 className="text-xl font-semibold text-gray-700 text-center mb-8">
        Periode: {bulan} {tahun}
      </h2>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Ringkasan Statistik Pelanggaran
        </h3>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left">
                Jenis Pelanggaran
              </th>
              <th className="border border-gray-300 p-2 text-left">
                Jumlah Insiden
              </th>
              <th className="border border-gray-300 p-2 text-left">
                % dari Total
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(summary).map(([tipe, count]) => (
              <tr key={tipe}>
                <td className="border border-gray-300 p-2">{tipe}</td>
                <td className="border border-gray-300 p-2">{count}</td>
                <td className="border border-gray-300 p-2">
                  {((count / totalInsiden) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
            <tr className="font-bold bg-gray-50">
              <td className="border border-gray-300 p-2">
                Total Semua Insiden
              </td>
              <td className="border border-gray-300 p-2">{totalInsiden}</td>
              <td className="border border-gray-300 p-2">100.0%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Detail Pelanggaran
        </h3>
        {data.length === 0 ? (
          <p className="text-gray-500">
            Tidak ada detail pelanggaran untuk periode ini.
          </p>
        ) : (
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">
                  Tanggal
                </th>
                <th className="border border-gray-300 p-2 text-left">
                  Nama Siswa
                </th>
                <th className="border border-gray-300 p-2 text-left">Kelas</th>
                <th className="border border-gray-300 p-2 text-left">
                  Tipe Pelanggaran
                </th>
                <th className="border border-gray-300 p-2 text-left">Poin</th>
                <th className="border border-gray-300 p-2 text-left">
                  Catatan
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td className="border border-gray-300 p-2">
                    {new Date(item.tanggal).toLocaleDateString('id-ID')}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {item.siswa && item.siswa.length > 0
                      ? item.siswa[0].nama
                      : 'N/A'}
                  </td>{' '}
                  {/* ✅ Akses siswa[0] */}
                  <td className="border border-gray-300 p-2">
                    {item.siswa && item.siswa.length > 0
                      ? item.siswa[0].kelas
                      : 'N/A'}
                  </td>{' '}
                  {/* ✅ Akses siswa[0] */}
                  <td className="border border-gray-300 p-2">
                    {item['tipe pelanggaran']}
                  </td>
                  <td className="border border-gray-300 p-2">{item.poin}</td>
                  <td className="border border-gray-300 p-2">
                    {item['Catatan Tambahan'] || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-10 text-center">
        Laporan dibuat pada: {new Date().toLocaleDateString('id-ID')}{' '}
        {new Date().toLocaleTimeString('id-ID')}
      </p>
    </div>
  );
};
