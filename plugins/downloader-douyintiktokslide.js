const fetch = require('node-fetch');

let handler = async (m, {
  conn,
  text,
  usedPrefix,
  command
}) => {
  await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });
  if (command == 'tiktokslide' || command == 'ttslide') { // Fixed the condition for 'tiktokslide' and 'ttslide' commands
    if (!text) throw `Masukkan URL!\n\ncontoh: ${usedPrefix + command} https://vt.tiktok.com/ZS6upAe5B/`;
    try {
      const api = await fetch(`https://api.betabotz.eu.org/api/download/ttslide?url=${text}&apikey=${lann}`);
      const res = await api.json();
      for (let i of res.result.images) {
        await sleep(3000);
        conn.sendMessage(m.chat, { image: { url: i } }, { quoted: m }); // Caption dihapus
      }
    } catch (e) {
      console.log(e);
      throw `🚩 *Terjadi kesalahan!*`;
    }
  }
  if (command == 'douyinslide' || command == 'douyinfoto') { // Fixed the condition for 'douyinslide' and 'douyinfoto' commands
    if (!text) throw `Masukkan URL!\n\ncontoh: ${usedPrefix + command} https://v.douyin.com/i2bPkLLo/`;
    try {
      const api = await fetch(`https://api.betabotz.eu.org/api/download/douyin-slide?url=${text}&apikey=${lann}`);
      const res = await api.json();
      for (let i of res.result.images) {
        await sleep(3000);
        conn.sendMessage(m.chat, { image: { url: i } }, { quoted: m }); // Caption dihapus
      }
    } catch (e) {
      console.log(e);
      throw `🚩 *Terjadi kesalahan!*`;
    }
  }
};

handler.help = ['tiktokslide', 'douyinslide'].map(v => v + ' <url>');
handler.tags = ['downloader'];
handler.command = /^(ttslide|tiktokslide|tiktokimg|ttimg)$/i;
handler.limit = true;

module.exports = handler;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}