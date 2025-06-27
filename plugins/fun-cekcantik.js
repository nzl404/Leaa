let handler = async (m, { conn }) => {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;

  const percentage = Math.floor(Math.random() * 101);
  let conclusionText;

  if (percentage <= 10) {
    conclusionText = pickRandom(conclusions.jelekParah);
  } else if (percentage <= 30) {
    conclusionText = pickRandom(conclusions.agakJelek);
  } else if (percentage <= 60) {
    conclusionText = pickRandom(conclusions.standar);
  } else if (percentage <= 85) {
    conclusionText = pickRandom(conclusions.cantik);
  } else {
    conclusionText = pickRandom(conclusions.cantikBanget);
  }

  let text = `
*Cek Seberapa Cantik* @${who.split('@')[0]}

*${percentage}%* Cantik ✨
_${conclusionText}_
`.trim();

  conn.reply(m.chat, text, m, {
    mentions: [who]
  });
};

handler.help = ['cantikcek <@user>'];
handler.tags = ['fun'];
handler.command = /^(cantikcek|cekcantik)$/i;
handler.group = true;
handler.limit = false;

module.exports = handler;

const conclusions = {
  jelekParah: [
    'INI MUKA ATAU SAMPAH?!',
    'Serius ya, lu hampir mirip kayak monyet!',
    'Makin lama liat muka lo gue bisa muntah!',
    'AWOAKAK BURIQQ SEKALI!!!',
    'Rating 1/10 pun kebanyakan 😭'
  ],
  agakJelek: [
    'Mungkin karena sering ngaca pas gelap 😅',
    'Keknya bakal susah dapet jodoh lu, berdoa aja ya',
    'Yang sabar ya, ayang... 😂',
    'Gak semua orang terlahir glowing kok.'
  ],
  standar: [
    'Lu setengah cantik, setengah... ya gitu 😶',
    'Cukuplah, gak bikin pingsan juga.',
    'Lumayan sih, asal jangan ketawa.',
    'Versi lite dari cantik 🤏'
  ],
  cantik: [
    'Gak akan salah lagi dah neng!',
    'Dijamin cowok auto salfok liat lo!',
    'Penuh pesona, cocok jadi cover drama Korea.',
    'Kecantikan alami detected 🌸'
  ],
  cantikBanget: [
    'Cantik maksimal! WAJIB jadi pacar owner nih 😍',
    'Auto bikin semua mata ngelirik!',
    'Bidadari mana yang nyasar ke grup ini?',
    'FIX! Kamu cantik banget. 😍💯'
  ]
};

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}