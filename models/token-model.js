const {Schema, model} = require('mongoose');

const TokenShema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'}, //ref ссылка на модель User(ниже мы экспортируем модель Token)
    refreshToken: {type: String, required: true}
})
//Создание модели токена и получение методов для работы с MongoDB из модуля mongoose

module.exports = model('Token', TokenShema)