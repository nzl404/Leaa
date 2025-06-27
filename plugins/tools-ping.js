// Cukup gunakan 'os' bawaan, tidak perlu 'node-os-utils'
const os = require('os');
const { performance } = require('perf_hooks');
const { sizeFormatter } = require('human-readable');

// Fungsi untuk format ukuran file
const format = sizeFormatter({
  std: 'JEDEC', // Menggunakan standar 1024 (KB, MB, GB)
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}`, // Output lebih bersih, contoh: 2.5 GB
});

let handler = async (m, { conn }) => {
  // 1. Catat waktu awal
  const old = performance.now();

  // 2. Ambil data yang diperlukan
  const chats = Object.values(conn.chats);
  const groups = chats.filter(v => v.id.endsWith('@g.us'));
  const used = process.memoryUsage();
  const cpu = os.cpus()[0]; // Ambil info CPU pertama, sudah cukup mewakili

  // 3. Ambil uptime dari proses utama (jika ada)
  let _muptime;
  if (process.send) {
    process.send('uptime');
    _muptime = await new Promise(resolve => {
      process.once('message', resolve);
      setTimeout(resolve, 1000);
    }) * 1000;
  }
  const uptime = clockString(_muptime);

  // 4. Catat waktu akhir dan hitung kecepatan
  const neww = performance.now();
  const speed = (neww - old).toFixed(2); // Dibulatkan 2 angka desimal

  // 5. Susun teks balasan yang lebih ringkas dan rapi
  const replyText = `
* merespon dalam ${speed} ms*

*📊 STATUS BOT*
- *Uptime:* ${uptime}
- *Total Chat:* ${chats.length} Chat
- *Grup:* ${groups.length} Grup
- *Chat Pribadi:* ${chats.length - groups.length} Chat

*💻 INFO SERVER*
- *RAM:* ${format(os.totalmem() - os.freemem())} / ${format(os.totalmem())}
- *CPU:* ${cpu.model.trim()} (${os.cpus().length} Core)
- *Platform:* ${os.platform()}
- *Memory Usage:* ${format(used.rss)}
  `.trim();

  // 6. Kirim pesan dengan thumbnail
  await conn.sendMessage(m.chat, {
    text: replyText,
    contextInfo: {
      externalAdReply: {
        title: "Bot Status & Speed",
        body: `Uptime: ${uptime}`,
        mediaType: 1,
        thumbnailUrl: 'https://telegra.ph/file/ec8cf04e3a2890d3dce9c.jpg',
        sourceUrl: '' // Bisa diisi link grup atau website Anda
      }
    }
  }, { quoted: m });
};

handler.help = ['ping', 'speed'];
handler.tags = ['info'];
handler.command = /^(ping|speed|pong|ingfo)$/i;

module.exports = handler;

// Helper function untuk format waktu
function clockString(ms) {
  if (isNaN(ms)) return 'N/A';
  let d = Math.floor(ms / 86400000);
  let h = Math.floor(ms / 3600000) % 24;
  let m = Math.floor(ms / 60000) % 60;
  let s = Math.floor(ms / 1000) % 60;
  
  let parts = [];
  if (d > 0) parts.push(d + ' Hari');
  if (h > 0) parts.push(h + ' Jam');
  if (m > 0) parts.push(m + ' Menit');
  if (s > 0) parts.push(s + ' Detik');
  
  return parts.join(', ');
}
