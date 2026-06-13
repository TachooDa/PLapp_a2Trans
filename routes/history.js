const express = require("express");
const router = express.Router();

// Lazy-init Supabase so app works even without env vars
let supabase = null;

function getClient() {
  if (supabase) return supabase;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key || url.includes("xxxx")) {
    console.warn("Supabase belum dikonfigurasi.");
    return null;
  }

  const { createClient } = require("@supabase/supabase-js");
  const WebSocket = require("ws");

  supabase = createClient(url, key, {
    realtime: {
      transport: WebSocket,
    },
  });

  return supabase;
}

// Save satu penawaran (called internally from pdf route)
// async function savePenawaran(data) {
//   const db = getClient();
//   if (!db) return;

//   const { error } = await db.from("penawaran").insert({
//     nomor_surat: data.nomorSurat,
//     tanggal: data.tanggalSurat,
//     nama_pelanggan: data.namaPelanggan,
//     tujuan: data.tujuan,
//     grand_total:
//       data.items?.reduce((s, i) => s + (i.harga || 0) * (i.qty || 0), 0) || 0,
//     payload: data,
//     created_at: new Date().toISOString(),
//   });

//   if (error) {
//     console.warn("Supabase insert warn:", error.message);
//   }
// }

async function savePenawaran(data) {
  const db = getClient();

  if (!db) {
    console.log("Supabase client NULL");
    return;
  }

  console.log("Data yang akan disimpan:", data);

  const { error } = await db.from("penawaran").insert({
    nomor_surat: data.nomorSurat,
    tanggal: data.tanggalSurat,
    sapaan_nama: data.sapaan,
    nama_pelanggan: data.namaPelanggan,
    tujuan: data.tujuan,
    qty_total: data.items?.reduce((s, i) => s + (i.qty || 0), 0) || 0,
    harga_total: data.items?.reduce((s, i) => s + (i.harga || 0), 0) || 0,
    grand_total:
      data.items?.reduce((s, i) => s + (i.harga || 0) * (i.qty || 0), 0) || 0,
    payload: data,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("INSERT ERROR:", error);
  } else {
    console.log("INSERT SUCCESS");
  }
}

// GET /api/history → list penawaran
router.get("/", async (req, res) => {
  try {
    const db = getClient();

    if (!db) {
      return res.json({
        data: [],
        note: "Supabase belum dikonfigurasi.",
      });
    }

    const { data, error } = await db
      .from("penawaran")
      .select(
        "id, nomor_surat, tanggal, sapaan_nama, nama_pelanggan, tujuan, qty_total, harga_total, grand_total, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

// DELETE /api/history/:id
router.delete("/:id", async (req, res) => {
  try {
    const db = getClient();

    if (!db) {
      return res.status(503).json({
        error: "Supabase belum dikonfigurasi.",
      });
    }

    const { error } = await db
      .from("penawaran")
      .delete()
      .eq("id", req.params.id);

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

// POST /api/history/:id/download  →  re-generate PDF dari payload
router.post("/:id/download", async (req, res) => {
  const db = getClient();
  if (!db)
    return res.status(503).json({ error: "Supabase belum dikonfigurasi." });

  const { data, error } = await db
    .from("penawaran")
    .select("payload, nomor_surat, sapaan_nama, nama_pelanggan, tanggal")
    .eq("id", req.params.id)
    .single();

  if (error || !data)
    return res.status(404).json({ error: "Data tidak ditemukan." });

  const puppeteer = require("puppeteer");
  const { buildHtml } = require("../src/template");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(buildHtml(data.payload), { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "15mm", right: "15mm", bottom: "15mm", left: "15mm" },
  });
  await browser.close();
  const filename = `Surat Penawaran_${data.sapaan_nama} ${data.nama_pelanggan}_${data.tanggal}.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  // tambah ini:
  res.setHeader("X-Filename", filename);
  res.send(pdfBuffer);
});

module.exports = router;
module.exports.savePenawaran = savePenawaran;
