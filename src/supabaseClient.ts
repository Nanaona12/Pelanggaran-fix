// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// ✅ GANTI DENGAN URL DAN ANON KEY ASLI DARI SUPABASE DASHBOARD -> Project Settings -> API
// PASTIKAN TIDAK ADA import.meta.env DI SINI UNTUK DEBUGGING INI
const supabaseUrl = 'https://fagkufuawtegakjugfhc.supabase.co'; // PASTE PROJECT URL KAMU DI SINI
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhZ2t1ZnVhd3RlZ2FranVnZmhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NDMyOTQsImV4cCI6MjA2NzAxOTI5NH0.ET3qW6-NrSbfBKqf_o9x_dAM0Q0Yo5xa4yaITo8-aNo'; // PASTE ANON PUBLIC KEY KAMU DI SINI

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Supabase Client Initialized with URL:', supabaseUrl); // ✅ Tambah log ini
