const Router = require("koa-router");
const router = new Router({
  prefix: "/v1/book",
});

const { HotBook } = require("../../../app/models/hotbook");
const { Book } = require("../../../app/models/book");
const { Auth } = require("../../../middlewares/auth");
const { Favor } = require("../../../app/models/favor");
const { Comment } = require("../../../app/models/book_comment");
const {
  PositiveIntegerValidator,
  SearchValidator,
  AddShortCommentValidator,
} = require("../../../app/validators/validator");
const { Success } = require("../../../core/http-exception");

router.get("/hot_list", new Auth().m, async (ctx, next) => {
  const books = await HotBook.getAll();
  ctx.body = books;
});

router.get("/:id/detail", new Auth().m, async (ctx) => {
  const v = await new PositiveIntegerValidator().validate(ctx);
  const id = v.get("path.id");
  ctx.body = await new Book().getDetail(id);
});

router.get("/search", new Auth().m, async (ctx) => {
  const v = await new SearchValidator().validate(ctx);
  const result = await Book.searchFromWords(
    v.get("query.q"),
    v.get("query.start"),
    v.get("query.count")
  );
  ctx.body = result;
});

router.get("/favor/count", new Auth().m, async (ctx) => {
  const count = await Book.getMyFavorBookCount(ctx.auth.uid);
  ctx.body = {
    count,
  };
});

router.get("/:book_id/favor", new Auth().m, async (ctx) => {
  const v = await new PositiveIntegerValidator().validate(ctx, {
    id: "book_id",
  });
  const favor = await Favor.getBookFavor(ctx.auth.uid, v.get("path.book_id"));
  ctx.body = favor;
});

router.post("/add/short_comment", new Auth().m, async (ctx) => {
  const v = await new AddShortCommentValidator().validate(ctx, {
    id: "book_id",
  });
  Comment.addComment(v.get("body.book_id"), v.get("body.content"));
  throw new Success();
});

router.get("/:book_id/short_comment", new Auth().m, async (ctx) => {
  const v = await new PositiveIntegerValidator().validate(ctx, {
    id: "book_id",
  });
  const book_id = v.get("path.book_id");
  const comments = await Comment.getComment(book_id);
  // ctx.body = await Comment.getComment(v.get("path.book_id"));
  ctx.body = {
    comments,
    book_id,
  };
});

module.exports = router;
