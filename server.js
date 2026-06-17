require("dotenv").config();
const express = require("express");
const path = require("path");
const pdfRoute = require("./routes/pdf");
const historyRoute = require("./routes/history");
const authRoute = require("./routes/auth");
const authMiddleware = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "2mb" }));

// serve login.html dulu sebelum static
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});
app.get("/app", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use(express.static(path.join(__dirname, "public")));

// auth route — tidak perlu token
app.use("/api/auth", authRoute);

// semua /api lain perlu token
app.use("/api/pdf", authMiddleware, pdfRoute);
app.use("/api/history", authMiddleware, historyRoute);

app.listen(PORT, () => {
  console.log(`\n✅  A2 Trans Penawaran running → http://localhost:${PORT}\n`);
});
