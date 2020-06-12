const util = require("util");
const axios = require("axios");
const { AuthFailed } = require("../../core/http-exception");
const { generateToken } = require("../../core/util");
const { Auth } = require("../../middlewares/auth");
const User = require("../models/user");

class WXManager {
  static async codeToToken(code) {
    const url = util.format(
      global.config.wx.loginUrl,
      global.config.wx.appId,
      global.config.wx.appSecret,
      code
    );
    const result = await axios.get(url);
    if (result.status !== 200) {
      throw new AuthFailed("openid获取失败");
    }
    const errcode = result.data.errcode; // 如果errcode为undefined，则说明成功获取openid
    const errmsg = result.data.errmsg;
    if (errcode) {
      throw new AuthFailed("openid获取失败:" + errmsg);
    }
    // 成功获取openid
    let user = await User.getUserByOpenid(result.data.openid);
    if (!user) {
      user = await User.registerByOpenid(result.data.openid);
    }
    return generateToken(user.id, Auth.USER);
  }
}

module.exports = {
  WXManager,
};
