const { HttpException } = require("./../core/http-exception");
const catchError = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    const isDev = global.config.environment === "dev";
    const isHttpException = err instanceof HttpException;
    if (isDev && !isHttpException) {
      throw err;
    }
    if (isHttpException) {
      ctx.body = {
        msg: err.message,
        errorCode: err.errorCode,
        request: `${ctx.method} ${ctx.url}`,
      };
      ctx.status = err.status;
    } else {
      ctx.body = {
        msg: "mistake",
        errorCode: 999,
        request: `${ctx.method} ${ctx.url}`,
      };
      ctx.status = 500;
    }
  }
};

module.exports = catchError;
