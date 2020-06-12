const { sequelize } = require("../db/db");
const { Sequelize, Model, Op } = require("sequelize");
const { Favor } = require("./favor");
const util = require("util");
const axios = require("axios");

class Book extends Model {
  // constructor(id) {
  //   super();
  //   this.id = id;
  // }
  async getDetail(id) {
    const url = util.format(global.config.yushu.detailUrl, id);
    const detail = await axios.get(url);
    return detail.data;
  }

  static async getMyFavorBookCount(uid) {
    const count = await Favor.count({
      where: {
        type: 400,
        uid,
      },
    });
    return count;
  }

  static async searchFromWords(q, start, count, summary = 1) {
    const url = util.format(
      global.config.yushu.keywordUrl,
      encodeURI(q),
      count,
      start,
      summary
    );
    const result = await axios.get(url);
    return result.data;
  }
}

Book.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    fav_nums: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
  }
);

module.exports = {
  Book,
};
