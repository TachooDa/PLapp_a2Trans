# A2 Trans — Generator Surat Penawaran

Web app lokal untuk generate Surat Penawaran PDF secara instan.

## Stack
- **Backend**: Node.js + Express
- **PDF**: Puppeteer (Chromium headless)
- **Storage**: Supabase *(opsional — history penawaran)*
- **UI**: Tailwind CSS

---

## Cara Setup Lokal

### 1. Install dependencies
```bash
npm install
```

### 2. Konfigurasi environment
```bash
cp .env.example .env
```
Buka `.env`, isi `SUPABASE_URL` dan `SUPABASE_ANON_KEY` kalau mau aktifkan history.
Kalau tidak, biarkan saja — app tetap jalan, history hanya tidak tersimpan.

### 3. Jalankan
```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Buka browser → **http://localhost:3000**

---

## Setup Supabase (opsional)

Buat tabel `penawaran` di Supabase SQL Editor:

```sql
create table penawaran (
  id             uuid default gen_random_uuid() primary key,
  nomor_surat    text,
  tanggal        date,
  nama_pelanggan text,
  tujuan         text,
  grand_total    numeric,
  payload        jsonb,
  created_at     timestamptz default now()
);
```

Lalu isi `.env` dengan URL dan anon key dari project Supabase kamu.

---

## Deploy ke Railway / Render

1. Push project ke GitHub
2. Connect repo ke Railway / Render
3. Set environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`)
4. Deploy — selesai!

> **Note**: Puppeteer butuh Chromium. Di Railway / Render sudah tersedia.
> Kalau ada error, tambahkan build command: `npx puppeteer browsers install chrome`

---

## Struktur Project

```
a2trans-penawaran/
├── server.js          ← Entry point Express
├── routes/
│   ├── pdf.js         ← POST /api/pdf → generate & download PDF
│   └── history.js     ← GET/DELETE /api/history → Supabase CRUD
├── src/
│   └── template.js    ← HTML template untuk PDF (edit tampilan surat di sini)
├── public/
│   └── index.html     ← Frontend form (Tailwind CSS)
├── .env.example
└── package.json
```
