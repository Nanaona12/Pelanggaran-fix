import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Save, ArrowLeft } from "lucide-react";

const kelasList = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];
const tingkatList = ["7", "8", "9"];
const tipePelanggaran = [
  "Kejahatan", "Kesusilaan", "Kenakalan", "Pornografi",
  "Bullying", "Kedisiplinan", "Kesopanan"
];

const poinPerTipe: Record<string, number> = {
  Kejahatan: 100,
  Kesusilaan: 90,
  Kenakalan: 70,
  Pornografi: 50,
  Bullying: 40,
  Kedisiplinan: 20,
  Kesopanan: 10
};

const EditViolation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    student: "",
    kelas: "",
    tingkat: "",
    tipe: "",
    date: "",
    notes: "",
    file: null as File | null,
    poin: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("pelanggaran")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error ambil data:", error);
      } else {
        setFormData({
          student: data.student,
          kelas: data.kelas,
          tingkat: data.tingkat,
          tipe: data.tipe,
          date: data.date,
          notes: data.notes,
          file: null,
          poin: poinPerTipe[data.tipe] || 0,
        });
      }
      setLoading(false);
    };

    if (id) fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from("pelanggaran")
      .update({
        student: formData.student,
        kelas: formData.kelas,
        tingkat: formData.tingkat,
        tipe: formData.tipe,
        date: formData.date,
        notes: formData.notes,
        poin: poinPerTipe[formData.tipe] || 0
      })
      .eq("id", id);

    if (error) {
      alert("Gagal update: " + error.message);
    } else {
      navigate("/monitoring");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, file }));
  };

  if (loading) return <p className="text-center mt-10">Loading data...</p>;

  return (
    <div className="flex flex-col items-center px-4 md:px-0">
      <div className="flex items-center mb-6 space-x-4 self-start md:self-center">
      <button
        onClick={() => navigate("/monitoring")}
        className="text-slate-500 hover:text-slate-800 transition"
        aria-label="Kembali ke Monitoring"
        title="Kembali ke Monitoring"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit Pelanggaran Siswa</h1>
          <p className="text-slate-600 text-sm">Perbarui informasi pelanggaran dengan data terbaru</p>
        </div>
      </div>

      <Card className="max-w-2xl w-full border-slate-300 bg-slate-50">
        <CardHeader>
          <CardTitle>Detail Pelanggaran</CardTitle>
          <CardDescription>
            Isi semua informasi yang diperlukan tentang insiden pelanggaran
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nama siswa */}
            <div className="space-y-2">
              <Label htmlFor="student">Nama Siswa *</Label>
              <Input
                id="student"
                value={formData.student}
                onChange={(e) => setFormData(prev => ({ ...prev, student: e.target.value }))}
                required
              />
            </div>

            {/* Kelas & Tingkat */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tingkat">Tingkat *</Label>
                <Select value={formData.tingkat} onValueChange={(val) =>
                  setFormData(prev => ({ ...prev, tingkat: val }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tingkat" />
                  </SelectTrigger>
                  <SelectContent>
                    {tingkatList.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kelas">Kelas *</Label>
                <Select value={formData.kelas} onValueChange={(val) =>
                  setFormData(prev => ({ ...prev, kelas: val }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {kelasList.map((k) => (
                      <SelectItem key={k} value={k}>{k}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tipe pelanggaran & tanggal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipe">Tipe Pelanggaran *</Label>
                <Select value={formData.tipe} onValueChange={(val) =>
                  setFormData(prev => ({ ...prev, tipe: val, poin: poinPerTipe[val] || 0 }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe pelanggaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {tipePelanggaran.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Tanggal Kejadian *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Catatan */}
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan Tambahan</Label>
              <Textarea
                id="notes"
                placeholder="Berikan detail tambahan tentang insiden..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* File upload */}
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
                  <p className="text-sm text-slate-600">
                    {formData.file ? formData.file.name : "Klik untuk upload foto atau dokumen"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Mendukung: Gambar, PDF, dokumen Word
                  </p>
                </label>
              </div>
            </div>

            {/* Tombol aksi */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate("/monitoring")}>
                Batal
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Simpan Pelanggaran
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditViolation;
