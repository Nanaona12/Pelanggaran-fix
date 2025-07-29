// src/pages/WaliKelasDashboard.tsx
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
// Import useAuth jika Wali Kelas Dashboard perlu tahu kelasDiampu

const WaliKelasDashboard: React.FC = () => {
  const { kelasDiampu } = useAuth(); // Dapatkan kelasDiampu jika perlu
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold text-slate-800 mb-4">
        Dashboard Wali Kelas
      </h2>
      <p className="text-slate-700 mb-4">
        Selamat datang di dashboard Wali Kelas.
        {kelasDiampu && ` Anda mengampu kelas ${kelasDiampu}.`}
      </p>
      <p>Di sini Anda dapat melihat ringkasan data siswa di kelas Anda.</p>
      {/* Tambahkan konten spesifik Wali Kelas di sini */}
    </div>
  );
};
export default WaliKelasDashboard;
