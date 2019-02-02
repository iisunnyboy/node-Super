const Validator = require("validator");
const isEmpty = require("./is-empty.js");

module.exports = function validateExperienceInput(data) {
    const errors = {};

    data.title = !isEmpty(data.title) ? data.title : "";
    data.company = !isEmpty(data.company) ? data.company : "";
    data.from = !isEmpty(data.from) ? data.from : "";

    if(Validator.isEmpty(data.title)){
        errors.title = "个人经历的 title 不能为空！";
    }

    if(Validator.isEmpty(data.company)){
        errors.company = "个人经历的 company 不能为空！";
    }

    if(Validator.isEmpty(data.from)) {
        errors.from = "个人经历的 from 不能为空!";
    }

    
    return {
        errors,
        isValid : isEmpty(errors)
    }
}