const Router = require("koa-router");
const {
  TokenValidator,
  NotEmptyValidator,
} = require("../../../app/validators/validator");
const { LoginType } = require("../../../app/lib/enum");
const { ParameterException } = require("../../../core/http-exception");
const { generateToken } = require("../../../core/util");
const { Auth } = require("../../../middlewares/auth");
const { WXManager } = require("../../../app/services/wx");
const User = require("../../../app/models/user");

const router = new Router({
  prefix: "/v1/token",
});

router.post("/", async (ctx) => {
  const v = await new TokenValidator().validate(ctx);
  let token;
  switch (v.get("body.type")) {
    case LoginType.USER_EMAIL:
      token = await emailLogin(v.get("body.account"), v.get("body.secret"));
      break;
    case LoginType.USER_MINI_PROGRAM:
      token = await WXManager.codeToToken(v.get("body.account"));
      break;
    default:
      throw new ParameterException("没有相应的处理函数");
  }
  ctx.body = {
    token,
  };
});

router.post("/verify", async (ctx) => {
  const v = await new NotEmptyValidator().validate(ctx);
  const result = Auth.verifyToken(v.get("body.token"));
  ctx.body = {
    is_valid: result
  };
});

router.post('/login', new Auth().m, async (ctx) => {
  const user = await User.loginByUid(ctx.auth.uid);
  ctx.body = {
    nickName: user.nickname,
    email: user.email,
    avatar: user.avatar
  }
})

async function emailLogin(account, secret) {
  const user = await User.verifyEmailPassword(account, secret); // 验证账号密码，返回用户数据
  return generateToken(user.id, Auth.USER); // 生成token令牌
}

module.exports = router;
