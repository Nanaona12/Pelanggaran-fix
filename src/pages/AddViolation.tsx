import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { pelanggaran } from '@/lib/utils/constants';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Save, ArrowLeft } from 'lucide-react';

import { Combobox } from '@/components/ui/combobox'; // pastikan ini sudah tersedia

type Student = {
  name: string;
  nis: string;
  grade: string;
  classLetter: string;
};

const AddViolation = () => {
  const navigate = useNavigate();
  const [studentList, setStudentList] = useState<Student[]>([]);
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
  

  const grades = ['7', '8', '9'];
  const classLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
  const violationTypes = [
    'Kejahatan',
    'Kesusilaan',
    'Kenakalan',
    'Pornografi',
    'Bullying',
    'Kedisiplinan',
    'Kesopanan',
  ];

  useEffect(() => {
    const fetchStudents = async () => {
      const { data, error } = await supabase.from('siswa').select('*');
      if (error) {
        console.error('Gagal memuat data siswa:', error.message);
        return;
      }

      const students: Student[] = data.map((s: any) => ({
        name: s.nama,
        grade: s.tingkat,
        classLetter: s.kelas,
        nis: s.nis,
      }));

      setStudentList(students);
    };

    fetchStudents();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { studentName, grade, classLetter, violationType, date, notes } =
      formData;

    const { error } = await supabase.from('pelanggaran').insert([
      {
        nama_siswa: studentName,
        nis: formData.nis,
        tingkat: grade,
        kelas: classLetter,
        "tipe pelanggaran": violationType,
        tanggal: date,
        "Catatan Tambahan": notes,
      },
    ]);

    if (error) {
      console.error('Gagal simpan:', error.message);
      alert(`Gagal menyimpan pelanggaran.\nAlasan: ${error.message}`);
    } else {
      alert('Pelanggaran berhasil disimpan!');
      navigate('/dashboard');
    }
  };
  
  const [violationDetails, setViolationDetails] = useState<string[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="flex items-center p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Tambah Pelanggaran Baru
          </h1>
          <p className="text-slate-600 mt-1">Catat insiden pelanggaran siswa</p>
        </div>
      </div>

      <div className="flex justify-center">
        <Card className="max-w-2xl w-full border-slate-300 bg-slate-50">
          <CardHeader>
            <CardTitle>Detail Pelanggaran</CardTitle>
            <CardDescription>
              Isi semua informasi yang diperlukan tentang insiden pelanggaran
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentName">Nama Siswa *</Label>
                  <Combobox
                    options={studentList.map((s) => s.name)}
                    placeholder="Cari nama siswa..."
                    value={formData.studentName}
                    onSelect={(selectedName) => {
                      const selectedStudent = studentList.find(
                        (s) => s.name === selectedName
                      );
                      if (selectedStudent) {
                        setFormData((prev) => ({
                          ...prev,
                          studentName: selectedStudent.name,
                          nis: selectedStudent.nis,
                          grade: selectedStudent.grade,
                          classLetter: selectedStudent.classLetter,
                        }));
                      }
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="nis">NIS *</Label>
                  <Input
                    id="nis"
                    value={formData.nis}
                    readOnly
                    placeholder="Nomor Induk Siswa"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">Tingkat *</Label>
                  <Select
                    value={formData.grade}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, grade: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tingkat" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="classLetter">Kelas *</Label>
                  <Select
                    value={formData.classLetter}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, classLetter: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      {classLetters.map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="violationType">Tipe Pelanggaran *</Label>
                  <Select
                    value={formData.violationType}
                    onValueChange={(value) => {
                      setFormData((prev) => ({
                        ...prev,
                        violationType: value,
                        notes: '', // reset saat tipe berubah
                      }));
                      setViolationDetails(Object.keys(pelanggaran[value] || {}));
                    }}
                  >

                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe pelanggaran" />
                    </SelectTrigger>
                    <SelectContent>
                      {violationTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>


              <div className="space-y-2">
                <Label htmlFor="date">Tanggal Kejadian *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan Tambahan *</Label>
                {violationDetails.length > 0 ? (
                  <Select
                    value={formData.notes}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, notes: value }))
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
                ) : (
                  <p className="text-sm text-slate-500 italic">
                    Pilih tipe pelanggaran terlebih dahulu.
                  </p>
                )}

                {formData.violationType && formData.notes && (
                  <p className="text-sm text-slate-600 mt-1">
                    <strong>Poin:</strong>{' '}
                    {pelanggaran[formData.violationType]?.[formData.notes] ?? 'N/A'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Dokumentasi Pendukung</Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <input
                    id="file"
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="file" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">
                      {formData.file
                        ? formData.file.name
                        : 'Klik untuk upload foto atau dokumen'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Mendukung: Kamera, Galeri, PDF, Word
                    </p>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Pelanggaran
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddViolation;
