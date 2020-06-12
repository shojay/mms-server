const { sequelize } = require("../db/db");
const { Sequelize, Model, Op } = require("sequelize");
const { Favor } = require("./favor");

class HotBook extends Model {
  static async getAll() {
    const books = await HotBook.findAll({
      order: ["index"],
    });
    const ids = [];
    books.forEach((book) => {
      ids.push(book.id);
    });
    const favors = await Favor.findAll({
      where: {
        art_id: {
          [Op.in]: ids,
        },
        type: 400,
      },
      group: ["art_id"], // 同一类art_id分成一组
      attributes: ["art_id", [Sequelize.fn("COUNT", "*"), "count"]], // 计算数量
    });
    books.forEach((book) => {
      HotBook._getEachBookStatus(book, favors);
    });
    return books;
  }
  static _getEachBookStatus(book, favors) {
    let count = 0;
    favors.forEach((favor) => {
      if (favor.art_id === book.id) {
        count = favor.get("count");
      }
    });
    book.setDataValue("fav_nums", count);
    return book;
  }
}

HotBook.init(
  {
    index: Sequelize.INTEGER,
    image: Sequelize.STRING,
    author: Sequelize.STRING,
    title: Sequelize.STRING,
  },
  {
    sequelize,
    tableName: "hot_book",
  }
);

module.exports = {
  HotBook,
};
