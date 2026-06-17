const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const WebSocket = require("ws");

function getClient() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    realtime: { transport: WebSocket },
  });
}

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email dan password wajib diisi." });

  const db = getClient();
  const { data, error } = await db.auth.signInWithPassword({ email, password });

  if (error)
    return res.status(401).json({ error: "Email atau password salah." });

  res.json({ token: data.session.access_token });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.json({ ok: true });
});

module.exports = router;
