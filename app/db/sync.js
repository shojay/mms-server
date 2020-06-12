const { sequelize } = require("./db");

require("../models/index");

// connect
sequelize
  .authenticate()
  .then(() => {
    console.log("auth ok");
  })
  .catch(() => {
    console.log("auth error");
  });

//执行同步
sequelize.sync({ force: false }).then(() => {
  console.log("sync ok");
  process.exit();
});
