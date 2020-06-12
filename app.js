const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const static = require("koa-static");
const path = require("path");
const cors = require('koa2-cors')

const app = new Koa();
const catchError = require("./middlewares/exception");
const InitManager = require("./core/init");

app.use(catchError);
app.use(cors());
app.use(bodyParser());
app.use(static(path.join(__dirname, "./static")));
InitManager.init(app);

app.listen(3000);
