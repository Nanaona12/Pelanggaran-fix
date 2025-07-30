// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// ✅ GANTI DENGAN URL DAN ANON KEY ASLI DARI SUPABASE DASHBOARD -> Project Settings -> API
// PASTIKAN TIDAK ADA import.meta.env DI SINI UNTUK DEBUGGING INI
const supabaseUrl = 'https://qdujpuhiqiofkltlooup.supabase.co'; // PASTE PROJECT URL KAMU DI SINI
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkdWpwdWhpcWlvZmtsdGxvb3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDIwMzQsImV4cCI6MjA2OTQ3ODAzNH0.20xm0F3dJlj3UKulTAkl5L47n-5LhKT_Of5kGz8VzRc'; // PASTE ANON PUBLIC KEY KAMU DI SINI

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Supabase Client Initialized with URL:', supabaseUrl); // ✅ Tambah log ini
