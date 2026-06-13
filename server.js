require("dotenv").config();
const express = require("express");
const path = require("path");
const pdfRoute = require("./routes/pdf");
const historyRoute = require("./routes/history");

const app = express();
// const PORT = process.env.PORT || 3000;
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/pdf", pdfRoute);
app.use("/api/history", historyRoute);

app.listen(PORT, () => {
  console.log(`\n✅  A2 Trans Penawaran running → http://localhost:${PORT}\n`);
});
