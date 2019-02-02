const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');   //必须使用此中间件，否则post请求无法获取到对应内容
//Passport is Express-compatible authentication middleware for Node.js.
const passport = require("passport");       //登录验证使用  
const app = express();

//引入路由 users.js、profile.js
const users = require('./routes/api/users.js');
const profile = require("./routes/api/profile.js");
const posts = require("./routes/api/posts.js");

// DB Config
const db = require('./config/keys.js').mongoURI;

// connect to mongodb
mongoose.connect(db,{ useNewUrlParser: true } )
    .then((data) => console.log('MongoDB Connected!'))
    .catch(err => console.log(err));

//使用body-parser中间件
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// passport 初始化  必须初始化。passport.initialize()是一个middleware
// app.use(require('cookie-parser')());
// app.use(require('express-session')({ secret: require('./config/keys.js').cert, saveUninitialized: true }));
app.use(passport.initialize());
// app.use(passport.session());
require("./config/passport.js")(passport); //在passport.js文件中进行逻辑编写

// //添加 app 路由
// app.get('/',(req,res) => {
//     res.send('Hello  world!')
// })

//使用路由 routes  包含 users profile 路由
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use("/api/posts", posts);

const port = process.env.port || 860;
app.listen(port, () => {
    console.log(`server running on port ${port}`);
});
