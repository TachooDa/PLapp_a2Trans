const { createClient } = require("@supabase/supabase-js");
const WebSocket = require("ws");

module.exports = async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const db = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { realtime: { transport: WebSocket } },
  );

  const { data, error } = await db.auth.getUser(token);

  if (error || !data.user)
    return res.status(401).json({ error: "Token tidak valid." });

  req.user = data.user;
  next();
};
