const express = require("express");
const puppeteer = require("puppeteer");
const router = express.Router();
const { savePenawaran } = require("./history");
const { buildHtml } = require("../src/template");

// POST /api/pdf  →  returns PDF buffer
router.post("/", async (req, res) => {
  const data = req.body;

  if (!data.namaPelanggan || !data.tujuan) {
    return res
      .status(400)
      .json({ error: "namaPelanggan dan tujuan wajib diisi." });
  }

  try {
    const html = buildHtml(data);

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "15mm", right: "15mm", bottom: "15mm", left: "15mm" },
    });

    await browser.close();

    savePenawaran(data).catch((err) =>
      console.error("savePenawaran error:", err),
    );

    const filename = `Surat Penawaran_${data.sapaan} ${data.namaPelanggan}_${data.tanggalSurat}.pdf`;
    console.log("filename:", filename);
    console.log("namaPelanggan:", data.namaPelanggan);
    console.log("tanggalSurat:", data.tanggalSurat);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF error:", err);
    res.status(500).json({ error: "Gagal generate PDF.", detail: err.message });
  }
});

module.exports = router;
