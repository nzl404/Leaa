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
    conclusionText = pickRandom(conclusions.ganteng);
  } else {
    conclusionText = pickRandom(conclusions.gantengBanget);
  }

  let text = `
*Cek Seberapa Ganteng* @${who.split('@')[0]}

*${percentage}%* Ganteng 😎
_${conclusionText}_
`.trim();

  conn.reply(m.chat, text, m, {
    mentions: [who]
  });
};

handler.help = ['gantengcek <@user>'];
handler.tags = ['fun'];
handler.command = /^(gantengcek|cekganteng)$/i;
handler.group = true;
handler.limit = true;

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
    'Keknya bakal susah dapet jodoh lu, berdoa aja ya',
    'Yang sabar ya, omm... 😂',
    'Masih bisa diperbaiki, coba cuci muka dulu.',
    'Mungkin karena sering ngaca pas gelap 😅'
  ],
  standar: [
    'Lu setengah ganteng, setengah... ya gitu 😶',
    'Cukuplah, gak bikin pingsan juga.',
    'Lumayan sih, asal jangan nyengir.',
    'Ganteng versi trial 🤏'
  ],
  ganteng: [
    'Gak akan salah lagi dah omm!',
    'Dijamin cewek auto salfok liat lo!',
    'Fix kamu punya aura aktor Korea!',
    'Penuh pesona, cocok jadi cowok utama drama.'
  ],
  gantengBanget: [
    'Kamu Ganteng banget! Jadi pacar Elaina aja yok 😍',
    'Cewek2 pasti auto jatuh cinta liat lo! 🔥',
    'Bidadari pun malu liat kegantengan lo!',
    'RARE SPECIMEN DITEMUKAN!!! 😳💯'
  ]
};

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}