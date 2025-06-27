const axios = require('axios').default;
const { promisify } = require('util');
const sleep = promisify(setTimeout);

let handler = async (m, { conn }) => {
  try {
    // Kirim reaksi loading
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });

    // Ambil daftar media dari URL JSON
    const { data: mediaList } = await axios.get(
      'https://raw.githubusercontent.com/iniseira/asupan/main/tiduran.json',
      {
        timeout: 5000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }
    );

    if (!Array.isArray(mediaList) || !mediaList.length) {
      throw new Error('Data media tidak valid atau kosong');
    }

    // Lakukan maksimal 3 percobaan untuk unduh media
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        // Pilih media secara acak
        const mediaUrl = mediaList[Math.floor(Math.random() * mediaList.length)];

        if (!mediaUrl) {
          throw new Error('URL media kosong');
        }

        // Tentukan tipe media dari ekstensi
        const fileExtension = mediaUrl.split('.').pop().toLowerCase();
        const isHeic = fileExtension === 'heic';
        const isJpg = fileExtension === 'jpg' || fileExtension === 'jpeg';

        // Skip jika bukan foto (jpg/heic)
        if (!isJpg && !isHeic) {
          console.log(`Skipping non-photo file: ${mediaUrl}`);
          continue;
        }

        // Unduh media dengan responseType arraybuffer
        const { data: mediaBuffer } = await axios.get(mediaUrl, {
          responseType: 'arraybuffer', // Pastikan data diambil sebagai buffer
          timeout: 15000, // Timeout lebih singkat
          maxContentLength: 10 * 1024 * 1024, // Batas maksimal 10MB
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': isHeic ? 'image/heic,image/*' : 'image/jpeg,image/*'
          }
        });

        // Kirim media jika berhasil diunduh
        await conn.sendMessage(m.chat, {
          image: mediaBuffer,
          mimetype: isHeic ? 'image/heic' : 'image/jpeg',
          caption: '_Random Pose Rebahan Kak_\n\n> Ketik lagi kalo mau yang lainnya.',
        }, { quoted: m });

        // Tampilkan reaksi sukses
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        return;

      } catch (downloadError) {
        console.error(`Percobaan unduhan ke-${attempt + 1} gagal:`, downloadError.message);
        if (attempt < 2) await sleep(1000); // Tunggu 1 detik sebelum mencoba ulang
      }
    }

    // Jika semua percobaan gagal
    throw new Error('Gagal mengunduh media setelah beberapa percobaan');

  } catch (error) {
    console.error('[MEDIA ERROR]', {
      message: error.message,
      code: error.code || 'UNKNOWN'
    });

    // Tampilkan reaksi gagal
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

    // Kirim pesan error ke pengguna
    await conn.reply(m.chat, '*Media tidak tersedia. Silakan coba lagi.*', m);
  }
};

// Pengaturan command
handler.help = ['dolphinpose'];
handler.tags = ['asupan'];
handler.command = /^(tiduran|rebahan|dolphinpose|lumba2|poselumba2)$/i;

module.exports = handler;