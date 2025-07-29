import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // ✅ Pastikan path-nya sesuai
import { pelanggaran } from "@/lib/utils/constants";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'; // ✅ Import Dialog components

// Utils & Constants (pastikan path-nya benar)
import classNames from 'classnames';
import { tentukanStatus, getStatusColor } from '@/lib/utils/helpers'; // Pastikan path benar
import {
  hitungPoin,
  kelasList,
  poinPerTipe,
  tingkatList,
  tipePelanggaran,
} from '@/lib/utils/constants'; // Pastikan path benar
import { useAuth } from '@/contexts/AuthContext';

// Tipe data untuk item pelanggaran yang dikelompokkan
interface GroupedViolationItem {
  nis: string;
  student: string;
  kelas: string;
  tingkat: number;
  totalPoin: number;
  violations: {
    id: number;
    tipe: string;
    catatan: string;
    poinPelanggaran: number;
    calculatedPoin: number;
    tanggal: string;
  }[];
}

const Monitoring = () => {
  const { user, role, loading: authLoading } = useAuth(); // ✅ Dapatkan user, role, loading dari AuthContext
  const [data, setData] = useState<GroupedViolationItem[]>([]); // ✅ Gunakan tipe data yang sudah didefinisikan
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterKelas, setFilterKelas] = useState<string>('Semua');
  const [filterTingkat, setFilterTingkat] = useState<string>('Semua');
  const [filterTipe, setFilterTipe] = useState<string>('Semua');
  const navigate = useNavigate();

  // State untuk modal konfirmasi hapus
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [violationToDelete, setViolationToDelete] = useState<number | null>(
    null
  );
  const [violationDetails, setViolationDetails] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    studentName: '',
    nis: '',
    grade: '',
    classLetter: '',
    violationType: '',
    date: '',
    notes: '',
    file: null as File | null,
  });

  const handleEdit = async () => {
    if (!violationToEdit) return;
  
    const updatedData = {
      "tipe pelanggaran": formData.violationType,
      "Catatan Tambahan": formData.notes,
      poin: hitungPoin(formData.violationType, formData.notes),
    };
  
    const { error } = await supabase
      .from("pelanggaran")
      .update(updatedData)
      .eq("id", violationToEdit.id);
  
    if (error) {
      console.error("Gagal update:", error.message);
      alert("Gagal menyimpan perubahan.");
    } else {
      alert("Pelanggaran berhasil diperbarui.");
      setShowEditModal(false);
      fetchData(); // pastikan fungsi ini ada untuk reload data pelanggaran
    }
  };
  
  

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // ✅ Hanya fetch jika user sudah login dan role diizinkan
    if (authLoading || !user || (role !== 'admin' && role !== 'guru_bk')) {
      setLoading(false);
      return;
    }

    try {
      const { data: pelanggaranData, error } = await supabase
        .from('pelanggaran')
        // ✅ Perbaikan: Gunakan nama kolom yang benar dengan spasi dan relasi
        .select(
          `id, nis, poin, "tipe pelanggaran", "Catatan Tambahan", tanggal, siswa(nama, kelas, tingkat)`
        );

      if (error) {
        throw error;
      }

      const grouped = pelanggaranData.reduce(
        (acc: { [key: string]: GroupedViolationItem }, curr: any) => {
          const key = curr.nis;
          // ✅ Pastikan poin diambil dari kolom 'poin' di DB, atau hitung jika null
          const tipe = curr['tipe pelanggaran'];
          const catatan = curr['Catatan Tambahan'];
          const poin = curr.poin ?? hitungPoin(tipe, catatan);

          if (!acc[key]) {
            acc[key] = {
              nis: key,
              student: curr.siswa?.nama || 'Nama Tidak Ditemukan',
              kelas: curr.siswa?.kelas || '-',
              tingkat: curr.siswa?.tingkat || '-',
              totalPoin: 0,
              violations: [],
            };
          }

          acc[key].totalPoin += poin;
          acc[key].violations.push({
            id: curr.id,
            tipe: curr['tipe pelanggaran'], // ✅ Akses dengan bracket notation
            catatan: curr['Catatan Tambahan'], // ✅ Akses dengan bracket notation
            poinPelanggaran: curr.poin,
            calculatedPoin: poin,
            tanggal: curr.tanggal,
          });

          return acc;
        },
        {}
      );

      setData(Object.values(grouped));
    } catch (err: any) {
      console.error('Gagal fetch data pelanggaran:', err.message);
      setError('Gagal memuat data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [user, role, authLoading]); // ✅ Tambah dependencies dari useAuth

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fungsi untuk handle konfirmasi hapus
  const handleDeleteConfirm = (violationId: number) => {
    setViolationToDelete(violationId);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (violationToDelete === null) return;

    setLoading(true);
    setError(null);
    setShowDeleteConfirm(false); // Tutup modal

    try {
      const { error: deleteError } = await supabase
        .from('pelanggaran')
        .delete()
        .eq('id', violationToDelete);

      if (deleteError) throw deleteError;

      fetchData(); // Refresh data setelah penghapusan
    } catch (deleteErr: any) {
      console.error('Gagal menghapus pelanggaran:', deleteErr.message);
      setError('Gagal menghapus pelanggaran: ' + deleteErr.message);
    } finally {
      setLoading(false);
      setViolationToDelete(null);
    }
  };

  const [showEditModal, setShowEditModal] = useState(false);
  const [violationToEdit, setViolationToEdit] = useState<any>(null); // Store violation data here


  const filteredData = data.filter((item) => {
    const matchNama = item.student
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchKelas = filterKelas === 'Semua' || item.kelas === filterKelas;
    const matchTingkat =
      filterTingkat === 'Semua' || item.tingkat.toString() === filterTingkat; // ✅ Konversi tingkat ke string untuk perbandingan
    const matchTipe =
      filterTipe === 'Semua' ||
      item.violations.some((v: any) => v.tipe === filterTipe);
    return matchNama && matchKelas && matchTingkat && matchTipe;
  });

  // --- Render Kondisi Loading dan Error (dari AuthContext atau data fetch) ---
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Memuat autentikasi...</p>
      </div>
    );
  }

  // ✅ Batasi akses: Hanya Admin dan Guru BK yang bisa mengakses halaman ini
  if (role !== 'admin' && role !== 'guru_bk') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yellow-50">
        <div
          className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md"
          role="alert"
        >
          <p className="font-bold">Akses Ditolak!</p>
          <p>
            Anda tidak memiliki izin untuk melihat halaman monitoring
            pelanggaran.
          </p>
        </div>
      </div>
    );
  }

  // Loading data
  if (loading) {
    return (
      <div className="p-6 text-center text-lg text-gray-700">
        <p>Memuat data pelanggaran siswa...</p>
        <p className="mt-2 text-sm">Mohon tunggu sebentar.</p>
      </div>
    );
  }

  // Error fetching data
  if (error) {
    return (
      <div className="p-6 text-center text-lg text-red-600">
        <p>Terjadi Kesalahan:</p>
        <p className="mt-2 text-sm">{error}</p>
        <p className="mt-4 text-sm text-gray-600">
          Pastikan konfigurasi Supabase sudah benar dan kebijakan RLS diatur
          dengan tepat.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">
        Monitoring Pelanggaran Siswa
      </h2>
      <p className="text-slate-600 mt-1">
        Lihat dan kelola rekapitulasi pelanggaran siswa.
      </p>

      {/* Filter Bar */}
      <Card className="rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Filter Data</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            type="text"
            placeholder="Cari nama siswa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-md"
          />

          {/* Dropdown Filter Kelas */}
          <Select value={filterKelas} onValueChange={setFilterKelas}>
            <SelectTrigger className="rounded-md">
              <SelectValue placeholder="Semua Kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Semua">Semua Kelas</SelectItem>
              {kelasList.map((k) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Dropdown Filter Tingkat */}
          <Select value={filterTingkat} onValueChange={setFilterTingkat}>
            <SelectTrigger className="rounded-md">
              <SelectValue placeholder="Semua Tingkat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Semua">Semua Tingkat</SelectItem>
              {tingkatList.map((t) => (
                <SelectItem key={t} value={t.toString()}>
                  {' '}
                  {/* ✅ Konversi ke string */}
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Dropdown Filter Tipe Pelanggaran */}
          <Select value={filterTipe} onValueChange={setFilterTipe}>
            <SelectTrigger className="rounded-md">
              <SelectValue placeholder="Semua Jenis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Semua">Semua Jenis</SelectItem>
              {tipePelanggaran.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() => {
              setSearchTerm('');
              setFilterKelas('Semua');
              setFilterTingkat('Semua');
              setFilterTipe('Semua');
            }}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Hapus Filter
          </Button>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">
            Daftar Rekapitulasi Pelanggaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredData.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              Tidak ada data pelanggaran yang ditemukan untuk filter ini.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-slate-200 rounded-md overflow-hidden">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-4 py-2 border-r">Nama</th>
                    <th className="px-4 py-2 border-r">Kelas</th>
                    <th className="px-4 py-2 border-r">Tingkat</th>
                    <th className="px-4 py-2 border-r">Total Poin</th>
                    <th className="px-4 py-2 border-r">Status</th>
                    <th className="px-4 py-2 border-r">Detail Pelanggaran</th>
                    <th className="px-4 py-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => {
                    const status = tentukanStatus(item.totalPoin);
                    const statusClass = getStatusColor(status);
                    return (
                      <tr
                        key={item.nis}
                        className="border-b border-slate-200 hover:bg-slate-50"
                      >
                        <td className="p-2 border-r font-medium">
                          {item.student}
                        </td>
                        <td className="p-2 border-r">{item.kelas}</td>
                        <td className="p-2 border-r">{item.tingkat}</td>
                        <td className="p-2 border-r text-red-600 font-semibold">
                          {item.totalPoin}
                        </td>
                        <td
                          className={classNames(
                            'p-2 border-r text-center font-medium rounded-md', // ✅ Tambah rounded-md
                            statusClass
                          )}
                        >
                          {status}
                        </td>
                        <td className="p-2 border-r">
                          {item.violations.length > 0 ? (
                            <ul className="list-disc pl-4 space-y-1">
                              {item.violations.map((v) => (
                                <li key={v.id}>
                                  {v.tipe} ({v.calculatedPoin} poin) -{' '}
                                  {new Date(v.tanggal).toLocaleDateString(
                                    'id-ID'
                                  )}
                                  {v.catatan && ` - Catatan: ${v.catatan}`}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span>Tidak ada pelanggaran tercatat.</span>
                          )}
                        </td>
                        <td className="p-2 border-r space-y-1 flex flex-col items-start">
                          {' '}
                          {/* ✅ Flex column untuk tombol */}
                          {item.violations.map((v) => (
                            <div key={v.id} className="flex gap-2 mb-1">
                              {' '}
                              {/* ✅ Flex row untuk setiap set tombol */}
                              {/* Button Edit */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-md" // ✅ Tambah rounded-md
                                onClick={() => {
                                  setViolationToEdit(v); // Pass the current violation object
                                  setShowEditModal(true);
                                }}
                                
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="rounded-md" // ✅ Tambah rounded-md
                                onClick={() => handleDeleteConfirm(v.id)} // ✅ Panggil handler konfirmasi
                              >
                                Hapus
                              </Button>
                            </div>
                          ))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>Edit Pelanggaran</DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="violationType">Tipe Pelanggaran</Label>
              <Select
                value={formData.violationType}
                onValueChange={(value) => {
                  setViolationToEdit((prev: any) => ({
                    ...prev,
                    tipe: value,
                  }));
                  setFormData((prev) => ({
                    ...prev,
                    violationType: value,
                    notes: '',
                  }));
                  setViolationDetails(Object.keys(pelanggaran[value] || {}));
                  }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe pelanggaran" />
                </SelectTrigger>
                <SelectContent>
                  {tipePelanggaran.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {violationDetails.length >= 0 && (
              <div>
                <Label htmlFor="notes">Catatan</Label>
                <Select
                  value={formData.notes}
                  onValueChange={(val) =>
                    setFormData((prev) => ({ ...prev, notes: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih catatan pelanggaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {violationDetails.map((note) => (
                      <SelectItem key={note} value={note}>
                        {note}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.violationType && formData.notes && (
              <p className="text-sm text-muted-foreground">
                Poin: {pelanggaran[formData.violationType]?.[formData.notes] || 0}
              </p>
            )}

            <Button onClick={handleEdit}>Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>


      {/* ✅ Modal Konfirmasi Hapus */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[425px] rounded-lg">
          {' '}
          {/* ✅ Tambah rounded-lg */}
          <DialogHeader>
            <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pelanggaran ini? Tindakan ini
              tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="rounded-md"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="rounded-md"
            >
              {loading ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Monitoring;
