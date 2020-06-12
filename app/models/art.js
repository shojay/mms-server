const { Movie, Sentence, Music } = require("./classic");
const { HotBook } = require("./hotbook");
const { Favor } = require("../../app/models/favor");
const { NotFound } = require("../../core/http-exception");
const { flatten } = require("lodash");
const { Op } = require("sequelize");
class Art {
  constructor(art_id, type) {
    this.art_id = art_id;
    this.type = type;
  }
  async getDetail(uid) {
    const { Favor } = require("./favor");
    const art = await Art.getData(this.art_id, this.type);
    if (!art) {
      throw new NotFound();
    }
    const like = await Favor.userLikeStatus(this.art_id, this.type, uid);
    return {
      art,
      likeStatus: like,
    };
  }
  static async getData(art_id, type) {
    let art = null;
    const finder = {
      where: {
        id: art_id,
      },
    };
    // const scope = useScope ? "bh" : null;
    switch (type) {
      case 100:
        art = await Movie.findOne(finder);
        break;
      case 200:
        art = await Music.findOne(finder);
        break;
      case 300:
        art = await Sentence.findOne(finder);
        break;
      case 400:
        const { Book } = require("./book");
        art = await Book.findOne(finder);
        if (!art) {
          art = await Book.create({
            id: art_id,
          });
        }
        // art = await HotBook.findOne(finder);
        break;
    }
    // if (art && art.image) {
    //   let imgUrl = art.dataValues.image;
    //   art.dataValues.image = global.config.host + imgUrl;
    // }
    return art;
  }
  static async getArt(flow, ctx) {
    if (!flow) {
      throw new NotFound("不存在此期刊");
    }
    const art = await Art.getData(flow.art_id, flow.type);
    const favor = await Favor.userLikeStatus(
      flow.art_id,
      flow.type,
      ctx.auth.uid
    );
    art.setDataValue("index", flow.index);
    art.setDataValue("likeStatus", favor);
    art.exclude = ["pubdate"];
    ctx.body = art;
  }
  static async getList(artInfoList) {
    const artInfoObj = {
      100: [],
      200: [],
      300: [],
    };
    for (let artInfo of artInfoList) {
      artInfoObj[artInfo.type].push(artInfo.art_id);
    }
    const arts = [];
    for (let key in artInfoObj) {
      const ids = artInfoObj[key];
      if (ids.length === 0) {
        continue;
      }
      key = parseInt(key);
      arts.push(await Art._getListByType(ids, key));
    }
    return flatten(arts);
  }
  static async _getListByType(ids, type) {
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
}

module.exports = {
  Art,
};
