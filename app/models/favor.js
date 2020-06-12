const { sequelize } = require("../db/db");
const { Sequelize, Model, Op } = require("sequelize");
const {
  LikeError,
  DislikeError,
  NotFound,
} = require("../../core/http-exception");

class Favor extends Model {
  static async like(art_id, type, uid) {
    const favor = await Favor.findOne({
      where: {
        art_id,
        type,
        uid,
      },
    });
    if (favor) {
      throw new LikeError();
    }
    return sequelize.transaction(async (t) => {
      await Favor.create(
        {
          art_id,
          type,
          uid,
        },
        {
          transaction: t,
        }
      );
      const { Art } = require("./art"); // 防止Art和Favor循环导入报错
      const art = await Art.getData(art_id, type);
      if (!art) {
        throw new NotFound();
      }
      if (type === 400) return;
      await art.increment("fav_nums", {
        by: 1,
        transaction: t,
      });
    });
  }
  static async disLike(art_id, type, uid) {
    const favor = await Favor.findOne({
      where: {
        art_id,
        type,
        uid,
      },
    });
    if (!favor) {
      throw new DislikeError();
    }
    // Favor 表 favor 记录
    return sequelize.transaction(async (t) => {
      await favor.destroy({
        force: true,
        transaction: t,
      });
      const { Art } = require("./art");
      const art = await Art.getData(art_id, type);
      if (!art) {
        throw new NotFound();
      }
      await art.decrement("fav_nums", {
        by: 1,
        transaction: t,
      });
    });
  }
  static async userLikeStatus(art_id, type, uid) {
    const result = await Favor.findOne({
      where: {
        art_id,
        type,
        uid,
      },
    });
    return result ? true : false;
  }
  static async getMyClassicFavors(uid) {
    const arts = await Favor.findAll({
      where: {
        uid,
        type: {
          [Op.not]: 400,
        },
      },
    });
    if (!arts) {
      throw new NotFound();
    }
    const { Art } = require("./art");
    return await Art.getList(arts);
  }
  static async getBookFavor(uid, bookID) {
    const favorNums = await Favor.count({
      where: {
        art_id: bookID,
        type: 400,
      },
    });
    const myFavor = await Favor.findOne({
      where: {
        art_id: bookID,
        uid,
        type: 400,
      },
    });
    return {
      fav_nums: favorNums,
      likeStatus: myFavor ? 1 : 0,
    };
  }
}

Favor.init(
  {
    uid: Sequelize.INTEGER,
    art_id: Sequelize.INTEGER,
    type: Sequelize.INTEGER,
  },
  {
    sequelize,
    tableName: "favor",
  }
);

module.exports = {
  Favor,
};
