const axios = require('axios');

let handler = async (m, { conn }) => {
    try {
        if (!m.quoted || !m.quoted.text) {
            throw 'Perintah ini digunakan dengan cara me-reply pesan yang berisi kode CJS.';
        }

        // --- PERUBAHAN: Menggunakan reaksi untuk feedback ---
        await conn.sendMessage(m.chat, {
            react: {
                text: '⏳', // Reaksi "sedang diproses"
                key: m.key,
            }
        });

        const cjsCode = m.quoted.text;
        
        const { data } = await axios.get(`https://api.nekorinn.my.id/tools/cjs2esm?code=${encodeURIComponent(cjsCode)}`);

        if (!data.status || !data.result) {
            throw new Error(data.message || 'Gagal mengonversi kode. Pastikan kode CJS valid.');
        }
        
        const esmCode = data.result;

        // --- PERUBAHAN: Output hanya berisi kode dalam code block ---
        const responseText = `\`\`\`javascript\n${esmCode}\n\`\`\``;

        await conn.sendMessage(m.chat, { text: responseText }, { quoted: m });
        
        // --- PERUBAHAN: Reaksi "berhasil" setelah mengirim hasil ---
        await conn.sendMessage(m.chat, {
            react: {
                text: '✅',
                key: m.key,
            }
        });

    } catch (e) {
        // --- PERUBAHAN: Reaksi "gagal" jika terjadi error ---
        await conn.sendMessage(m.chat, {
            react: {
                text: '❌',
                key: m.key,
            }
        });
        
        console.error(e);
        const errorMessage = typeof e === 'string' ? e : e.message;
        m.reply(`Terjadi kesalahan: ${errorMessage}`);
    }
};

// Konfigurasi handler
handler.help = ['toesm (reply code)', 'cjs2esm (reply code)'];
handler.tags = ['tools'];
handler.command = /^(toesm|cjs2esm|convertesm)$/i;
handler.limit = true;

module.exports = handler;