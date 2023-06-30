const jwt = require('jsonwebtoken')
const tokenModel = require('../models/token-model')

const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;
//Получение переменных из .env

class TokenService {
    generateToken(payload) {
        const accessToken = jwt.sign(payload, accessSecret, {expiresIn: '15s'})
        const refreshToken = jwt.sign(payload, refreshSecret, {expiresIn: '30d'})
        //Генерация токенов

        return {
            accessToken,
            refreshToken,
        }
        //Возвращаем объект с токенами
    }

    validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, accessSecret);
            //Верификация токена. В метод verify передаем сам токен и секретный ключ
            //Достваем из токена userData

            return userData;
        } catch(e) {
            return null;
        }
    }

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, refreshSecret);
            //Верификация токена. В метод verify передаем сам токен и секретный ключ
            //Достваем из токена userData

            return userData;
        } catch(e) {
            return null;
        }
    }

    async findToken(refreshToken) {
        const tokenData = await tokenModel.findOne({refreshToken});
        //Ищем токен в БД

        return tokenData;
    }

    async saveToken(userId, refreshToken) {
        const tokenData = await tokenModel.findOne({user: userId}) //await т.к. работа с БД асинхронна
        if (tokenData) {
            tokenData.refreshToken = refreshToken
            return tokenData.save();
        }
        //Ищем в БД refresh token по userId и перезатираем его при совпадении 

        const token = await tokenModel.create({user: userId, refreshToken}) //await т.к. работа с БД асинхронна
        return token;
        //Создаем новое поле user с токеном
    }

    async removeToken(refreshToken) {
        const tokenData = await tokenModel.deleteOne({refreshToken})
        //метод deleteOne ищет запись по refreshToken и удаляет ее

        return tokenData;
        //Возвращаем результат работы метода deleteOne
    }
}

module.exports = new TokenService();