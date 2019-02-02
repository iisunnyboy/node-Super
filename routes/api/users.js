//@login & register
const express = require('express');
const router = express.Router();

//bcrypt 
const bcrypt = require("bcryptjs");
//gravatar
const gravatar = require("gravatar")

//jwt
const jwt = require("jsonwebtoken");
//jwt 第二个参数
const keys = require("../../config/keys");

// passport验证
const passport = require("passport");


//Model 
const User = require("../../models/User")


//引入验证方法
const validetRegisterInput = require("../../Validation/register.js");
const validateLoginInput = require("../../Validation/login.js")

// $route GET api/user/test
//@desc 返回请求的Json数据
//@access public
router.get("/test",(req,res) =>{
    res.json({msg:"login works"})
});

//$router POST api/user/register
//@desc 注册信息
//access public 
router.post("/register",(req, res) => {
    console.log("req.body::",req.body);
    
    //验证--validation
    const  {errors, isValid } = validetRegisterInput(req.body);
    if(!isValid){       //验证不通过，返回错误信息
        return res.status(400).json(errors);
    }

    User.findOne({email:req.body.email})
        .then( user => {
            if(user) {
                return res.status(400).json({email:"邮件已经被注册"});
            }else{
                const avatar = gravatar.url(req.body.email, {s: '200', r: 'pg', d: 'mm'});
                const newUser = new User({
                    name:req.body.name,
                    email:req.body.email,
                    avatar,
                    password:req.body.password
                });

                bcrypt.genSalt(10,function(err, salt){
                    bcrypt.hash(newUser.password,salt,(err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err))
                    })
                })
            }
        })
});


//$router POST api/user/login
//@desc     返回token passport
//access public 

router.post('/login',(req,res) => {

    //验证--validation
    // console.log(req);
    // console.log(res);
    const{ error, isValid } = validateLoginInput(req.body);
    if(!isValid){   //验证不通过，返回错误信息
        return res.status(400).json(errors);
    }
    
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email})
        .then(user => {
            if(!user){
                return res.status(404).json({email:"用户不存在"});
            }

            bcrypt.compare(password,user.password)
               .then( isMatch => {
                    console.log("密码匹配！");
                    console.log(password,user.password);
                    if(isMatch){
                        // res.json({msg:"success"});
                        const rule = {id:user.id,name:user.name}
                        jwt.sign(rule, keys.cert, {expiresIn:3600}, (err,token) =>{
                            if (err) throw err;
                            // 一定要为"Bearer "，不能为其他 
                            res.json({
                                success:true,
                                token:'Bearer '+token
                            });
                        });
                    }else{
                        return res.status(404).json({password:"密码错误"});
                    }
                });
        })
});

//$router   GET api/user/current
//@desc     返回 current user
//access    private 
router.get("/current", passport.authenticate('jwt', { sesstion : false }), (req,res) =>{
    // res.json({msg:"success"});
    // res.json(req.user);
    // console.log("--req:",req);
    // console.log("--res:",res);
    return res.json({
        id:req.user.id,
        name:req.user.name,
        email:req.user.email
    });
    // console.log("==res:",res);
});


module.exports = router;
