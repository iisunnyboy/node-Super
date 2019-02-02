const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateEducationInput(data){
    const errors = {};
    data.school = !isEmpty(data.school) ? data.school : "";
    data.degree = !isEmpty(data.degree) ? data.degree : "";
    data.from = !isEmpty(data.from) ? data.from : "";
    
    if(Validator.isEmpty(data.school)){
        errors.school = "个人教育的 school 不能为空！";
    }
    
    if(Validator.isEmpty(data.degree)){
        errors.degree = "个人教育的 degree 不能为空！";
    }

    if(Validator.isEmpty(data.from)){
        errors.from = "个人教育的 from 不能为空！";
    }

    return {
        errors,
        isValid : isEmpty(errors)
    }
}