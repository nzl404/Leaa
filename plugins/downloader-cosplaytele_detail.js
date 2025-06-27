const fetch = require('node-fetch');

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0] || !args[0].includes('cosplaytele.com')) {
    throw `Harap masukkan URL dari CosplayTele yang valid.\n\n*Contoh:*\n${usedPrefix + command} https://cosplaytele.com/bikini-idol/`;
  }
  
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

  try {
    const apiUrl = `https://api.nekorinn.my.id/info/cosplaytele-detail?url=${encodeURIComponent(args[0])}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.status || !data.result) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return m.reply(data.message || 'Gagal mengambil detail dari API.');
    }

    const { 
      title, 
      tags, 
      posted_on, 
      cosplayer, 
      character, 
      appear_in, 
      info, 
      filesize, 
      unzip_password, 
      downloadUrl, 
      images 
    } = data.result;

    let replyText = `*${title}*\n\n`;
    replyText += `👤 *Cosplayer:* ${cosplayer.name}\n`;
    replyText += `🎭 *Karakter:* ${character}\n`;
    if (appear_in && appear_in.name) {
      replyText += `🎬 *Dari:* ${appear_in.name}\n`;
    }
    replyText += `📅 *Tanggal Post:* ${posted_on}\n\n`;
    
    replyText += `*🔖 Tags:*\n_${tags}_\n\n`;
    
    replyText += `*📦 Info Set:*\n`;
    replyText += `- *Isi:* ${info}\n`;
    if (filesize) {
      replyText += `- *Ukuran File:* ${filesize}\n`;
    }
    replyText += `- *Password Unzip:* \`${unzip_password}\`\n\n`;
    
    replyText += `*🔗 Link Download:*\n`;
    downloadUrl.forEach(link => {
      replyText += `  • *${link.provider}:* ${link.url}\n`;
    });

    replyText += `\n> © Leaa`;
    
    if (images && images.length > 0) {
      await conn.sendMessage(m.chat, { 
          image: { url: images[0] },
          caption: replyText.trim()
      }, { quoted: m });
    } else {
      await m.reply(replyText.trim());
    }

  } catch (error) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    console.error('CosplayTele-Detail Plugin Error:', error);
    m.reply('Terjadi kesalahan saat memproses permintaan Anda.');
  }
};

handler.help = ['cosplayteledetail <url>'];
handler.tags = ['downloader', 'anime'];
handler.command = /^(cosplayteledetail|ctdetail)$/i;
handler.premium = true;

module.exports = handler;