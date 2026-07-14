const { OAuth2Client } = require("google-auth-library");
const env = require("../config/env");
const User = require("../models/user");

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

class AuthService {
  static async verifyIdToken(idToken) {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.sub) {
      throw new Error("Invalid id_token payload");
    }
    return payload;
  }

  static async upsertFromGooglePayload(payload) {
    const user = await User.findOneAndUpdate(
      { googleSub: payload.sub },
      {
        $set: {
          googleSub: payload.sub,
          email: payload.email,
          name: payload.name || payload.email,
          picture: payload.picture,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    return user;
  }

  static toPublicUser(user) {
    return {
      id: user.googleSub,
      email: user.email,
      name: user.name,
      picture: user.picture,
      isPremium: user.isPremium,
    };
  }
}

module.exports = AuthService;
