const nodemailer = require('nodemailer')

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASSWORD;


class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure: true,
            auth: {
                user,
                pass,
            }
        })
        // host - хост почтового сервера, port - порт почтового сервера, auth - авторизационная информация об аккаунте с которого отсылаются письма
    }

    async sendActivationMail(to, link) {
        await this.transporter.sendMail({
            from: user,
            to,
            subject: 'Активация аккаунта ' + process.env.API_URL,
            text: '',
            html: `<div>
                        <h1>Для активации перейдите по ссылке</h1>
                        <a href="${link}">${link}</a>
                    </div>`
                
        })
    }
    //методом sendMail отпарвляем письмо от(from) кому(to) с заголовком(subject), текстом(text) и html разметкой
}

module.exports = new MailService();