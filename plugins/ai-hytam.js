const fetch = require('node-fetch');
const uploadImage = require('../lib/uploadImage.js');

let handler = async (m, { conn }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!/image/g.test(mime)) throw 'Silakan kirim atau reply gambar dengan caption *.hytamkan*';

    m.reply('Proses penghytaman lurr.....');

    let media = await q.download();
    let url = await uploadImage(media);
    if (!url) throw 'Gagal mengunggah gambar. Coba lagi nanti.';

    const prompt = "Please realistically change the skin tone of the person in this image to a dark, natural-looking black skin tone. Pay close attention to preserving the original lighting, shadows, and highlights to ensure the result looks authentic and seamlessly integrated with the environment. The final output should be a high-quality, convincing edit.";

    try {
        let res = await fetch(`https://api.nekorinn.my.id/ai/gemini-canvas?text=${encodeURIComponent(prompt)}&imageUrl=${encodeURIComponent(url)}`);
        
        if (!res.ok) {
            let errorBody = await res.text();
            throw `Gagal menghubungi API. Status: ${res.status}. Pesan: ${errorBody}`;
        }

        let json = await res.json();
        
 
        if (!json.result || typeof json.result !== 'string') {
            throw 'Gagal mendapatkan URL gambar dari API. Respon tidak sesuai format.';
        }

        await conn.sendFile(m.chat, json.result, 'hytam.jpg', 'Jadi gosonk chef', m);

    } catch (e) {
        console.error(e);
        m.reply(`Terjadi kesalahan: ${e.message || e}`);
    }
};

handler.help = ['hytamkan'];
handler.tags = ['ai'];
handler.command = /^(hytamkan|hytam|hitamkan)$/i;
handler.register = true;
handler.limit = true;

module.exports = handler;