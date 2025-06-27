const uploadImage = require('../lib/uploadImage');
const fetch = require('node-fetch'); // fetch mungkin masih dibutuhkan di tempat lain
const axios = require('axios'); // Kita akan utamakan axios

let handler = async (m, { conn, usedPrefix, command, text }) => {
    try {
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || q.mediaType || '';

        // 1. Perlindungan "View Once"
        if (q.msg?.viewOnce || q.viewOnce) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply('Maaf, bot tidak dapat memproses gambar yang bersifat "sekali lihat".');
        }

        // Validasi input di awal
        if (!/image/g.test(mime) || /webp/g.test(mime)) {
            await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
            return m.reply(`Kirim/balas sebuah gambar dengan caption *${usedPrefix + command}*`);
        }
        if (['imageedit', 'imgedit', 'img2img', 'editimg'].includes(command) && !text) {
            await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
            return m.reply('Tolong masukkan teks prompt untuk mengedit gambar.\nContoh: *' + usedPrefix + command + ' a beautiful girl*');
        }

        // 2. Sistem Reaksi
        await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });

        let endpoint = '';
        let processMessage = "Sedang memproses gambar...";
        let resultCaption = '';
        let isImageEdit = ['imageedit', 'imgedit', 'img2img', 'editimg'].includes(command);

        // Switch case untuk menentukan endpoint dan caption
        switch(command) {
            case 'jadidisney': case 'todisney': endpoint = 'disney'; break;
            case 'jadipixar': case 'topixar': endpoint = 'pixar'; break;
            case 'jadicartoon': case 'tocartoon': endpoint = 'cartoon'; break;
            case 'jadicyberpunk': case 'tocyberpunk': endpoint = 'cyberpunk'; break;
            case 'jadivangogh': case 'tovangogh': endpoint = 'vangogh'; break;
            case 'jadipixelart': case 'topixelart': endpoint = 'pixelart'; break;
            case 'jadicomicbook': case 'tocomicbook': endpoint = 'comicbook'; break;
            case 'jadihijab': case 'tohijab': case 'hijabkan': endpoint = 'hijab'; resultCaption = "Masyaallah ukhti..."; break;
            case 'jadihitam': case 'tohitam': endpoint = 'hitam'; resultCaption = "Jadi dark mode..."; break;
            case 'jadiputih': case 'toputih': case 'putihkan': endpoint = 'putih'; resultCaption = "Jadi light mode..."; break;
            case 'jadighibili': case 'toghibili': endpoint = 'ghibili'; break;
            case 'imageedit': case 'imgedit': case 'img2img': case 'editimg': endpoint = 'editimg'; break;
            default: throw new Error("Command tidak dikenali.");
        }

        const img = await q.download();
        const out = await uploadImage(img);
        const startTime = new Date();

        if (isImageEdit) {
            // Logika untuk image edit dengan prompt
            const resultUrl = await imageEditWithPrompt(text, out, lann);
            await conn.sendMessage(m.chat, { 
                image: { url: resultUrl }, 
                caption: `🎨 *Style:* Edit Gambar\n📋 *Prompt*: ${text}\n⏳ *Waktu:* ${((new Date() - startTime) / 1000).toFixed(2)} detik`
            }, { quoted: m });
        } else {
            // Logika untuk style tanpa prompt
            const apiUrl = `https://api.betabotz.eu.org/api/maker/jadi${endpoint}?url=${out}&apikey=${lann}`;
            const { data } = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            
            let caption = resultCaption || `🎨 *Style:* Jadi ${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}\n⏳ *Waktu:* ${((new Date() - startTime) / 1000).toFixed(2)} detik`;
            
            await conn.sendMessage(m.chat, { 
                image: data, 
                caption: caption
            }, { quoted: m });
        }

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        console.error(e);
        // Memberikan pesan error yang lebih spesifik jika dari API
        let errorMessage = e.response ? `Gagal mendapatkan gambar dari API. Pesan: ${e.response.data?.message || e.message}` : `Terjadi kesalahan: ${e.message}`;
        m.reply(errorMessage);
    }
};

handler.help = ['jadidisney', 'jadipixar', 'jadicartoon', 'jadicyberpunk', 'jadivangogh', 'jadipixelart', 'jadicomicbook', 'jadihitam', 'jadihijab', 'putihkan', 'jadighibli', 'imageedit', 'img2img'];
handler.command = /^(jadidisney|todisney|jadipixar|topixar|jadicartoon|tocartoon|jadicyberpunk|tocyberpunk|jadivangogh|tovangogh|jadipixelart|topixelart|jadicomicbook|tocomicbook|hijabkan|jadihijab|tohijab|jadihitam|tohitam|jadiputih|toputih|putihkan|jadighibli|toghibli|imageedit|imgedit|img2img|editimg)$/i;
handler.tags = ['ai'];
handler.premium = false;
handler.limit = true;

module.exports = handler;

// Fungsi helper untuk image edit dipisahkan agar lebih rapi
async function imageEditWithPrompt(text, url, apikey) {
  try {
    const { data } = await axios.post("https://api.betabotz.eu.org/api/maker/imgedit", {
      text: text,
      url: url,
      apikey: apikey
    });
    
    if (!data.result) throw new Error("Respons API tidak valid, tidak mengandung 'result'.");
    return data.result;
  } catch (error) {
    // Melempar error agar bisa ditangkap oleh blok catch utama
    throw new Error(error.response?.data?.message || error.message || "Gagal menghubungi API imageedit.");
  }
}