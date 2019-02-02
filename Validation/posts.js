const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validatePostsInput(data){
    let errors = {};

    data.text = !isEmpty(data.text) ? data.text : "";

    if(!Validator.isLength(data.text, {min : 2, max : 10})){
        errors.text = "评论不嫩少于2个且不能大于10个字符！";
    }

    if(Validator.isEmpty(data.text)){
        errors.text = "评论不能为空！";
    }
    
    return {
        errors,
        isValid : isEmpty(errors)
    }
}