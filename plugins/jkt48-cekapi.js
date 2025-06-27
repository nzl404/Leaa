const { check } = require('@jkt48/core');

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) {
    throw `Harap masukkan API key yang ingin diperiksa!\n\nContoh:\n${usedPrefix}${command} <apikey>`;
  }

  try {
    // Menggunakan fungsi 'check' dari module baru
    const result = await check(text);

    // Asumsi struktur 'result' sama dengan module sebelumnya
    if (result.success) {
      const expiryDate = result.expiry_date;
      let message = `*––––––『 Status API Key 』––––––*\n\n`;
      message += `✅ *Status:* Valid\n`;
      message += `🗓️ *Kedaluwarsa:* ${expiryDate}\n`;

      m.reply(message);
    } else {
      m.reply(`❌ API Key tidak valid: ${result.message}`);
    }
  } catch (e) {
    console.error(e);
    m.reply('Terjadi kesalahan pada sistem saat memeriksa API key. Coba lagi nanti.');
  }
};

handler.help = ['checkapikey <apikey>'];
handler.command = ['checkapikey', 'cekapijkt48', 'cekjkt48api'];
handler.tags = ['tools'];
handler.private = true; 

module.exports = handler;