const fetch = require('node-fetch');

let handler = async (m, { conn }) => {
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

  try {
    const apiUrl = 'https://api.nekorinn.my.id/info/cosplaytele-latest';
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.status || !data.result || data.result.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return m.reply(data.message || 'Gagal mengambil data terbaru dari API.');
    }

    const results = data.result;
    
    const limitedResults = results.slice(0, 20);
    
    let replyText = '✨ *Update Terbaru dari CosplayTele (20 Teratas)*\n\n';


    limitedResults.forEach((item, index) => {
      replyText += `*${index + 1}. ${item.title}*\n`;
      if (item.excerpt) {
        replyText += `  - _${item.excerpt.replace('[...]', '').trim()}_\n`;
      }
      replyText += `  - *Link:* ${item.url}\n\n`;
    });

    replyText += `> © Leaa`;

    await m.reply(replyText.trim());

  } catch (error) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    console.error('CosplayTele-Latest Plugin Error:', error);
    m.reply('Terjadi kesalahan saat memproses permintaan Anda.');
  }
};

handler.help = ['cosplaytelelatest'];
handler.tags = ['downloader', 'anime'];
handler.command = /^(cosplaytelelatest)$/i;
handler.group = false;
handler.premium = true;

module.exports = handler;