const ApiError = require('../exceptions/api-error')
const tokenService = require('../service/token-service')

module.exports = function (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return next(ApiError.UnathorizefError())
        }
        //Получаем заголовок Authorization из header запроса
    
        const accessToken = authorizationHeader.split(' ')[1];
        if (!accessToken) {
            return next(ApiError.UnathorizefError())
        }
        //Получаем токен из заголовка

        const userData = tokenService.validateAccessToken(accessToken);
        if (!userData) {
            return next(ApiError.UnathorizefError())
        }
        //Валидируем access токен и получаем userData из него

        req.user = userData;
        next();
        //Помещаем в поле юзер данные, которые мы вытащили из токена. Далее вызываем функцию next  и передаем управление следующему middleware
    } catch(e) {
        return next(ApiError.UnathorizefError())
    }
}