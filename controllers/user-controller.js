const userService = require('../service/user-service')
const {validationResult} = require('express-validator') //Импортируем функцию для получения результата валидации. Валидировали мы в файле роутера(router/index.js)
const ApiError = require('../exceptions/api-error')

class UserController {
    //функция next вызывает следующий в цепочке middleware
    async registration(req, res, next) {
        try {
            const errors = validationResult(req); //Передаем объект req. Так как функцию автоматически достанет из него поле body и провалидирует нужные поля
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }
            //Если объект ошибок не пустой, то выбрасываем ошибку и передаем в нее массив ошибок

            const {email, password} = req.body;
            //Вытаскиваем из тела ЗАПРОСА(require) почту и пароль
            const userData = await userService.registartion(email, password); //tokens, userDto
            //await т.к. метод registration асинхронный, передаем в него почту и пароль

            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true}) //maxAge это время жизни cookie, 
            //чтобы данная конструкция работала мы подключили middleware cookieParse                      //флаг httpOnly блокирует измение и получение этой cookie внутри браузера

            return res.json(userData)
            //Отправка на клиент userData
        } catch(e) {
            next(e)
        }
    }

    async login(req, res, next) {
        try {
            const {email, password} = req.body;
            //Получаем почту и пароль из тела запроса(к серверу)
            const userData = await userService.login(email, password)
            //await т.к. метод login асинхронный, передаем в него почту и пароль

            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true}) //maxAge это время жизни cookie, 
            //чтобы данная конструкция работала мы подключили middleware cookieParse                      //флаг httpOnly блокирует измение и получение этой cookie внутри браузера
            //Функция записи refreshToken 

            return res.json(userData)
            //Отправка на клиент userData
        } catch(e) {
            next(e)
        }
    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            //Достаем refreshToken из куки запроса 
            const token = await userService.logout(refreshToken); 
            //Передаем токен для логаута 

            res.clearCookie('refreshToken'); 
            //Очищаем куки

            return res.json(token)
            //Отправляем токен на клиент(можно и передать статус код 200, токен передаем для наглядности)
        } catch(e) {
            next(e)
        }
    }

    async activate(req, res, next) {
        try {
            const activationLink = req.params.link;
            //Получаем ссылку из сторки запроса (/:link)

            await userService.activate(activationLink);
            //Передача ссылки в метод активации 
            return res.redirect(process.env.CLIENT_URL)
            //Возвращаем на клиент редирект 
        } catch(e) {
            next(e)
        }
    }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const userData = await userService.refresh(refreshToken)
            //await т.к. метод refresh асинхронный, передаем в него почту и пароль

            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true}) //maxAge это время жизни cookie, 
            //чтобы данная конструкция работала мы подключили middleware cookieParse                      //флаг httpOnly блокирует измение и получение этой cookie внутри браузера
            //Функция записи refreshToken 

            return res.json(userData)
            //Отправка на клиент userData
        } catch(e) {
            next(e)
        }
    }

    async getUsers(req, res, next) {
        try {
            const users = await userService.getAllUsers();
            //Получение всех юзеров из БД

            return res.json(users);
            //Отправка всех юзеров на клиент
        } catch(e) {
            next(e)
        }
    }
}

module.exports = new UserController();