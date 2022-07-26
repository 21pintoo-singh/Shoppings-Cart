const mongoose = require("mongoose");


function isValid(value){
    if(typeof value==="undefined" || typeof value===null)return false;
    if(typeof value ==="string" && value.trim().length ==0)return false;
    return true
};

function isValidBody(value){
    return Object.keys(value).length >0
}

let isValidEmail = function(email){
    let emailRegex=/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    return emailRegex.test(email)
}

let isValidPassword=function(password){
    let passwordRegex=/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/
    return passwordRegex.test(password)
}


module.exports={isValid,isValidBody,isValidEmail,isValidPassword}