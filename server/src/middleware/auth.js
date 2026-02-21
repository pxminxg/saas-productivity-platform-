// server/src/middleware/auth.js
import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization; // "Bearer <token>"
    if (!header) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }

    const [type, token] = header.split(" ");
    if (type !== "Bearer" || !token) {
      return res.status(401).json({ error: "Invalid Authorization format" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Normalize user id so controllers can always use req.user.id
    const userId = payload.userId ?? payload.id;
    if (!userId) {
      return res.status(401).json({ error: "Token payload missing user id" });
    }

    req.user = { id: userId, ...payload };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
