let handler = async (m, { conn, usedPrefix }) => {
  let user = global.db.data.users[m.sender];
  let timers = new Date() - user.lastngewe;
  let cooldown = 3600000; // 1 jam
  let _timers = cooldown - timers;

  if (new Date() - user.lastngewe < cooldown) {
    return m.reply(`Silahkan Menunggu Selama *${clockString(_timers)}*, untuk bisa beraksi lagi.`);
  }

  let id = m.sender;
  let kerja = "openbo";
  conn.misi = conn.misi || {};
  if (id in conn.misi) {
    return conn.reply(m.chat, `Selesaikan Misi *${conn.misi[id][0]}* Terlebih Dahulu`, m);
  }

  if (user.healt < 80) return m.reply(`Darahmu tersisa ${user.healt}, tidak cukup untuk beraksi. Butuh minimal 80 darah.`);
  if (user.stamina < 50) return m.reply(`Staminamu tersisa ${user.stamina}, tidak cukup untuk beraksi. Butuh minimal 50 stamina.`);

  let name = user.registered ? user.name : conn.getName(m.sender);
  let order = user.ngewe ? user.ngewe + 1 : 1;

  let ngerok4 = Math.floor(Math.random() * 10);
  let ngerok5 = Math.floor(Math.random() * 10);

  let ngrk4 = ngerok4 * 100000;
  let ngrk5 = ngerok5 * 1000;

  const tahap = [
    `🔍 ${name} sedang membuka aplikasi Michat, mencari om-om haus belaian...`,
    `📲 Orderan Masuk dari [ Om Teguh ]\n\nᴋᴀᴍᴜ ᴅᴀɴ ᴏᴍ ᴛᴇɢᴜʜ ᴍᴇᴍʙᴏᴏᴋɪɴɢ ʜᴏᴛᴇʟ\n▒▒[ᴏʏᴏ]▒▒\n▒▒▄▄▄▒▒ Kalian Berdua Masuk Ke kamar\n▒█▀█▀█▒ kamu Membuka bh mu\n░█▀█▀█░ Tete Mu diremas oleh om tgh\n░█▀█▀█░  ( . )( . )\n███████.  | 🤚 |\n\nOm Teguh Mulai Memasukan Kelamin nya ke dalam vagina mu....`,
    `Kamu Kesakitan ...\n\n(_)(_)=====D \()/  \n\nRahim mu terasa hangat`,
    `Om teguh pun crott\n\n()()=====D 💦💦💦   \n\n\n✅ Orderan Selesai`,
    `Om Teguh Memberimu Uang Lebih karena Goyanganmu Sangat unik 😝`
  ];

  const hsl = `
*—[ Hasil Ngentot ${name} ]—*
➕ 💹 Uang = +${ngrk4.toLocaleString('id-ID')}
➕ ✨ Exp = +${ngrk5.toLocaleString('id-ID')}
➕ 😍 Order BO Selesai = +1
➕ 📥 Total Bookingan : ${order}
`.trim();

  // Update stats pengguna
  user.money += ngrk4;
  user.exp += ngrk5;
  user.ngewe = order;
  user.healt -= 80;
  user.stamina -= 40;
  user.lastngewe = new Date() * 1;

  // Set misi lock
  conn.misi[id] = [
    kerja,
    setTimeout(() => {
      delete conn.misi[id];
    }, (tahap.length + 1) * 5000),
  ];

  // Memulai proses animasi pesan
  let { key } = await conn.reply(m.chat, tahap[0], m);

  for (let i = 1; i < tahap.length; i++) {
    await delay(5000);
    // [MODIFIKASI] Mengubah logika menjadi edit pesan menggunakan key yang sama
    await conn.sendMessage(m.chat, { text: tahap[i], edit: key });
  }

  // Menampilkan hasil akhir setelah animasi selesai
  await conn.reply(m.chat, hsl, m);
};

handler.help = ["ngentot"];
handler.tags = ["rpg"];
handler.command = /^(ngentot)$/i;
handler.register = true;
handler.group = true;
handler.level = 70;
handler.rpg = true;

module.exports = handler;

// Helper function
function clockString(ms) {
  let h = Math.floor(ms / 3600000);
  let m = Math.floor(ms / 60000) % 60;
  let s = Math.floor(ms / 1000) % 60;
  const parts = [];
  if (h > 0) parts.push(`${h} jam`);
  if (m > 0) parts.push(`${m} menit`);
  if (s > 0) parts.push(`${s} detik`);
  return parts.join(' ') || 'kurang dari 1 detik';
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}