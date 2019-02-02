const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const passport = require("passport");

const User = require("../../models/User.js");
const Profile = require("../../models/Profiles.js");
const Posts = require("../../models/Posts.js");

//引入验证方法
const validatePostsInput = require("../../Validation/posts.js");

// $route GET api/posts/test
//@desc 返回请求的Json数据
//@access public
router.get("/test", (req, res) => {
    return res.json({msg : "post works!"});
});

//==================================Post信息添加、删除、查询操作==================================
// $route POST api/posts
//@desc 返回请求的Json数据，并将数据保存到MongoDB中--添加
//@access private
router.post("/", passport.authenticate("jwt", {session : false}), (req, res) => {

    const {errors, isValid} = validatePostsInput(req.body);
    if(!isValid){
        return res.status(400).json(errors);
    }

    const newPost = {};
    newPost.user = req.user.id;
    if(req.body.text) newPost.text = req.body.text;
    if(req.body.name) newPost.name = req.body.name;
    if(req.body.avatar) newPost.avatar = req.body.avatar;
    if(req.body.avatar) newPost.avatar = req.body.avatar;

    const newPostToSave = new Post(newPost);
    newPostToSave.save()
        .then(post => res.json(post))
        .catch(err => res.json(err));
});


// $route GET api/posts
//@desc 获取所有Posts 数据--查询
//@access public
router.get("/", (req, res) => {
    const errors = {};
    Posts.find()
        .sort({date : -1})
        .then(posts => {
            return res.json(posts);
        })
        .catch(err => res.status(404).json("没有找到任何posts"));
});


// $route DELETE api/posts/:post_id
//@desc 删除单个Posts 数据信息--删除
//@access public
router.delete("/:post_id", passport.authenticate("jwt", {session :  false}), (req, res) => {
    const errors = {};
    Profile.findOne({user : req.user.id})
        .then(profile => {
            Posts.findById(req.params.post_id)
                .then(post => {

                    // 判断是否为本人删除
                    // console.log(post.user.toString());    // post.user 为 Object
                    // console.log(req.user.id);           //req.user.id 为 string
                    if(post.user.toString() !== req.user.id){
                        errors.notAuthorized = "评论和当前登录人非一个人员，非法操作！";
                        return res.status(401).json(errors);
                    }

                    //删除数据
                    post.remove().then(()=>res.json({success : true}));
                })
                .catch(err => {
                    errors.notAuthorized = "没有找到该评论【post】信息！";
                    return res.status(404).json(errors);
                })
        })
        .catch(err => {
            errors.notAuthorized = "没有找到该profile信息！";
            return res.status(404).json(err);
        });
});


//==============================Post的likes信息添加、删除操作==============================
// $route POST api/posts/likes/:post_id
//@desc 点赞接口数据信息--添加点赞信息
//@access private
router.post("/likes/:post_id", passport.authenticate("jwt",{session : false}), (req, res) =>{
    // return res.json({msg:"GOOD"})
    const errors = {};
    Profile.findOne({user : req.user.id})
        .then(profile => {
            Posts.findById(req.params.post_id)
                .then(post => {
                    if(post.likes
                        .filter(like => like.user.toString() === req.user.id)
                        .length > 0
                    ){
                        errors.alreadyLiked = "用户已经赞过！";
                        return res.status(400).json(errors);
                    }

                    post.likes.unshift({user : req.user.id});
                    post.save()
                        .then(postUpdate => res.json(postUpdate))
                        .catch(err => res.status(404).json(err));
                })
                .catch(err => {
                    errors.noPostFound = "没有找到post信息";
                    return res.status(404).json(errors);
                });
        })
        .catch(err => {
            errors.noProfileFound = "没有找到profile信息";
            return res.status(404).json(errors);
        });
});

// $route POST api/posts/unlikes/:post_id
//@desc 点赞接口数据信息--取消点赞信息
//@access private
router.delete("/unlikes/:post_id", passport.authenticate("jwt", {session : false}), (req, res) => {
    const errors =  {};
    Profile.findOne({user : req.user.id})
        .then(profile => {
            Posts.findById(req.params.post_id)
                .then(posts => {
                    if(posts.likes
                        .filter(like => like.user.toString() === req.user.id)
                        .length === 0
                    ){
                        errors.notLiked = "该用户还没有点赞过"; 
                        return res.status(404).json(errors);
                    }

                    const postsIndex = posts.likes
                        .map(like => {
                            console.log(typeof like.user.toString());
                            return like.user.toString();
                        })
                        .indexOf( req.user.id);

                    if(postsIndex >= 0){
                        console.log(postsIndex);
                        posts.likes.splice(postsIndex, 1);
                        posts.save()
                            .then(iPosts => res.json(iPosts))
                            .catch(err => res.json(err));
                    }else{
                        errors.postsIndex = postsIndex; 
                        return res.status(404).json(errors);
                    }
                })
                .catch(err => {
                    errors.noPost = "没有找到post信息";
                    return res.status(404).json(errors);
                });
        })
        .catch(err => {
            errors.noProfile = "没有找到profile信息";
            return res.status(404).json(errors);
        });
});

//==============================Post的comment信息添加、删除操作==============================
// $route POST api/posts/comments/:post_id
//@desc 评论数据信息--添加评论信息
//@access private
router.post("/comments/:post_id",passport.authenticate("jwt", {session : false}), (req, res) => {
    const {errors, isValid} = validatePostsInput(req.body);
    if(!isValid){
        return res.status(404).json(errors);
    }
    Profile.findOne({user : req.user.id})
        .then( profile => {
            Posts.findById(req.params.post_id)
            .then( posts => {

                const newComment = {};
                newComment.user = req.user.id
                if(req.body.text) newComment.text = req.body.text;
                if(req.body.avatar) newComment.avatar = req.body.avatar;
                if(req.body.name) newComment.name = req.body.name;

                posts.comments.unshift(newComment);
                posts.save()
                    .then(postsToSave => {
                        res.json(postsToSave);
                    })
                    .catch(err => res.json(err));
            })
            .catch(err => {
                errors.noPost = "没有找到post信息，或者添加评论错误！";
                return res.status(404).json(errors);
            });
        })
        .catch(err => {
            errors.noProfile = "没有找到profile信息";
            return res.status(404).json(errors);
        });
});

// $route DELETE api/posts/comments/:post_id
//@desc 评论数据信息--删除评论信息
//@access private
router.delete("/comments/:post_id", passport.authenticate("jwt", {session : false}), (req, res) => {
    const errors = {};
    Profile.findOne({user : req.user.id})
        .then(profile => {
            Posts.findById(req.params.post_id)
                .then(posts => {
                    const commentNotToDelete = posts.comments
                        .filter(comment => {
                           return comment.user.toString() !== req.user.id;
                        });
                    if(commentNotToDelete.length === posts.comments){
                        errors.comments = "当前用户没有评论！";
                        return res.status(401).json(errors);
                    }

                    posts.comments = commentNotToDelete;
                    posts.save()
                        .then(iPosts => {
                            return res.json(iPosts)
                        })
                        .catch(err => {
                            errors.savedFailed = "保存失败！";
                            return res.status(404).json(errors);
                        });
                })
                .catch(err => {
                    errors.noPost = "没有找到post信息，或者添加评论错误！";
                    return res.status(404).json(errors);
                });
        })
        .catch(err => {
            errors.noProfile = "没有找到profile信息";
            return res.status(404).json(errors);
        })
})

module.exports = router;


