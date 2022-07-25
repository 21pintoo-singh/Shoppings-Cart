const mongoose = require("mongoose");
const ObjectId=mongoose.Schema.Types.ObjectId

function isValid(value){
    if(typeof value==="undefined" || typeof value===null)return false;
    if(typeof value ==="string" && value.trim().length ==0)return false;
    return true
};

function isValidRequestBody(value){
    return Object.keys(value)>0
}

const isValidObjectId = function (objectId) {
    return ObjectId.isValid(objectId)
};

const validEmail=/^[a-zA-Z0-1]+[@][a-z]{3,6}[.][a-z]{2,5}$/
const validPhone=/^[6789][0-9]{9}$/
const validFName=/^[a-zA-Z]+$/ 
const validLName=/^[a-zA-Z]+$/

module.exports={isValid,isValidRequestBody,validEmail,validPhone,isValidObjectId,validFName,validLName}