const fs = require('fs');
const path = require('path');

let handler = async (m, { text }) => {
    if (!text) throw 'Masukkan nama modul yang ingin diperiksa!\n\nContoh: .moduleinfo jkt48connect-cli';

    try {
        // 1. Dapatkan path absolut ke file utama modul
        const modulePath = require.resolve(text);
        
        // 2. Dapatkan path ke folder modul
        const moduleDir = path.dirname(modulePath);
        
        // 3. Baca package.json untuk info versi dan repository
        const packageJsonPath = path.join(moduleDir, 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        
        // 4. Import modul untuk melihat fungsi yang diekspor
        const requiredModule = require(text);
        const exportedKeys = Object.keys(requiredModule);

        // 5. Format pesan balasan
        let reply = `*❖ Module Info ❖*\n\n`;
        reply += `*Nama:* ${packageJson.name}\n`;
        reply += `*Versi:* ${packageJson.version}\n`;
        reply += `*Path Utama:* ${modulePath}\n`;
        if (packageJson.repository && packageJson.repository.url) {
            reply += `*Repository:* ${packageJson.repository.url.replace('git+', '').replace('.git', '')}\n`;
        }
        reply += `\n*Fungsi yang Tersedia (Exports):*\n`;
        reply += exportedKeys.map(key => `- ${key}`).join('\n');
        
        m.reply(reply);

    } catch (e) {
        console.error(e);
        m.reply(`Modul "${text}" tidak ditemukan atau terjadi error saat membacanya.\n\nPastikan modul sudah terinstal di \`node_modules\` dan nama yang Anda masukkan benar.`);
    }
};

handler.help = ['moduleinfo <nama_modul>'];
handler.tags = ['tools'];
handler.command = /^(moduleinfo|modinfo)$/i;
handler.owner = true; // Perintah ini sebaiknya hanya untuk owner

module.exports = handler;