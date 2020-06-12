const { Sequelize, Model } = require("sequelize");
const { unset, isArray, clone } = require("lodash");
const {
  dbName,
  host,
  port,
  user,
  password,
} = require("../../config/config").database;

const sequelize = new Sequelize(dbName, user, password, {
  dialect: "mysql",
  host,
  port,
  timezone: "+08:00",
  define: {
    timestamps: true,
    paranoid: true,
    scope: {
      bh: {
        attributes: {
          exclude: ["createdAt", "updatedAt", "deletedAt"],
        },
      },
    },
  },
});

Model.prototype.toJSON = function () {
  let data = clone(this.dataValues);
  unset(data, "createdAt");
  unset(data, "updatedAt");
  unset(data, "deletedAt");

  for (key in data) {
    if (key === "image") {
      if (!data[key].startsWith("http"))
        data[key] = global.config.host + data[key];
    }
  }
  if (isArray(this.exclude)) {
    this.exclude.forEach((item) => {
      unset(data, item);
    });
  }
  return data;
};

module.exports = {
  sequelize,
};
