const {Schema, model} = require('mongoose');

const UserSchema = new Schema({
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    isActivated: {type: Boolean, default: false},
    activationLink: {type: String}
})
//Создание модели пользователя и получение методов для работы с MongoDB из модуля mongoose

module.exports = model('User', UserSchema)