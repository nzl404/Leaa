/* DI BUAT OLEH XM4ZE
 * GITHUB:
 * https://github.com/XM4ZE/XMYULA-MD
 * Jika kamu menghapus WM ini maka
 * Kamu bersumpah dengan nama tuhanmu
 * Kalau kamu GAY
 */

const yts = require('yt-search');
const fetch = require('node-fetch');

const handler = async (m, { conn, command, text, args, usedPrefix }) => {
  // Validasi input
  if (!text) throw `Gunakan contoh *${usedPrefix + command}* nama lagu`;
  if (text.startsWith('https://')) return m.reply(`Silahkan gunakan perintah download untuk URL`);

  // Inisialisasi objek youtubeList jika belum ada
  conn.youtubeList = conn.youtubeList || {};
  
  // Tambahkan reaksi tunggu
  await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });

  try {
    // Cari video
    const result = await yts(text);
    const limitedVideos = result.videos.slice(0, 10);

    // Jika tidak ada video yang ditemukan
    if (limitedVideos.length === 0) {
      await conn.sendMessage(m.chat, { delete: waitKey.key });
      return m.reply('❌ Tidak ada video yang ditemukan.');
    }

    const infoText = `Silahkan pilih salah satu dari list di bawah dengan mereply pesan ini dengan angka yang kamu mau.`;

    const orderedLinks = limitedVideos.map((link, index) => {
      const sectionNumber = index + 1;
      const { title, duration } = link;
      return `${sectionNumber}. *${title}* (${duration.timestamp})`;
    });

    const orderedLinksText = orderedLinks.join("\n\n");
    const fullText = `${infoText}\n\n${orderedLinksText}`;

    // Hapus pesan tunggu
    await conn.sendMessage(m.chat, { delete: waitKey.key });

    // Kirim daftar video
    const { key } = await conn.reply(m.chat, fullText, m);

    // Simpan informasi di youtubeList
    conn.youtubeList[m.sender] = {
      limitedVideos,
      key,
      timeout: setTimeout(() => {
        conn.sendMessage(m.chat, { delete: key });
        delete conn.youtubeList[m.sender];
      }, 60 * 4000),
    };

  } catch (error) {
    console.error('Error searching YouTube:', error);
    m.reply('❌ Terjadi kesalahan saat mencari video.');
  }
};

handler.before = async (m, { conn }) => {
  // Inisialisasi youtubeList
  conn.youtubeList = conn.youtubeList || {};

  // Validasi pesan
  if (m.isBaileys || !(m.sender in conn.youtubeList)) return;

  const { limitedVideos, key, timeout } = conn.youtubeList[m.sender];

  if (!m.quoted || m.quoted.id !== key.id || !m.text) return;

  const choice = m.text.trim();
  const inputNumber = Number(choice);

  if (inputNumber >= 1 && inputNumber <= limitedVideos.length) {
    try {
      // Tambahkan reaksi tunggu
      await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });

      const selectedUrl = limitedVideos[inputNumber - 1].url;

      // Gunakan API download yang lebih umum
      const apiUrl = `https://api.betabotz.eu.org/api/download/ytmp3?url=${encodeURIComponent(selectedUrl)}&apikey=${lann}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Gagal mendapatkan data audio');
      }

      const { result: yt } = await response.json();

      // Info teks dengan fallback
      let infoText = `*INFORMASI AUDIO*
- *Judul:* ${yt.title || 'Tidak diketahui'}
- *Durasi:* ${yt.duration || 'Tidak diketahui'}
- *Sumber:* ${yt.source || 'Tidak diketahui'}

Audio sedang dikirim...`;

      // Kirim pesan info
      await conn.sendMessage(m.chat, {
        text: infoText,
        contextInfo: {
          externalAdReply: {
            title: `Anda memilih nomor ${inputNumber}`,
            body: yt.title || 'Musik',
            thumbnailUrl: yt.thumb || '',
            sourceUrl: selectedUrl,
            mediaType: 1,
            renderLargerThumbnail: true
          },
        },
      });

      // Kirim audio
      if (yt.mp3) {
        await conn.sendMessage(m.chat, {
          audio: { url: yt.mp3 },
          mimetype: 'audio/mp4',
          fileName: `${yt.title || 'audio'}.mp3`
        }, { quoted: m });

        // Reaksi berhasil
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      } else {
        // Reaksi gagal
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply('Tidak dapat mengunduh audio.');
      }

      // Bersihkan
      conn.sendMessage(m.chat, { delete: key });
      clearTimeout(timeout);
      delete conn.youtubeList[m.sender];

    } catch (error) {
      console.error('Error download audio:', error);
      
      // Reaksi gagal
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      m.reply('Gagal mengunduh audio. Silakan coba lagi.');
    }
  } else {
    m.reply(`Nomor urutan tidak valid. Silakan pilih nomor antara 1 sampai ${limitedVideos.length}`);
  }
};

handler.help = ["youtube", "yt"];
handler.tags = ["downloader"];
handler.command = /^(yt|youtube)$/i;

module.exports = handler;

/* DI BUAT OLEH XM4ZE
 * GITHUB:
 * https://github.com/XM4ZE/XMYULA-MD
 * Jika kamu menghapus WM ini maka
 * Kamu bersumpah dengan nama tuhanmu
 * Kalau kamu GAY
 */