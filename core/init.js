const Router = require("koa-router");
const requireDirectory = require("require-directory");

class InitManager {
  static init(app) {
    InitManager.initRoutes(app);
    InitManager.loadConfig();
  }
  static loadConfig(path = "") {
    const configPath = path || process.cwd() + "/config/config.js";
    const config = require(configPath);
    global.config = config;
  }
  static initRoutes(app) {
    const absoluteDirectory = `${process.cwd()}/router/api`; // process.cwd() 项目的绝路路径 根目录
    requireDirectory(module, absoluteDirectory, {
      visit: loadRoutes,
    });

    function loadRoutes(obj) {
      if (obj instanceof Router) {
        app.use(obj.routes());
      }
    }
  }
}
module.exports = InitManager;
