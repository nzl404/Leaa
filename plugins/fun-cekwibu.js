let handler = async (m, { conn }) => {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;

  const percentage = Math.floor(Math.random() * 101);
  let conclusionText;

  if (percentage <= 10) {
    conclusionText = pickRandom(conclusions.normal);
  } else if (percentage <= 30) {
    conclusionText = pickRandom(conclusions.mulaiWibu);
  } else if (percentage <= 60) {
    conclusionText = pickRandom(conclusions.setengahWibu);
  } else if (percentage <= 85) {
    conclusionText = pickRandom(conclusions.wibuBanget);
  } else {
    conclusionText = pickRandom(conclusions.wibuAkut);
  }

  let text = `
*Cek Seberapa Wibu* @${who.split('@')[0]}

*Wibu Level : ${percentage}%* 🧠
_${conclusionText}_
`.trim();

  conn.reply(m.chat, text, m, {
    mentions: [who]
  });
};

handler.help = ['wibucek <@user>'];
handler.tags = ['fun'];
handler.command = /^(wibucek|cekwibu)$/i;
handler.group = true;
handler.limit = true;

module.exports = handler;

const conclusions = {
  normal: [
    'Selamat, kamu masih waras 😎',
    'Aman banget, belum terlalu kena.',
    'Masih bisa diselamatkan!',
    'Ngaku aja, cuma nonton Naruto doang kan?'
  ],
  mulaiWibu: [
    'Udah mulai suka waifu tapi masih denial.',
    'Kayaknya kamu punya body pillow deh...',
    'Sering nyebut "ara ara" gak nih?'
  ],
  setengahWibu: [
    'Lu udah paham bedanya loli dan imouto.',
    'Sering nonton anime pas sahur.',
    'Lu punya list waifu di HP kan?',
    'Udah langganan anime tiap musim.'
  ],
  wibuBanget: [
    'Punya koleksi figure pasti!',
    'Nonton anime tanpa subtitle!',
    'Fix, wibu sepuh... panggil senpai!'
  ],
  wibuAkut: [
    'WAIFU > REAL LIFE 😭',
    'Lu gak tidur demi nonton anime!',
    'LU WIBU AKUT!!! NGAKAK 🤣',
    'Punya istri 2D dan bangga! 🗿'
  ]
};

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}