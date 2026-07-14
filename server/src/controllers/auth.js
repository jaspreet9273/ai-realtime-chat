const AuthService = require("../services/auth");

class AuthController {
  static async verify(req, res, next) {
    try {
      res.json({ user: AuthService.toPublicUser(req.user) });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
