import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type Student = {
  nis: string;
  nama: string;
  jk: string;
  tingkat: number;
  kelas: string;
};

type Pelanggaran = {
  nis: string;
  poin: number;
};

const StudentData = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [violations, setViolations] = useState<Pelanggaran[]>([]);
  const [tingkatFilter, setTingkatFilter] = useState<number | null>(null);
  const [kelasFilter, setKelasFilter] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      const { data: siswaData, error: siswaError } = await supabase
        .from('siswa')
        .select('*');
      const { data: pelanggaranData, error: pelanggaranError } = await supabase
        .from('pelanggaran')
        .select('nis, poin');

      if (siswaError || pelanggaranError) {
        console.error('Gagal ambil data:', siswaError || pelanggaranError);
        return;
      }

      setStudents(siswaData || []);
      console.log('Data siswa di frontend:', siswaData);
      setViolations(pelanggaranData || []);
    };

    fetchData();
  }, []);

  const filteredStudents = students.filter((s) => {
    const tingkatMatch = tingkatFilter ? s.tingkat === tingkatFilter : true;
    const kelasMatch = kelasFilter ? s.kelas === kelasFilter : true;
    return tingkatMatch && kelasMatch;
  });

  const siswaDenganPelanggaran = filteredStudents.filter((s) =>
    violations.some((v) => v.nis === s.nis)
  );

  const totalPoin = siswaDenganPelanggaran.reduce((acc, siswa) => {
    const poinSiswa = violations
      .filter((v) => v.nis === siswa.nis)
      .reduce((sum, v) => sum + v.poin, 0);
    return acc + poinSiswa;
  }, 0);

  const semuaTingkat = [7, 8, 9];
  const semuaKelas = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Data Siswa</h1>

      <Card>
        <CardHeader>
          <CardTitle>Filter Siswa</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tingkat</Label>
            <Select onValueChange={(val) => setTingkatFilter(parseInt(val))}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih tingkat" />
              </SelectTrigger>
              <SelectContent>
                {semuaTingkat.map((t) => (
                  <SelectItem key={t} value={t.toString()}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Kelas</Label>
            <Select onValueChange={(val) => setKelasFilter(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kelas" />
              </SelectTrigger>
              <SelectContent>
                {semuaKelas.map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hasil Filter</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>
            Jumlah siswa dalam filter:{' '}
            <strong>{filteredStudents.length}</strong>
          </p>
          <p>
            Jumlah siswa yang melakukan pelanggaran:{' '}
            <strong>{siswaDenganPelanggaran.length}</strong>
          </p>
          <p>
            Total poin pelanggaran dari filter ini:{' '}
            <strong className="text-red-600">{totalPoin}</strong>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Siswa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border border-slate-200 rounded-md">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-4 py-2">NIS</th>
                  <th className="px-4 py-2">Nama</th>
                  <th className="px-4 py-2">JK</th>
                  <th className="px-4 py-2">Tingkat</th>
                  <th className="px-4 py-2">Kelas</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.nis} className="border-b">
                    <td className="px-4 py-2">{s.nis}</td>
                    <td className="px-4 py-2">{s.nama}</td>
                    <td className="px-4 py-2">{s.jk}</td>
                    <td className="px-4 py-2">{s.tingkat}</td>
                    <td className="px-4 py-2">{s.kelas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentData;
