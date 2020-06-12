const Router = require("koa-router");
const router = new Router({
  prefix: "/v1/classic",
});

const { Op } = require("sequelize");
const { Music, Movie, Sentence } = require("../../../app/models/classic");
const { flatten } = require("lodash");

const { Art } = require("../../../app/models/art");
const { Auth } = require("../../../middlewares/auth");
const { Flow } = require("../../../app/models/flow");
const { Favor } = require("../../../app/models/favor");
const { NotFound } = require("../../../core/http-exception");
const {
  PositiveIntegerValidator,
} = require("../../../app/validators/validator");

router.get("/latest", new Auth().m, async (ctx, next) => {
  const flow = await Flow.findOne({
    order: [["index", "desc"]],
  });
  await Art.getArt(flow, ctx);
});

router.get("/:index/next", new Auth().m, async (ctx) => {
  const v = await new PositiveIntegerValidator().validate(ctx, {
    id: "index",
  });
  const index = v.get("path.index");
  const flow = await Flow.findOne({
    where: {
      index: index + 1,
    },
  });
  await Art.getArt(flow, ctx);
});

router.get("/:index/prev", new Auth().m, async (ctx) => {
  const v = await new PositiveIntegerValidator().validate(ctx, {
    id: "index",
  });
  const index = v.get("path.index");
  const flow = await Flow.findOne({
    where: {
      index: index - 1,
    },
  });
  await Art.getArt(flow, ctx);
});

router.get("/:type/:id/", new Auth().m, async (ctx) => {
  const params = ctx.params;
  const id = params.id;
  const type = parseInt(params.type);

  const flow = await Flow.findOne({
    where: {
      art_id: id,
      type
    },
  });

  const artDetal = await new Art(id, type).getDetail(ctx.auth.uid);
  artDetal.art.setDataValue("likeStatus", artDetal.likeStatus);
  artDetal.art.setDataValue('index', flow.index);
  ctx.body = artDetal.art;
});

router.get("/:type/:id/favor", new Auth().m, async (ctx) => {
  const params = ctx.params;
  const id = params.id;
  const type = parseInt(params.type);
  const art = await Art.getData(id, type);
  if (!art) {
    throw new NotFound();
  }
  const favor = await Favor.userLikeStatus(id, type, ctx.auth.uid);
  ctx.body = {
    fav_nums: art.fav_nums,
    likeStatus: favor,
  };
});

router.get("/favor", new Auth().m, async (ctx) => {
  const uid = ctx.auth.uid;
  ctx.body = await Favor.getMyClassicFavors(uid);
});

async function _getListByType(ids, type) {
  let arts = [];
  const finder = {
    where: {
      id: {
        [Op.in]: ids, // in查询数组
      },
    },
  };
  switch (type) {
    case 100:
      arts = await Movie.findAll(finder);
      break;
    case 200:
      arts = await Music.findAll(finder);
      break;
    case 300:
      arts = await Sentence.findAll(finder);
    case 400:
      break;
    default:
      break;
  }
  return arts;
}

module.exports = router;
