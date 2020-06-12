const Router = require("koa-router");
const router = new Router({
  prefix: "/v1/like",
});
const { sequelize } = require("../../../app/db/db");
const { Movie, Music, Sentence } = require("../../../app/models/classic");
const { Favor } = require("../../../app/models/favor");
const {
  Success,
  LikeError,
  DislikeError,
  NotFound,
} = require("../../../core/http-exception");
const { Auth } = require("../../../middlewares/auth");

router.post("/", new Auth().m, async (ctx) => {
  let body = ctx.request.body;
  await Favor.like(body.art_id, body.type, ctx.auth.uid);
  throw new Success("点赞成功");
});

router.post("/cancel", new Auth().m, async (ctx) => {
  let body = ctx.request.body;
  await Favor.disLike(body.art_id, body.type, ctx.auth.uid);
  throw new Success("取消点赞成功");
});

module.exports = router;
