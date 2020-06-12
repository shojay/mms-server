class HttpException extends Error {
  constructor(msg, code, status) {
    super();
    this.message = msg;
    this.errorCode = code;
    this.status = status;
  }
}
class ParameterException extends HttpException {
  constructor(msg, code) {
    super();
    this.message = msg || "参数错误";
    this.errorCode = code || 10000;
    this.status = 400;
  }
}

class Success extends HttpException {
  constructor(msg, code) {
    super();
    this.message = msg || "ok";
    this.errorCode = code || 0;
    this.status = 201;
  }
}

class NotFound extends HttpException {
  constructor(msg, code) {
    super();
    this.message = msg || "资源未找到";
    this.errorCode = code || 10000;
    this.status = 404;
  }
}

class AuthFailed extends HttpException {
  constructor(msg, code) {
    super();
    this.message = msg || "授权失败";
    this.errorCode = code || 10004;
    this.status = 401;
  }
}

class Forbbiden extends HttpException {
  constructor(msg, code) {
    super();
    this.message = msg || "禁止访问";
    this.errorCode = code || 10006;
    this.status = 403;
  }
}

class LikeError extends HttpException {
  constructor(msg, code) {
    super();
    this.status = 400;
    this.message = "你已经点赞过";
    this.errorCode = 60001;
  }
}

class DislikeError extends HttpException {
  constructor(msg, code) {
    super();
    this.status = 400;
    this.message = "你已取消点赞";
    this.errorCode = 60002;
  }
}

module.exports = {
  HttpException,
  ParameterException,
  Success,
  NotFound,
  AuthFailed,
  Forbbiden,
  LikeError,
  DislikeError,
};
