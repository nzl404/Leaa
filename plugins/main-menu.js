const { 
    BufferJSON, 
    WA_DEFAULT_EPHEMERAL, 
    generateWAMessageFromContent, 
    proto, 
    generateWAMessageContent, 
    generateWAMessage, 
    prepareWAMessageMedia, 
    areJidsSameUser, 
    getContentType 
} = require('@adiwajshing/baileys')

process.env.TZ = 'Asia/Jakarta'
let fs = require('fs')
let path = require('path')
let fetch = require('node-fetch')
let moment = require('moment-timezone')
let levelling = require('../lib/levelling')
let os = require('os')

let arrayMenu = ['all', 'main', 'ai', 'downloader', 'jkt48', 'anime', 'rpg', 'rpgG', 'sticker', 'xp', 'fun', 'game', 'group', 'asupan', 'randomnime', 'nsfw', 'nsfwnime', 'info', 'internet', 'search', 'islamic', 'kerang', 'maker', 'news', 'owner', 'voice', 'quotes', 'stalk', 'store', 'shortlink', 'tools', 'advanced', 'anonymous'];

const allTags = {
    'all': 'SEMUA MENU',
    'main': 'MAIN',
    'ai': 'AI',
    'downloader': 'DOWNLOADER',
    'jkt48': 'JKT48',
    'anime': 'ANIME',
    'rpg': 'RPG',
    'rpgG': 'RPG GUILD',
    'sticker': 'STICKER',
    'xp': 'XP',
    'fun': 'FUN',
    'game': 'GAME',
    'group': 'GROUP',
    'asupan': 'ASUPAN',
    'nsfw': 'NSFW (Premium)',
    'randomnime': 'RANDOM ANIME',
    'nsfwnime': 'NSFW ANIME (Premium)',
    'info': 'INFO',
    'internet': 'INTERNET',
    'search': 'SEARCH',
    'islamic': 'ISLAMIC',
    'kerang': 'KERANG',
    'maker': 'MAKER',
    'news': 'NEWS',
    'owner': 'OWNER',
    'voice': 'VOICE',
    'quotes': 'QUOTES',
    'stalk': 'STALK',
    'store': 'STORE',
    'shortlink': 'SHORT LINK',
    'tools': 'TOOLS',
    'advanced': 'ADVANCED',
    'anonymous': 'ANONYMOUS CHAT'
}

const defaultMenu = {
    before: `*_あ Library : [ Baileys-MD ]_*
*_あ Prefix : [ %p ]_*
*_あ Platform : [ ${os.platform()} ]_*
*_あ Uptime : [ %uptime ]_*
*_あ Date : [ %date ]_*
*_あ Database : [ %totalusers ]_*${String.fromCharCode(8206).repeat(4001)}`,
    header: '╭───「\t*%category*\t」',
    body: '❏ %cmd %islimit %isPremium',
    footer: '╰────────────✧',
    after: `\n*Note:* Ketik .menu <category> untuk melihat menu spesifik\nContoh: .menu tools`
}

