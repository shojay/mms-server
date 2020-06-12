const Router = require("koa-router");
const { RegisterValidator } = require("../../../app/validators/validator");
const { Success } = require("../../../core/http-exception");
const User = require("../../../app/models/user");
const axios = require('axios')

const router = new Router({
  prefix: "/v1/user",
});

router.post("/register", async (ctx) => {
  const v = await new RegisterValidator().validate(ctx);
  const user = {
    email: v.get("body.email"),
    password: v.get("body.password2"),
    nickname: v.get("body.nickname"),
  };
  await User.create(user);
  throw new Success("register ok");
});

router.get('/getTop', async (ctx) => {
  const { data: result } = await axios
  .post("https://www.doudouxia.com/data-center/douyin/detail/top", {
    data: {
      create_time: Date.now(),
      page: 0,
      size: 30,
      main_category: "明星",
      sort: ["score", "desc"],
      title: "",
      type: "daily",
    },
    headers: {
      referer: "https://www.doudouxia.com/industry/video",
      'content-type': 'application/json'
    },
  })
  ctx.body = {
    code: 0,
    data: result.result
  }
})

router.get('/getSearch', async (ctx) => {
  const { q, p } = ctx.query;
  const {data: result} = await axios.get('http://106.15.195.249:8011/search_new', {
    params: {
      callback: 'jQuery',
      q,
      p,
      _: 1589260072441,
    },
    headers: {
      Referer: 'http://www.pansou.com/'
    }
  })
  let res = result.match(/^jQuery\((.*)\)$/)[1]
  console.log(JSON.parse(res))
  ctx.body = {
    code: 0,
    data: JSON.parse(res)
  }
})

module.exports = router;
