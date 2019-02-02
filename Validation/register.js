const Validator = require("validator");
const isEmpty = require("./is-empty.js");

module.exports = function validateRegisterInput(data){
    let errors = {};

    //将data 键值对中的值转换为字符串
    data.name = !(isEmpty(data.name)) ? data.name : "";
    data.email = !isEmpty(data.email) ? data.email : "";
    data.password = !isEmpty(data.password) ? data.password : "";
    data.password2 = !isEmpty(data.password2) ? data.password2 :"";

    //name 验证
    if(Validator.isEmpty(data.name)){
        errors.name = "名字不能为空！"
    }

    if( !Validator.isLength(data.name,{min:2,max:30}) ){
        errors.name = "名字长度不能小于2位并且不能大于30位！"
    }

    //email 验证
    if(Validator.isEmpty(data.email)){
        errors.email = "邮箱不能为空!";
    }

    if(!Validator.isEmail(data.email)){
        errors.email = "邮箱不合法！";
    }

    //password 验证
    if(Validator.isEmpty(data.password)){
        errors.password = "密码不能为空！";
    }

    if(!Validator.isLength(data.password, {min:5, max:30})){
        errors.password = "密码长度必须大于等于6位，切小于等于30位！";
    }

    //password2 验证
    if(Validator.isEmpty(data.password2)){
        errors.password2 = "确认密码不能为空！"
    }
    if(!Validator.equals(data.password, data.password2)) {
        errors.password2 = "两次密码不一致！"
    }

    return { errors,isValid:isEmpty(errors) };
}
