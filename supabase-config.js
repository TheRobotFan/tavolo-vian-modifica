/* supabase-config.js — Chiavi PUBBLICHE di Supabase (la anon key è pubblica per disegno:
   la sicurezza la fanno le policy RLS lato server, non queste chiavi).
   1) Crea il progetto su https://supabase.com/dashboard
   2) Project Settings → API: copia Project URL e anon public key qui sotto
   Finché restano i valori segnaposto, il sito usa i dati locali (data.js). */

const SUPABASE_URL = 'https://kmdfhjqdytcvfatjmpjo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZGZoanFkeXRjdmZhdGptcGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5ODg5NTUsImV4cCI6MjEwNzU2NDk1NX0.EVsgYtuC5j4hVUXT-WCnDygzAww1eCCD8FjSgVD2kqc';

try {
  window.supabaseClient = (window.supabase && SUPABASE_URL.indexOf('http') === 0 && SUPABASE_URL.indexOf('INSERISCI') === -1)
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : undefined;
} catch (e) {
  window.supabaseClient = undefined;
}
