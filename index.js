const dotEnv = require('dotenv');
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

dotEnv.config()
const webAppUrl = 'https://inquisitive-kitsune-a894e1.netlify.app';

const bot = new TelegramBot(process.env.TOKEN, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        await bot.sendMessage(chatId,'Ниже появится кнопка, заполни форму', {
            reply_markup: {
                keyboard: [
                    [{text: 'Заполните форму', web_app: {url: webAppUrl + '/form'}}]
                ]
            }
        })

        await bot.sendMessage(chatId,'Заходи в наш интернет магазин по кнопке', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Сделать заказ', web_app: {url: webAppUrl}}]
                ]
            }
        })
    }

    if (msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data);

            await bot.sendMessage(chatId,'Спасибо за обратную связь!');
            await bot.sendMessage(chatId,`Вашы данные ${JSON.stringify(data)}`);
            await bot.sendMessage(chatId,`Ваша страна: ${data?.country}`);
            await bot.sendMessage(chatId,`Ваш город: ${data?.city}`);

            setTimeout(async () => {
                await bot.sendMessage(chatId,'Всю информацию вы получите в этом чате')
            }, 3000)
        } catch (e) {
            console.log(e);
        }
    }
});

app.post('/web-data', async (req, res) => {
    const {queryId, products, totalPrice} = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {
                message_text: `Поздравляем с покупкой, вы приобрели товар на сумму ${totalPrice}`
            }
        })
        return res.status(200).json({});
    } catch (e) {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Не удалось приобрести товар',
            input_message_content: {
                message_text: `Не удалось приобрести товар`
            }
        })
        return res.status(500).json({});
    }
})

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`))
