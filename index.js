require('dotenv').config()
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const router = require('./router/index')
const errorMiddleware = require('./middlewares/error-middleware')


const DB_URL = process.env.DB_URL
const PORT = process.env.PORT || 7000
const CLIENT_URL = process.env.CLIENT_URL
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: CLIENT_URL
}));
app.use('/api', router);
app.use(errorMiddleware); //Мидлвэйры для ошибок идут в самом конце 
//Подключение middleware для нашего приложения

const start = async () => {
    try {
        await mongoose.connect(DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        //Подключение к MongoDB
        app.listen(PORT, () => console.log('Сервер запущен на порте:', PORT))
    } catch(e) {
        console.log(e)
    }
}

start()