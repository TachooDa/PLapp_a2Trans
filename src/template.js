function formatRp(num) {
  if (!num && num !== 0) return "-";
  return "Rp. " + Number(num).toLocaleString("id-ID");
}
function formatDate(str) {
  if (!str) return "";
  const d = new Date(str);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
function formatDateRange(mulai, selesai) {
  if (!mulai) return "";
  const d1 = new Date(mulai),
    d2 = selesai ? new Date(selesai) : null;
  const bulanTahun = d1.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
  const t1 = d1.getDate().toString().padStart(2, "0");
  const t2 = d2 ? d2.getDate().toString().padStart(2, "0") : "";
  return d2 ? `${t1}-${t2} ${bulanTahun}` : `${t1} ${bulanTahun}`;
}
function buildItemRows(items = []) {
  return items
    .filter((i) => i.keterangan)
    .map((item, idx) => {
      const total = (item.harga || 0) * (item.qty || 1);
      return `<tr>
      <td style="text-align:center;padding:6px 10px;border:1px solid #ccc;font-size:9.5pt;">${idx + 1}</td>
      <td style="padding:6px 10px;border:1px solid #ccc;font-size:9.5pt;">${item.keterangan}</td>
      <td style="text-align:center;padding:6px 10px;border:1px solid #ccc;font-size:9.5pt;">${item.qty}</td>
      <td style="text-align:right;padding:6px 10px;border:1px solid #ccc;font-size:9.5pt;white-space:nowrap;">${formatRp(item.harga)}</td>
      <td style="text-align:right;padding:6px 10px;border:1px solid #ccc;font-size:9.5pt;font-weight:600;white-space:nowrap;">${formatRp(total)}</td>
    </tr>`;
    })
    .join("");
}
function buildList(raw = "") {
  const items = raw
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return items
    .map((s, i) => `<li style="margin:4px 0;font-size:9.5pt;">${s}</li>`)
    .join("");
}

function buildHtml(d) {
  const grandTotal = (d.items || [])
    .filter((i) => i.keterangan)
    .reduce((s, i) => s + (i.harga || 0) * (i.qty || 1), 0);
  const sapaanNama = `${d.sapaan || ""} ${d.namaPelanggan || ""}`.trim();
  const dateRange = formatDateRange(d.tanggalMulai, d.tanggalSelesai);
  const inclList = buildList(d.fasilitasInclude || "");
  const exclList = buildList(d.fasilitasExclude || "");
  // const logoHtml = d.logoBase64
  //   ? `<img src="${d.logoBase64}" style="height:70px;max-width:180px;object-fit:contain;"/>`
  //   : "";
  const fs = require("fs");
  const path = require("path");

  let LOGO_BASE64 = "";
  try {
    const logoPath = path.join(__dirname, "../public/logo.png");
    LOGO_BASE64 = `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`;
  } catch (e) {
    LOGO_BASE64 = "";
  }
  const logoHtml = LOGO_BASE64
    ? `<img src="${LOGO_BASE64}" style="height:125px;max-width:225px;object-fit:contain;"/>`
    : `<div style="font-size:14pt;font-weight:800;">${d.namaPerusahaan || "A2 Trans"}</div>`;

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; font-size: 10pt; color: #1a1a1a; background:#fff; }
</style>
</head>
<body style="padding:0;">

  <!-- HEADER: logo kiri, nama perusahaan kanan -->
  <table style="width:100%;margin-bottom:10px;">
    <tr>
      <td style="vertical-align:middle;width:160px;">
        ${logoHtml}
      </td>
      <td style="text-align:right;vertical-align:middle;">
        <div style="font-size:18pt;font-weight:800;color:#1a1a1a;">SURAT PENAWARAN</div>
        <div style="font-size:8.5pt;color:#555;margin-top:3px;line-height:1.6;">
          ${d.alamat || ""}<br>
          ${d.kotaProvinsi || ""}<br>
          ${d.contactPerson || ""} &nbsp;│&nbsp; ${d.email || ""}
        </div>
      </td>
    </tr>
  </table>

  <hr style="border:none;border-top:2px solid #1a1a1a;margin-bottom:14px;"/>

 <!-- TANGGAL -->
  <p style="text-align:right;font-size:9.5pt;margin-bottom:12px;">
    ${d.kotaPengirim || "Bogor"}, ${formatDate(d.tanggalSurat)}
  </p>

  <!-- NOMOR / PERIHAL -->
  <table style="font-size:9.5pt;margin-bottom:18px;">
    <tr><td style="width:80px;padding:2px 0;">Nomor</td><td style="width:10px;">:</td><td>${d.nomorSurat || ""}</td></tr>
    <tr><td style="padding:2px 0;">Lampiran</td><td>:</td><td>-</td></tr>
    <tr><td style="padding:2px 0;">Perihal</td><td>:</td><td>Surat Penawaran Harga Sewa ${d.jenisBus || ""}</td></tr>
  </table>

  <!-- GREETING -->
  <p style="font-size:9.5pt;margin-bottom:18px;">
    Yth, ${sapaanNama}${d.instansi ? "<br>" + d.instansi : ""}
  </p>
  
  <p style="font-size:9.5pt;margin-bottom:14px;">Dengan Hormat,</p>

  <p style="font-size:9.5pt;line-height:1.7;text-align:justify;margin-bottom:18px;">
    Melalui surat ini kami ingin menyampaikan penawaran Harga Sewa Bus
    <strong>${d.jenisBus || ""}</strong> untuk keperluan wisata ke
    <strong>${d.tujuan || ""}</strong> selama <strong>${d.lamaPerjalan || ""}</strong>
    ${dateRange ? `mulai dari <strong>${dateRange}</strong>` : ""} adalah sebagai berikut:
  </p>

  <!-- TABLE -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:18px;">
    <thead>
      <tr style="background:#f0f0f0;">
        <th style="padding:7px 10px;text-align:center;font-size:9.5pt;border:1px solid #ccc;width:30px;">No</th>
        <th style="padding:7px 10px;text-align:center;font-size:9.5pt;border:1px solid #ccc;">Keterangan</th>
        <th style="padding:7px 10px;text-align:center;font-size:9.5pt;border:1px solid #ccc;width:50px;">Qty</th>
        <th style="padding:7px 10px;text-align:center;font-size:9.5pt;border:1px solid #ccc;width:130px;">Harga Satuan</th>
        <th style="padding:7px 10px;text-align:center;font-size:9.5pt;border:1px solid #ccc;width:130px;">Total</th>
      </tr>
    </thead>
    <tbody>${buildItemRows(d.items)}</tbody>
    <tfoot>
      <tr>
        <td colspan="4" style="padding:7px 10px;text-align:right;font-size:9.5pt;font-weight:700;border:1px solid #ccc;font-style:italic;">Grand Total</td>
        <td style="padding:7px 10px;text-align:right;font-size:9.5pt;font-weight:700;border:1px solid #ccc;white-space:nowrap;">${formatRp(grandTotal)}</td>
      </tr>
    </tfoot>
  </table>

  <!-- FASILITAS -->
  ${
    inclList
      ? `
  <p style="font-size:9.5pt;margin-bottom:6px;">
    Berikut Penawaran Harga Terbaik yang dapat kami berikan, harga di atas <strong><em>Sudah</em></strong> termasuk fasilitas berupa:
  </p>
  <ol style="padding-left:22px;margin-bottom:16px;">${inclList}</ol>`
      : ""
  }

  ${
    exclList
      ? `
  <p style="font-size:9.5pt;margin-bottom:6px;">Dan harga di atas <strong><em>belum</em></strong> termasuk:</p>
  <ol style="padding-left:22px;margin-bottom:16px;">${exclList}</ol>`
      : ""
  }

  ${d.catatan ? `<p style="font-size:9pt;color:#555;font-style:italic;margin-bottom:16px;">Catatan: ${d.catatan}</p>` : ""}

  <!-- CLOSING -->
  <p style="font-size:9.5pt;line-height:1.7;text-align:justify;margin-bottom:32px;">
    Demikian penawaran harga sewa bus pariwisata <strong>${d.jenisBus || ""}</strong>
    untuk keperluan wisata ke <strong>${d.tujuan || ""}</strong>
    selama <strong>${d.lamaPerjalan || ""}</strong>
    ${dateRange ? `mulai dari <strong>${dateRange}</strong>` : ""}.
    Kami Tunggu Konfirmasi Selanjutnya Dari <strong>${sapaanNama}</strong> mengenai penawaran kami.
    Atas Perhatian dan Kerja Samanya Kami Ucapkan Terima Kasih.
  </p>

  <!-- SIGNATURE -->
  <table style="width:100%;">
    <tr>
      <td></td>
      <td style="width:180px;text-align:center;font-size:9.5pt;">
        Hormat Kami,<br><br><br><br>
        <strong>${d.namaPenandatangan || "Darussalam"}</strong><br>
        ${d.jabatan || "Staff A2 Trans"}
      </td>
    </tr>
  </table>

</body>
</html>`;
}

module.exports = { buildHtml };
