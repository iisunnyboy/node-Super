const Validator = require("validator");
const isEmpty = require("./is-empty.js");

module.exports = function validateProfileInput(data) {
    let errors = {};
    data.handle = !isEmpty(data.handle) ? data.handle : "";
    data.status = !isEmpty(data.status) ? data.status : "";
    data.skills = !isEmpty(data.skills) ? data.skills : "";

    if(!Validator.isLength(data.handle,{ min : 2, max : 10 })){
        errors.handle = "handle长度不能小于2并且不能大于10！"
    }

    if(Validator.isEmpty(data.handle)){
        errors.handle = "handle不能为空！"
    }

    if(Validator.isEmpty(data.status)){
        errors.status = "status不能为空！"
    }

    if(Validator.isEmpty(data.skills)){
        errors.skills = "skills不能为空！"
    }

    if(!isEmpty(data.website) && !Validator.isEmpty(data.website)){
        if(!Validator.isURL(data.website)){
            errors.website = "website url 不合法！";
        }
    }

    if(!isEmpty(data.tengxunkt) && !Validator.isEmpty(data.tengxunkt)){
        if(!Validator.isURL(data.tengxunkt)){
            errors.tengxunkt = "tengxunkt URL 不合法！";
        }
    }

    if(!isEmpty(data.wangyikt) && !Validator.isEmpty(data.wangyikt)){
        if(!Validator.isURL(data.wangyikt)){
            errors.wangyikt = "wangyikt URL 不合法";
        }
    }

    return {
        errors,
        isValid : isEmpty(errors)
    }
}