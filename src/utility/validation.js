const mongoose = require("mongoose");


function isValid(value){
    if(typeof value==="undefined" || typeof value===null)return false;
    if(typeof value ==="string" && value.trim().length ==0)return false;
    return true
};

function isValidBody(value){
    return Object.keys(value).length >0
}

// const isValidObjectId = function (objectId) {
//     return ObjectId.isValid(objectId)
// };



module.exports={isValid,isValidBody}