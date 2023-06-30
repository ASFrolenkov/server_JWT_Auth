const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const MailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error')

class UserService {
    async registartion(email, password) {
        const candidate = await UserModel.findOne({email}) //await т.к. работа с БД асинхронна
        if (candidate) {
            throw ApiError.BadRequest(`Пользователь с постовым адресом ${email} уже существует`)
        }
        //Проверяем есть ли с таким email пользователь в БД

        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4();
        const user = await UserModel.create({email, password: hashPassword, activationLink}); //await т.к. работа с БД асинхронна
        //Создаем user с захешируемым паролем и ссылкой для активации

        await MailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);
        //отправлем на email ссылку для активации

        return await this._returnTokensAndUser(user)
    };

    async activate(activationLink) {
        const user = await UserModel.findOne({activationLink})
        if (!user) {
            throw ApiError.BadRequest('Некорректная ссылка активации')
        }
        //Поиск пользователя в БД по ссылке активации

        user.isActivated = true;
        await user.save();
        //Меняем поле на true  и сохраняем пользователя в БД
    }

    async login(email, password) {
        const user = await UserModel.findOne({email})
        if (!user) {
            throw ApiError.BadRequest('Пользователь не был найден')
        }
        //Поиск пользователя в БД по почте

        const isPassEquals = await bcrypt.compare(password, user.password);
        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль')
        }
        //Сравнение хэшей пароля. Из БД на приходит сразу захешированный пароль

        return await this._returnTokensAndUser(user)
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnathorizefError();
        }
        //проверка на наличие токена

        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);
        //Получаем валидацию токена и сам токен из БД

        if (!userData || !tokenFromDb) {
            throw ApiError.UnathorizefError()
        }
        //Проверяем на наличие обоих токенов, иначе пользователь не авторизован 

        const user = await UserModel.findById(userData.id)
        //Находим пользователя по id в токене
        return await this._returnTokensAndUser(user)
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        //Удаляем refreshToken из БД

        return token;
        //Возварщаем результат выполнения метода removeToken
    }

    async getAllUsers() {
        const users = await UserModel.find();
        //без параметров метод find вернет все записи из БД

        return users;
    }

    async _returnTokensAndUser(user) {
        const userDto = new UserDto(user);
        const tokens = tokenService.generateToken({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken); //await т.к. метод saveToke асинхронный
        //Создаем userDto(инфо для отправки) и 2 токена(refresh, access) и сохранаем refresh token в БД

        return {
            ...tokens,
            user: userDto
        }
        //Возвращаем 2 токена refresh и access и в поле user добавляем dto(инфо о пользователе)
    }
}

module.exports = new UserService();