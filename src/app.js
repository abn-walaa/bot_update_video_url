const TelegramBot = require('node-telegram-bot-api');
const express = require('express')
const app = express()

const { v1 } = require("uuid")
const token = '6705440251:AAFjmoCdD0Cy47qfkqRHS7iza8CYGpswF-g';
const User = require('../modules/users');

const bot = new TelegramBot(token, { polling: true });

const channle = "-1002098911557"
let data = []
let data_sets = []
const AdminId = 6581489796;
let isOneAdding = false;
let invite_link = "";
let isTitle = false;
let title = "Hello there"
const URL_WEB = "https://s.wejha.dev/stream/";
(async () => {
    try {
        // console.log(await bot.getChat("-1001729979028"))
        invite_link = (await bot.getChat(channle)).invite_link
    } catch (error) {
        console.log(error.message)
    }
})();

app.set('view engine', 'hbs');

app.get('/stream/:id', async (req, res) => {
    try {
        console.log(req.headers["user-agent"])
        let { id } = req.params
        if (id >= data.length || id >= data_sets.length) {
            res.redirect("/404")
            return;
        }
        console.log(data[id])
        res.render("video", { url: data[data_sets.indexOf(id)][0].url_data })
    } catch (error) {
        res.redirect("/404")
    }
})
app.use("*", (req, res) => {
    res.redirect("https://t.me/hamadtxt")
})
app.listen(3000, () => {
    console.log("SERver is Up")
})
// ---------------------
bot.onText(/\/(.+)/, async (msg, match) => {
    try {

        let text = match[1]
        let chatId = msg.from.id
        if (chatId !== AdminId) {
            return;
        }
        if (text === "up") {
            await bot.sendMessage(chatId, "قم بارسال عنوان  البث :")
            data = []
            data_sets = []
            isOneAdding = true
            isTitle = true
        }
        if (text === "done") {
            isOneAdding = false;
            isTitle = false;
            await bot.sendMessage(chatId, "جاري الاضاعة")
            boradCast()
        }
        if (text === "users") {
            let users = await User.countDocuments()
            await bot.sendMessage(chatId, users)
        }
        if (text === "cancel") {
            isTitle = false;
            isOneAdding = false;
            data = [];
            data_sets = []
            await bot.sendMessage(chatId, "تم الالغاء جميع العمليات وتم حذف البثوث")
        }
        if (text === "pre") {
            await bot.sendMessage(chatId, title, {
                reply_markup: { inline_keyboard: data }
            })
        }
    } catch (error) {

    }

})


bot.on('message', async (msg) => {
    try {
        let chatId = msg.from.id
        if (chatId === AdminId && msg.text !== "/start") {
            if (msg.text[0] === "/") {
                return;
            }
            if (isTitle) {
                title = msg.text;
                isTitle = false;
                await bot.sendMessage(chatId, `
                    الان قوم بارسال الراوبط مع العنوان كمثال
                    url;title
                    `
                )
                return
            }
            if (isOneAdding) {
                let text_d = msg.text.split(";")
                if (text_d.length < 2) {
                    await bot.sendMessage(chatId, "  يرجى ارساله مثل الطريقة في الاعلى")
                    return
                }
                let uuid_1 = v1()
                data_sets.push(uuid_1)
                data.push([{ web_app: { url: URL_WEB + uuid_1 }, text: text_d[1], url_data: text_d[0] }])
                await bot.sendMessage(chatId, "تم اضافة البث")
                return;
            }
        }
        let user = await bot.getChatMember(channle, chatId)

        if (user.status !== "creator" && user.status !== "administrator" && user.status !== "member") {
            await bot.sendMessage(chatId, `
                يجب ان تشترك اولا !
بعد الاشتراك قم بارسال /start
                `, {
                reply_markup: {
                    inline_keyboard: [[{ text: "اشترك الان", url: invite_link }]]
                }
            }).catch(e => { })
            return;
        }
        saveUser({ user_id: msg.from.id, is_bot: msg.from.is_bot, name: msg.from.first_name, lang: msg.from.language_code })
        // console.log(user)
        if (data.length === 0) {
            await bot.sendMessage(chatId, "لاتتوفر بث الان").catch(e => { });
            return;
        }
        await bot.sendMessage(chatId, title,
            {
                reply_markup: { inline_keyboard: data }
            }
        ).catch(e => { })
    } catch (error) {
        console.error(error)
    }
})

async function boradCast() {
    let users = await User.find();
    let s = setInterval(async () => {
        try {
            if (users.length === 0) {
                bot.sendMessage(AdminId, "تم اعلان ", { reply_markup: { inline_keyboard: data } }).catch(e => { })
                clearInterval(s)
                return;
            }
            if (users.length <= 20) {
                clearInterval(s)
                for (let i = 0; i < users.length; i++) {
                    await bot.sendMessage(users[i].user_id,
                        `
                        ${title}
                        
                        -ارسال /start للعرض
                        `
                        ,).catch(e => { })
                }
                users = []
                bot.sendMessage(AdminId, "تم اعلان ", { reply_markup: { inline_keyboard: data } }).catch(e => { })
                return;
            }
            let newData = users.slice(0, 20);
            users = users.slice(20)
            for (let i = 0; i < newData.length; i++) {
                await bot.sendMessage(newData[i].user_id, `
                        ${title}
                        
                        -ارسال /start للعرض
                        `,).catch(e => { })
                return;
            }
        } catch (error) {
            console.error(error)
        }
    }, 1000)


}
async function saveUser({ is_bot, user_id, name, lang }) {

    User.create({
        is_bot, name, user_id, lang
    }).catch(e => {
        // console.log(e)
    });

}