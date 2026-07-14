const { OAuth2Client } = require("google-auth-library");
const env = require("../config/env");
const AuthService = require("../services/auth");

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Missing bearer id_token" });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.sub) {
      return res.status(401).json({ error: "Invalid id_token payload" });
    }

    const user = await AuthService.upsertFromGooglePayload(payload);
    req.user = user;
    req.googlePayload = payload;
    next();
  } catch (err) {
    console.error("[auth] id_token verification failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired id_token" });
  }
}

module.exports = { verifyGoogleToken };
