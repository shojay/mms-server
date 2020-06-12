const { sequelize } = require("../db/db");
const { Sequelize, Model, Op } = require("sequelize");

class Comment extends Model {
  static async addComment(bookId, content) {
    const comment = await Comment.findOne({
      where: {
        book_id: bookId,
        content,
      },
    });
    if (!comment) {
      return await Comment.create({
        book_id: bookId,
        content,
        nums: 1,
      });
    } else {
      return await comment.increment("nums", {
        by: 1,
      });
    }
  }

  static async getComment(bookId) {
    const comments = await Comment.findAll({
      where: {
        book_id: bookId,
      },
    });
    return comments;
  }

  toJSON() {
    return {
      content: this.getDataValue("content"),
      nums: this.getDataValue("nums"),
    };
  }
}

Comment.init(
  {
    content: {
      type: Sequelize.STRING(12),
    },
    book_id: {
      type: Sequelize.INTEGER,
    },
    nums: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "commment",
  }
);

module.exports = {
  Comment,
};
