// Impor library axios yang diperlukan untuk mengunduh gambar
const axios = require('axios');

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const user = global.db.data.users[m.sender];
  const lastDeliveryTime = user.lastredeem || 0;
  const currentTime = new Date().getTime();
  const timeDiff = currentTime - lastDeliveryTime;
  const cooldown = 300000; // 5 menit dalam milidetik

  // --- Peningkatan: Unduh thumbnail sekali saja di awal untuk efisiensi ---
  const thumbnailUrl = "https://www.pic.surf/3wrz";
  const thumbnail = await axios.get(thumbnailUrl, { responseType: "arraybuffer" }).then(res => res.data).catch(err => {
      console.error("Gagal mengunduh thumbnail:", err);
      return null; // Mengembalikan null jika gagal agar tidak crash
  });

  // Fungsi untuk mengirim balasan dengan tampilan yang sama
  const replyWithAd = (messageBody) => {
    conn.reply(m.chat, messageBody, m, {
      contextInfo: {
        externalAdReply: {
          title: "Betabotz-MD2",
          body: "Redeem Code Bot Whatsapp",
          thumbnail: thumbnail, // Gunakan thumbnail yang sudah diunduh
          sourceUrl: global.gc,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    });
  };

  // Cooldown check (5 menit)
  if (timeDiff < cooldown) {
    const remainingTime = cooldown - timeDiff;
    const remainingTimeString = clockString(remainingTime);
    return replyWithAd(`Kamu sudah melakukan redeem baru-baru ini. Tunggu ${remainingTimeString} lagi sebelum bisa redeem kembali.`);
  }

  if (!db.data.redeem || !db.data.redeem.code) {
    return conn.reply(m.chat, '❌ Tidak ada redeem code yang aktif saat ini', m);
  }

  if (new Date().getTime() > db.data.redeem.expires) {
    return conn.reply(m.chat, '❌ Redeem code sudah kadaluarsa', m);
  }

  if (!text) {
    return conn.reply(m.chat, `Contoh penggunaan: ${usedPrefix + command} ${db.data.redeem.code}`, m);
  }

  if (text !== db.data.redeem.code) {
    return conn.reply(m.chat, '❌ Kode redeem salah', m);
  }

  const reward = db.data.redeem.reward || {
    limit: 0,
    exp: 0,
    money: 0
  };

  user.limit += reward.limit;
  user.exp += reward.exp;
  user.money += reward.money;
  user.lastredeem = Date.now();

  const successMessage = `🎉 Redeem Berhasil! Kamu Mendapatkan:
  
➕ Limit: ${reward.limit}
➕ Exp: ${reward.exp}
➕ Money: ${reward.money}

*By Bot Whatsapp*`;

  // Kirim pesan sukses menggunakan fungsi yang sudah dibuat
  replyWithAd(successMessage);
};

handler.help = ["claimredeem *[code redeem]*"];
handler.tags = ["rpg"];
handler.command = ["claimredeem"];
module.exports = handler;

function clockString(ms) {
  let h = Math.floor(ms / 3600000);
  let m = Math.floor(ms / 60000) % 60;
  let s = Math.floor(ms / 1000) % 60;
  
  let parts = [];
  if (h > 0) parts.push(h + ' Jam');
  if (m > 0) parts.push(m + ' Menit');
  if (s > 0) parts.push(s + ' Detik');
  
  // Jika tidak ada bagian yang valid (misalnya waktu habis), tampilkan pesan default
  if (parts.length === 0) {
      return 'sebentar';
  }

  return parts.join(' ');
}