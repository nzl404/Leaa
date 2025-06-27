let handler = async (m, { conn }) => {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;

  const percentage = Math.floor(Math.random() * 101);
  let conclusionText;

  if (percentage <= 10) {
    conclusionText = pickRandom(conclusions.cupu);
  } else if (percentage <= 30) {
    conclusionText = pickRandom(conclusions.wotaMuda);
  } else if (percentage <= 60) {
    conclusionText = pickRandom(conclusions.setengahWota);
  } else if (percentage <= 85) {
    conclusionText = pickRandom(conclusions.sepuh);
  } else {
    conclusionText = pickRandom(conclusions.ultimate);
  }

  let text = `
*Cek Seberapa Wota* @${who.split('@')[0]}

*Wota Level : ${percentage}%* 🎤
_${conclusionText}_
`.trim();

  conn.reply(m.chat, text, m, {
    mentions: [who]
  });
};

handler.help = ['wotacek <@user>'];
handler.tags = ['fun'];
handler.command = /^(wotacek|cekwota)$/i;
handler.group = true;
handler.limit = true;

module.exports = handler;

const conclusions = {
  cupu: [
    'Wota Baru Kah!!??🥵',
    'Cih Wota cupu🤪',
    'Masih Butuh Bimbingan😌',
    '99% Ga Bener :v !!!'
  ],
  wotaMuda: [
    'Boleh Juga',
    'Wota Dikit',
    'Wota ¼',
    'Lumayan Tapi Masih Cupu'
  ],
  setengahWota: [
    'Setengah Wota',
    'Anak Wota Biasa',
    'Udah Boleh Nih😏',
    'Pasti Lu Punya Seribu Oshi'
  ],
  sepuh: [
    'Gak Akan Salah Lagi Dah Lu Bejibun Oshi Cuy🤣',
    'SYNDROM WOTA🗿',
    'SEPUH WOTA😌👍',
    'Udah Elite Sih Ini😂'
  ],
  ultimate: [
    'BAU OSHI NYA SAMPE SINI CUY!!!🥵',
    'LU UDAH GILA OSHI BANGET😭🔥',
    'OSHIMEN DI HATI, DOMPET PUN RELA',
    'TIAP HARI NONTON LIVE, GAK ADA CAPE NYA 😭'
  ]
};

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}