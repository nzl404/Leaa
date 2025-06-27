const axios = require('axios');

let handler = async (m, { conn }) => {
    try {
        // Memeriksa apakah pengguna me-reply sebuah pesan teks
        if (!m.quoted || !m.quoted.text) {
            throw 'Perintah ini digunakan dengan cara me-reply pesan yang berisi kode ESM.';
        }

        // Menggunakan sistem reaksi untuk feedback
        await conn.sendMessage(m.chat, {
            react: {
                text: '⏳', // Reaksi "sedang diproses"
                key: m.key,
            }
        });

        // Mengambil kode ESM dari pesan yang di-reply
        const esmCode = m.quoted.text;
        
        // Memanggil API esm2cjs dengan kode yang sudah di-encode
        const { data } = await axios.get(`https://api.nekorinn.my.id/tools/esm2cjs?code=${encodeURIComponent(esmCode)}`);

        // Validasi respons dari API
        if (!data.status || !data.result) {
            throw new Error(data.message || 'Gagal mengonversi kode. Pastikan kode ESM valid.');
        }
        
        const cjsCode = data.result;

        // Output hanya berisi kode dalam code block
        const responseText = `\`\`\`javascript\n${cjsCode}\n\`\`\``;

        await conn.sendMessage(m.chat, { text: responseText }, { quoted: m });
        
        // Reaksi "berhasil" setelah mengirim hasil
        await conn.sendMessage(m.chat, {
            react: {
                text: '✅',
                key: m.key,
            }
        });

    } catch (e) {
        // Reaksi "gagal" jika terjadi error
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
handler.help = ['tocjs (reply code)', 'esm2cjs (reply code)'];
handler.tags = ['tools'];
handler.command = /^(tocjs|esm2cjs|convertcjs)$/i;
handler.limit = false;

module.exports = handler;