const fetch = require('node-fetch');

let handler = async (m, { conn }) => {
  const username = [
    'jkt48.trisha', 'jkt48.ribka', 'jkt48.regie', 'jkt48.oline', 'jkt48.nayla',
    'jkt48.nala', 'jkt48.nachia', 'jkt48.moreen', 'jkt48.lily', 'jkt48.levi',
    'jkt48.lana', 'jkt48.kimmy', 'jkt48.fritzy', 'jkt48.erine_', 'jkt48.delynn',
    'jkt48.aralie', 'michiejkt48', 'greeseljkt48', 'graciejkt48', 'gendisjkt48',
    'elinjkt48', 'danellajkt48', 'daisyjkt48', 'cynthiajkt48', '_chelseajkt48',
    'cathyjkt48', '_auliajkt48', 'anindyajkt48', 'alyajkt48', 'jkt48.lyn.s',
    'jkt48.callie.a', 'jkt48.amanda.s', 'jkt48.indira.s', 'jkt48.raisha.s',
    'jkt48.aurellia_', 'jkt48.ella.a', 'lulu_jkt48', 'florajkt48', 'celine.tzh',
    'jecallista', 'marshajkt48', 'fionyjkt48', 'kathrinjkt48', 'fenijkt48',
    'freyajkt48', 'indahjkt48', 'muthejkt48', 'siscasarass', 'jessijkt48',
    '_shanindira', 'adel.revaa', 'yessicatamara_24', 'elijkt48', 'ollajkt48',
    'dheaangelialee', 'onieljkt48', 'gitajkt48', 'asheladz', 'indy.hapsari',
    'zeeasadel', 'eveantoinette', 'jinan.safa', 'gabywarouw4', 'hi.akumira',
    'christyjkt48', 'graciajkt48', 'anindthrc', 'jkt48.intan', 'jkt48.mikaela',
    'jkt48.maira', 'jkt48.ekin', 'jkt48.rilly', 'jkt48.giaa', 'jkt48.virgi',
    'jkt48.auwia', 'jkt48.jemima'
  ];

  const query = username[Math.floor(Math.random() * username.length)];

  try {
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });

    const res = await fetch(`https://api.betabotz.eu.org/api/asupan/tiktok?query=${query}&apikey=${lann}`);
    if (!res.ok) throw '🚩 *Gagal Mengambil Video*';

    const data = await res.json();
    if (!data || !data.result || !data.result.data || !data.result.data[0]) {
      throw '🚩 *Data Tidak Ditemukan*';
    }

    const video = data.result.data[0];
    const author = video.author;
    const music = video.music_info;

    let capt = `乂 *ASUPAN TIKTOK JKT48*\n\n`;
    capt += `  ◦ *Member* : ${author.nickname} (@${author.unique_id})\n`;
    capt += `  ◦ *Views* : ${video.play_count}\n`;
    capt += `  ◦ *Likes* : ${video.digg_count}\n`;
    capt += `  ◦ *Shares* : ${video.share_count}\n`;
    capt += `  ◦ *Comments* : ${video.comment_count}\n`;
    capt += `  ◦ *Duration* : ${Math.floor(video.duration / 60)} menit ${Math.floor(video.duration % 60)} detik\n`;
    capt += `  ◦ *Sound* : ${music.title} - ${music.author}\n`;
    capt += `  ◦ *Caption* : ${video.title || '-'}\n\n`;

    // Kirim video beserta caption
    await conn.sendFile(m.chat, video.play, null, capt, m);
  } catch (error) {
    console.error('Error:', error);
    throw `🚩 *Terjadi Kesalahan Saat Mengambil Video*`;
  }
};

handler.help = ['asupanjkt48'];
handler.tags = ['asupan'];
handler.command = /^(asupanjkt48)$/i;
handler.limit = false;

module.exports = handler;