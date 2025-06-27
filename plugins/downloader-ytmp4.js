const axios = require('axios');
const fs = require('fs');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `Masukan URL!\n\ncontoh:\n${usedPrefix + command} https://youtu.be/4rDOsvzTicY?si=3Ps-SJyRGzMa83QT`;    
  
    try {
        await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });
        
        const response = await axios.get(`https://api.betabotz.eu.org/api/download/ytmp4?url=${text}&apikey=${lann}`);        
        const res = response.data.result;      
        var { mp4, id, title, source, duration } = res;

        // Check video size
        const videoSizeResponse = await axios.head(mp4);
        const videoSizeInMB = parseInt(videoSizeResponse.headers['content-length']) / (1024 * 1024);

        if (videoSizeInMB > 55) {
            return await conn.sendMessage(m.chat, { 
                text: `❌ Video size (${videoSizeInMB.toFixed(2)} MB) exceeds the 55 MB limit.` 
            }, { quoted: m });
        }

        let capt = `*乂 YT VIDEO*\n\n`;
        capt += `◦ *id* : ${id}\n`;
        capt += `◦ *tittle* : ${title}\n`;
        capt += `◦ *source* : ${source}\n`;
        capt += `◦ *duration* : ${duration}\n`;
        capt += `◦ *size* : ${videoSizeInMB.toFixed(2)} MB\n`;
        capt += `\n`;        

        await conn.sendMessage(m.chat, { 
            video: { url: mp4 }, 
            mimetype: 'video/mp4',
            fileName: `${title}##.mp4`,
            caption: capt
        }, { quoted: m });
   
    } catch (error) {
        console.error(error);
        await conn.sendMessage(m.chat, { text: 'Error downloading video' }, { quoted: m });
    }
};

handler.help = ['ytmp4'];
handler.command = /^(ytmp4|ytv|mp4)$/i
handler.tags = ['downloader'];
handler.limit = false;
handler.group = false;
handler.premium = false;
handler.owner = false;
handler.admin = false;
handler.botAdmin = false;
handler.fail = null;
handler.private = false;

module.exports = handler;