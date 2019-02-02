const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const mongoose = require("mongoose");
const User = mongoose.model("users");
const keys = require("../config/keys.js");

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.cert;


module.exports = passport => {
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        console.log("jwt_payload: ",jwt_payload);
        User.findById(jwt_payload.id)  //findById 参数必须是对象的形式，否则会出错误
            .then(user => {
                //console.log(user);
                if(user){
                    console.log(done);

                    //视频中没有，从npm 官网中摘录下来的，可以解决  Failed to serialize user into session 问题
                    passport.serializeUser(function(user, done) {
                        // done(null, user.id);
                        done(null, user);
                    });
                    return done(null, user)
                }
                return done(null,false);
            })
            .catch(err => console.log(err))    
        // User.findById(jwt_payload.id,function(err,user){
        //     if(user){
        //         return done(null,user)
        //     }
        // })
    }));
}