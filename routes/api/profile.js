//@login & register
const express = require("express");
const router = express.Router();
const passport = require("passport");

const Profile = require("../../models/Profiles");
const User = require("../../models/User");

//引入验证方法
const validateProfileInput = require("../../Validation/profile");
const validateExperienceInput = require("../../Validation/experience.js");
const validateEducationInput = require("../../Validation/education.js");

// $route GET api/profile/test
//@desc 返回请求的Json数据
//@access public
router.get("/test",(req,res)=> {
    res.json({msg : "profile works"})
});


//$router   GET api/profile
//@desc     返回 current profile
//access    private
router.get("/", passport.authenticate('jwt', {sesstion : false}), (req,res) => {
    const errors = {};
    Profile.findOne({user : req.user.id})
        .populate("user", ["name", "avatar"])
        .then(profile => {
            if(!profile) {
                errors.noProfile = "用户信息不存在";
                return res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
})


//$router   POST api/profile
//@desc     创建和编辑个人信息总接口
//access    private
router.post("/", passport.authenticate("jwt",{session : false}), (req, res) => {

    //验证输入的信息
    const {errors, isValid} = validateProfileInput(req.body);
    if(!isValid){
        return res.status(400).json(errors);
    }

    const profileFields = {};
    profileFields.user = req.user.id;
    if(req.body.handle) profileFields.handle = req.body.handle;
    if(req.body.company) profileFields.company = req.body.company;
    if(req.body.website) profileFields.website = req.body.website;
    if(req.body.location) profileFields.location = req.body.location;
    if(req.body.status) profileFields.status = req.body.status;

    // profileFields.skills
    if(req.body.skills !== "undefined" && req.body.skills) profileFields.skills = req.body.skills.split(",");

    if(req.body.bio) profileFields.bio = req.body.bio;
    if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;

    // // profileFields.experience
    // if(req.body.experience) profileFields.experience = req.body.experience;

    // // profileFields.education
    // if(req.body.education) profileFields.education = req.body.education;

    // profileFields.social
    profileFields.social = {};
    if(req.body.wechat) profileFields.social.wechat = req.body.wechat;
    if(req.body.QQ) profileFields.social.QQ = req.body.QQ;
    if(req.body.tengxunkt) profileFields.social.tengxunkt = req.body.tengxunkt;
    if(req.body.wangyikt) profileFields.social.wangyikt = req.body.wangyikt;

    // const errors = {};
    Profile.findOne({user: req.user.id}).exec()
        .then(profile => {
            console.log("profileFields:", profileFields);
            if(profile){
                //用户存在，执行更新方法
                Profile.findOneAndUpdate({user : req.user.id}, {$set : profileFields}, {new : true})
                    .then(profileUpdate => {
                        profileUpdate.msg = "用户存在，执行更新方法";
                        res.json(profileUpdate);
                    });                
            }else{
                //用户不存在，执行创建的方法
                Profile.findOne({handle : profileFields.handle})
                    .then(profileByHandle => {
                        if(profileByHandle){
                            //依照handle进行查询（用户名），hanle存在
                            errors.hanle = "该用户的handle个人信息已经已经存在，请勿重新创建！"
                            return res.status(400).json(errors);
                        }else{
                             //依照handle进行查询（用户名），hanle不存在
                            new Profile(profileFields).save()
                                .then(profile => {
                                    console.log(profile);
                                    res.json(profile);
                                })
                        }
                    })
            }
        })
})

//--------------------------------------获取用户的Profile 信息-------------------------------------------
//$router   GET api/profile/handle/:handle
//@desc     通过handle获取个人信息【Profile】
//access    public
router.get("/handle/:handle", (req, res) => {
    const errors = {};
    Profile.findOne({ handle : req.params.handle} )
        .populate('user',["name", "avatar"])
        .then( profile => {
            if( !profile ){
                errors.noProfile = "未找到该用户！";
                res.status(404).json(errors)
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
})

//$router   GET api/profile/user/:user_id
//@desc     通过user_id获取个人信息【profile】
//access    public
router.get("/user/:userid", (req, res) => {
    const errors = {};
    Profile.findOne({user : req.params.userid})
        .populate("user",["name", "email","avatar"])
        .then(profileByUserID =>{
            if(!profileByUserID){
                errors.noProfile = "未找到该用户的Profile信息！";
                return res.status(404).json(errors);
            }

            res.json(profileByUserID);
        })
        .catch(err => res.status(404).json(err));
})

//$router   GET api/profile/all
//@desc     获取所有人信息
//access    public
router.get("/all", (req, res) => {
    const errors = {};
    Profile.find()
        .populate("user",["name", "email", "avatar"])
        .then(profiles => {
            if(!profiles){
                errors.noProfiles = "没有任何用户信息！";
                res.status(404).json(errors);
            }

            res.json(profiles);
        })
        .catch(err => res.status(404).json(err))
})

//--------------------------------------添加个人经历-------------------------------------------
//$router   GET api/profile/experience
//@desc     添加个人经历
//access    private
router.post("/experience", passport.authenticate("jwt",{session : false}), (req, res) => {

    //Validation
    const { errors, isValid } = validateExperienceInput(req.body);
    if(!isValid){
        return res.status(400).json(errors);
    }

    Profile.findOne({user : req.user.id })
        .then( profile => {
            const newExperience = {
                title : req.body.title,
                company : req.body.company,
                location : req.body.location,
                from : req.body.from,
                to : req.body.to,
                description : req.body.description
            };

            profile.experience.unshift(newExperience);
            profile.save()
                .then(profileUpdate => {
                    res.json(profileUpdate);
                })
                .catch(err => res.status(404).json(err));
        })
        .catch(err => res.status(404).json(err));
})

//--------------------------------------添加个人学历-------------------------------------------
//$router   GET api/profile/education
//@desc     添加个人学历
//access    private
router.post("/education",passport.authenticate("jwt", { session : false}), (req,res) => {
    const {errors, isValid } = validateEducationInput(req.body);
    if(!isValid){
        return res.status(400).json(errors);
    }

    Profile.findOne({user : req.user.id})
        .then(profile => {
            if( profile ) {
                const newEducation = {
                    school : req.body.school,
                    degree : req.body.degree,
                    fieldofstudy : req.body.fieldofstudy,
                    from : req.body.from,
                    to : req.body.to,
                    description : req.body.description
                };

                profile.education.unshift(newEducation);
                profile.save()
                    .then( profileUpdate => {
                        res.json(profileUpdate);
                    })
                    .catch(err => res.status(404).json(err));
            }else{
                return res.status(404).json({msg : "没有找到个人信息，无法更新个人教育信息！"});
            }
        })
        .catch(err => res.status(404).json(err));
})

// //$router   GET api/profile/experience
// //@desc     获取个人经历
// //access    public
// router.get("/experience", (req, res) =>{
//     Profile.findOne({user : req.user.id})
// })


//--------------------------------------删除个人经历-------------------------------------------
//$router   DELETE api/profile/experience/:exp_id
//@desc     删除个人经历
//access    private
router.delete("/experience/:exp_id", passport.authenticate("jwt", { session : false }), (req , res) => {
    const errors = {};
    Profile.findOne({user : req.user.id})
        .then(profileByUserID => {
            if(profileByUserID){
                const experiencIndex = profileByUserID.experience
                    .map( item => {
                        console.log(item.id);
                        return item.id
                    })
                    .indexOf(req.params.exp_id);
                console.log(experiencIndex);

                if( experiencIndex >= 0 ){
                    profileByUserID.experience.splice(experiencIndex, 1);
                    profileByUserID.save()
                        .then(profile => {
                            res.json(profile);
                        })
                        .catch(err => res.status(404).json(err));  
                }else{
                    errors.noExperience = "没有找到用户的个人经历！";
                    res.status(404).json(errors);
                }
    
            }else{
                errors.noProfile = "没有找到用户的profile！";
                res.status(404).json(errors);
            }
        })
        .catch(err => res.status(404).json(err));
})


//--------------------------------------删除个人学历-------------------------------------------
//$router   DELETE api/profile/education/:edu_id
//@desc     删除个人学历
//access    private

router.delete("/education/:edu_id", passport.authenticate("jwt", {session : false}), (req, res) => {
    const errors = {};
    console.log(req.params.edu_id);
    Profile.findOne({user : req.user.id})
        .then(profileByUserID => {
            if(profileByUserID){
                const educationIndex = profileByUserID.education
                .map(item => {
                    console.log(item.id);
                    return item.id;
                })
                .indexOf(req.params.edu_id.toString());
                console.log(educationIndex);

                if(educationIndex >= 0 ){
                    profileByUserID.education.splice(educationIndex, 1);
                    profileByUserID.save()
                        .then(profile => res.json(profile))
                        .catch(err => res.status(404).json(err))
                }else{
                    errors.noEducation = "没有找到用户的个人学历！";
                    res.status(404).json(errors);
                }
            }else{
                errors.noProfile = "没有找到用户的profile！";
                res.status(404).json(errors);
            }
        })
        .catch(err => res.status(404).json(err));
})

//--------------------------------------删除当前用户的Profile 和 User-------------------------------------------
//$router   DELETE api/profile
//@desc     删除当前用户的Profile
//access    private
router.delete("/", passport.authenticate("jwt", {session : false}), (req, res) => {
    Profile.findOneAndRemove({user : req.user.id})
        .then( () => {
            User.findOneAndRemove({_id : req.user.id})
                .then(()=>{
                    res.json({success : true});
                })
                .catch(err => res.status(404).json(err));
        })
        .catch(err => res.status(404).json(err));
})

module.exports = router;