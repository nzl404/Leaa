let handler = async (m, { conn }) => {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;

  const percentage = Math.floor(Math.random() * 101);
  let conclusionText;

  if (percentage <= 10) {
    conclusionText = pickRandom(conclusions.sangatAman);
  } else if (percentage <= 30) {
    conclusionText = pickRandom(conclusions.aman);
  } else if (percentage <= 60) {
    conclusionText = pickRandom(conclusions.waspada);
  } else if (percentage <= 85) {
    conclusionText = pickRandom(conclusions.bahaya);
  } else { // 86-100%
    conclusionText = pickRandom(conclusions.akut);
  }

  let text = `
*Cek seberapa jomok* @${who.split('@')[0]}

*${percentage}%* Jomok
_${conclusionText}_
`.trim();

  conn.reply(m.chat, text, m, {
    mentions: [who]
  });
};

handler.help = ['jomokcek <@user>'];
handler.tags = ['fun'];
handler.command = /^(cekjomok|jomokcek)$/i;
handler.group = true;
handler.limit = true;

module.exports = handler;

const conclusions = {
  sangatAman: ['100% Lurus, Terpantau Normal!', 'Sangat Aman! Cuma teman biasa.', 'Hasil Scan: Tidak ada kelainan.', 'Jiwa Lelaki Sejati!'],
  aman: ['Masih di jalur yang benar.', 'Ada belok dikit buat teman akrab.', 'Tingkat rendah, cuma buat seru-seruan.', 'Gejala ringan terdeteksi.'],
  waspada: ['Mulai mencurigakan nih...', 'Sudah setengah jalan, perlu waspada!', 'Getaran-getaran aneh mulai terasa...', 'Status: Siaga 1.'],
  bahaya: ['Ini sudah bahaya!', 'Sudah melewati batas wajar!', 'Siap-siap ganti gear!', 'Warning! Tingkat jomok tinggi!'],
  akut: ['RAJA IBLIS TELAH TERDETEKSI!', 'GAK ADA HARAPAN, FIX JOMOK AKUT!', 'TOBAT SEKARANG JUGA ATAU TERLAMBAT!', 'LEVEL MAKSIMAL! SUDAH TIDAK TERTOLONG!']
};

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
};