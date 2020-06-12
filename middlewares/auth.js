const basicAuth = require("basic-auth");
const jwt = require("jsonwebtoken");
const { Forbbiden } = require("../core/http-exception");
class Auth {
  constructor(level) {
    this.level = level;
    Auth.USER = 8;
    Auth.ADMIN = 16;
  }

  get m() {
    return async (ctx, next) => {
      // token 检测
      // token 开发者传递令牌
      const userToken = basicAuth(ctx.req);
      /*
        token: {
            name: // token值,
            pass: ''
        }
      */
      if (!userToken || !userToken.name) {
        throw new Forbbiden("token不合法");
      }
      try {
        var decode = jwt.verify(
          userToken.name,
          global.config.security.secretKey
        );
      } catch (e) {
        // token不合法
        throw new Forbbiden("token 不合法");
        // token 过期
        if (e.name === "TokenExpiredError") {
          throw new Forbbiden("token令牌已过期");
        }
      }
      if (decode.scope < this.level) {
        throw new Forbbiden("权限不足");
      }
      ctx.auth = {
        uid: decode.uid,
        scope: decode.scope,
      };
      await next();
    };
  }
  static verifyToken(token) {
    try {
      jwt.verify(token, global.config.security.secretKey);
      return true;
    } catch (error) {
      return false;
    }
  }
}
module.exports = {
  Auth,
};
