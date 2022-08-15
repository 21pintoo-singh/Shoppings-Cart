const mongoose = require("mongoose")
const moment = require("moment")

let isEmptyObject = function (body) {
    if (!body) return true
    if (Object.keys(body).length == 0) return true;
    return false;
}

let isEmptyVar = function (value) {
    if (!value) return true
    if (typeof value === 'undefined' || value === null) return true;
    if (value.trim().length === 0) return true;
    return false;
}

let isValidPhone = function (number) {
    let phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(number);
}

let isValidEmail = function (email) {
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    return emailRegex.test(email)
}

let isValidPassword = function (password) {
    let passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/
    return passwordRegex.test(password)
}

let isValidDateFormat = function (date) {
    let dateFormatRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
    return dateFormatRegex.test(date)
}

let isValidDate = function (date) {
    return moment(date).isValid()
}

let isValidObjectId = function (ObjectId) {
    return mongoose.isValidObjectId(ObjectId)
}


let isEmptyFile = (file) => {
    if (!file || file.length == 0) return true
    return false
}

const acceptFileType = (file, ...types) => {
    return types.indexOf(file.mimetype) !== -1 ? true : false
}

const isPincodeValid = function (value) {
    return /^[1-9]{1}[0-9]{5}$/.test(value);
}


let isValidJSONstr = (json) => {
    try {
        return JSON.parse(json)
    } catch (_) {
        return false
    }
}

let checkArrContent = (array, ...isContentArray) => {
    let count = 0
    array.forEach(e => {
        if (!isContentArray.includes(e)) count++
    });
    return count == 0 ? true : false
}


module.exports = {
    isEmptyObject,
    isEmptyVar,
    isValidEmail,
    isValidPhone,
    isValidPassword,
    isValidObjectId,
    isValidDateFormat,
    isValidDate,
    isEmptyFile,
    acceptFileType,
    isValidJSONstr,
    isPincodeValid,
    checkArrContent
}