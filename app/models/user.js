const bcrypt = require("bcryptjs");
const { sequelize } = require("../db/db");
const { AuthFailed } = require("../../core/http-exception");

const { Sequelize, Model } = require("sequelize");

//define
class User extends Model {
  static async verifyEmailPassword(email, plainPassword) {
    const user = await User.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      throw new AuthFailed("账号不存在");
    }
    const correct = bcrypt.compareSync(plainPassword, user.password);
    if (!correct) {
      throw new AuthFailed("密码不正确");
    }
    return user;
  }
  static async getUserByOpenid(openid) {
    const user = await User.findOne({
      where: {
        openid,
      },
    });
    return user;
  }
  static async registerByOpenid(openid) {
    return await User.create({
      openid,
    });
  }
  static async loginByUid(uid) {
    return await User.findOne({
      where: {
        id: uid
      }
    });
  }
}
User.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nickname: Sequelize.STRING,
    email: {
      type: Sequelize.STRING(128),
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
      set(val) {
        const salt = bcrypt.genSaltSync(10);
        const psw = bcrypt.hashSync(val, salt);
        this.setDataValue("password", psw);
      },
    },
    openid: {
      type: Sequelize.STRING(64),
      unique: true,
    },
    avatar: {
      type: Sequelize.STRING(255)
    }
  },
  {
    sequelize,
    tableName: "user",
  }
);
module.exports = User;
