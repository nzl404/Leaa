let { sticker5 } = require('../lib/sticker');
let fs = require('fs');
let fetch = require('node-fetch');

let handler = async (m, {
    conn,
    text,
    usedPrefix,
    command
}) => {
    // 1. Validasi input teks
    let Teks = text ? text : m.quoted && m.quoted.text ? m.quoted.text : m.quoted && m.quoted.caption ? m.quoted.caption : m.quoted && m.quoted.description ? m.quoted.description : '';
    if (!Teks) throw `Contoh Penggunaan:\n${usedPrefix + command} Teks Anda`;

    // 2. Kirim reaksi 'loading' untuk memberikan feedback ke user
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });

    // 3. Ambil konfigurasi global
    const packname = global.packname;
    const author = global.author;

    // 4. Siapkan URL dasar dan API Key (pastikan variabel 'lann' terdefinisi di tempat lain)
    const API_BASE_URL = 'https://api.betabotz.eu.org/api/maker/';
    const API_KEY = lann; // Pastikan variabel 'lann' ini sudah didefinisikan secara global atau di file config

    // 5. Muat stiker error sekali saja
    const errorSticker = fs.readFileSync(`./media/sticker/emror.webp`);

    try {
        let apiUrl;
        const encodedText = encodeURIComponent(Teks.substring(0, 151));

        // 6. Logika untuk membuat stiker video (kasus khusus)
        if (command === 'bratvideo') {
            apiUrl = `${API_BASE_URL}brat-video?text=${encodedText}&apikey=${API_KEY}`;
            await conn.sendVideoAsSticker(m.chat, apiUrl, m, { packname, author });
            return; // Keluar dari fungsi setelah selesai
        }

        // 7. Logika untuk semua stiker berbasis gambar (attp, ttp, brat)
        const imageStickerCommands = {
            attp: 'attp',
            ttp: 'ttp',
            brat: 'brat'
        };

        if (imageStickerCommands[command]) {
            apiUrl = `${API_BASE_URL}${imageStickerCommands[command]}?text=${encodedText}&apikey=${API_KEY}`;
            
            let fetchResult = await fetch(apiUrl);
            if (!fetchResult.ok) throw new Error(`API Error: ${fetchResult.statusText}`);
            
            let imageBuffer = await fetchResult.buffer();
            
            let stiker = await sticker5(
                imageBuffer,
                null,
                packname,
                author,
                ['🎨']
            );
            
            if (stiker) {
                await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m);
            } else {
                throw new Error('Pembuatan stiker gagal setelah menerima buffer.');
            }
        }

    } catch (e) {
        console.error('Error:', e);
        // Kirim stiker error jika terjadi masalah
        await conn.sendFile(m.chat, errorSticker, 'error.webp', '', m);
    }
}

handler.command = handler.help = ['attp', 'ttp', 'brat', 'bratvideo'];
handler.tags = ['sticker'];
handler.limit = false;
handler.group = false;

module.exports = handler;