let handler = async (m, { conn, usedPrefix: _p, args = [], command }) => {
    try {
        const randomThumbnail = thumbnails[Math.floor(Math.random() * thumbnails.length)];
        let user = global.db.data.users[m.sender]
        let name = `@${m.sender.split`@`[0]}`
        let teks = args[0] ? args[0].toLowerCase() : ''
        
        const premiumCategories = ['nsfw', 'nsfwnime'];
        if (premiumCategories.includes(teks) && !user.premium) {
            return m.reply('❌ *Khusus pengguna Premium.*')
        }

        let d = new Date(new Date + 3600000)
        let locale = 'id'
        let date = d.toLocaleDateString(locale, { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            weekday: 'long'
        })
        let time = d.toLocaleTimeString(locale, { 
            hour: 'numeric', 
            minute: 'numeric', 
            second: 'numeric' 
        })
        let _uptime = process.uptime() * 1000
        let uptime = clockString(_uptime)
        
        // Hitung total users
        let totalusers = Object.keys(global.db.data.users).length
        
        let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => {
            return {
                help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
                tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
                prefix: 'customPrefix' in plugin,
                limit: plugin.limit,
                premium: plugin.premium,
                enabled: !plugin.disabled,
            }
        })

        if (!teks) {
            // Menu utama dengan daftar kategori
            let menuList = `${defaultMenu.before}\n\n╭───「\t*DAFTAR MENU*\t」\n`
            for (let tag of arrayMenu) {
                if (premiumCategories.includes(tag) && !user.premium) continue;
                if (tag && allTags[tag]) {
                    menuList += `❏ ${_p}menu ${tag}\n`
                }
            }
            menuList += `╰────────────✧\n\n${defaultMenu.after}`

            let replace = { 
                '%': '%', 
                p: _p, 
                uptime, 
                name, 
                date, 
                time,
                totalusers
            }
            let text = menuList.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`, 'g'), (_, name) => '' + replace[name])

            await conn.relayMessage(m.chat, {
                extendedTextMessage:{
                    text: text, 
                    contextInfo: {
                        mentionedJid: [m.sender],
                        externalAdReply: {
                            title: `🤖 WhatsApp Bot Menu`,
                            body: `${date} • ${time}`,
                            mediaType: 1,
                            previewType: 0,
                            renderLargerThumbnail: true,
                            thumbnailUrl: randomThumbnail,
                            sourceUrl: 'https://chat.whatsapp.com/JVkA1DAwsh9Jkax8P2ujDc'
                        }
                    }, 
                    mentions: [m.sender]
                }
            }, {})
            
        } else {
            // Menu kategori spesifik
            if (!allTags[teks]) {
                return m.reply(`❌ *Menu "${teks}" tidak tersedia.*\n\nSilakan ketik ${_p}menu untuk melihat daftar menu.`)
            }

            let menuCategory = defaultMenu.before + '\n\n'
            
            const tagsToDisplay = (teks === 'all') 
                ? arrayMenu.filter(tag => tag !== 'all' && (!premiumCategories.includes(tag) || user.premium)) 
                : [teks];

            for (let tag of tagsToDisplay) {
                if (allTags[tag]) {
                    menuCategory += defaultMenu.header.replace(/%category/g, allTags[tag]) + '\n'
                    let categoryCommands = help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help)
                    
                    // Sort commands: non-premium first, then premium
                    categoryCommands.sort((a, b) => a.premium - b.premium);
                    
                    for (let menu of categoryCommands) {
                        for (let helpCmd of menu.help) {
                            menuCategory += defaultMenu.body
                                .replace(/%cmd/g, menu.prefix ? helpCmd : '_' + _p + helpCmd + '_')
                                .replace(/%islimit/g, menu.limit ? '*(Ⓛ)*' : '')
                                .replace(/%isPremium/g, menu.premium ? '*(Ⓟ)*' : '') + '\n'
                        }
                    }
                    menuCategory += defaultMenu.footer + '\n'
                }
            }
            menuCategory = menuCategory.trim() + '\n\n' + defaultMenu.after

            let replace = { 
                '%': '%', 
                p: _p, 
                uptime, 
                name, 
                date, 
                time,
                totalusers
            }
            let text = menuCategory.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`, 'g'), (_, name) => '' + replace[name])

            await conn.relayMessage(m.chat, {
                extendedTextMessage:{
                    text: text, 
                    contextInfo: {
                        mentionedJid: [m.sender],
                        externalAdReply: {
                            title: `📋 Menu ${allTags[teks]}`,
                            body: `${date} • ${time}`,
                            mediaType: 1,
                            previewType: 0,
                            renderLargerThumbnail: true,
                            thumbnailUrl: randomThumbnail,
                            sourceUrl: 'https://chat.whatsapp.com/JVkA1DAwsh9Jkax8P2ujDc'
                        }
                    }, 
                    mentions: [m.sender]
                }
            }, {})
        }
        
        // Send audio if exists
        const musicPath = path.join(__dirname, '../media/menu.mp3');
        if (fs.existsSync(musicPath)) {
            await conn.sendMessage(m.chat, { 
                audio: { url: musicPath }, 
                mimetype: 'audio/mpeg',
                ptt: false
            }, { quoted: m });
        }
        
    } catch (e) {
        conn.reply(m.chat, '❌ *Maaf, menu sedang error*', m)
        console.error('Menu Error:', e)
    }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = /^(menu|help)$/i
handler.exp = 3

module.exports = handler

function clockString(ms) {
    if (isNaN(ms)) return '--:--:--'
    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

const thumbnails = [
    "https://files.catbox.moe/0qzp9p.jpg", 
    "https://files.catbox.moe/n782u7.jpg",
    "https://files.catbox.moe/0i4ic1.jpg", 
    "https://files.catbox.moe/73o2w4.jpg",
    "https://files.catbox.moe/lp2rf3.jpg", 
    "https://files.catbox.moe/srib0h.jpg",
    "https://files.catbox.moe/p1o8p5.jpg", 
    "https://files.catbox.moe/bab8be.jpg",
    "https://files.catbox.moe/7j81of.jpg", 
    "https://files.catbox.moe/0rhijx.jpg",
    "https://files.catbox.moe/aqluud.jpg", 
    "https://files.catbox.moe/n2kdwa.jpg",
    "https://files.catbox.moe/kcsanr.jpg", 
    "https://files.catbox.moe/fyyxsw.jpg",
    "https://files.catbox.moe/90jytg.jpg", 
    "https://files.catbox.moe/hhz4ig.jpg",
    "https://files.catbox.moe/vyxw7r.jpg", 
    "https://files.catbox.moe/pjfzif.jpg",
    "https://files.catbox.moe/3xha3s.jpg"
];