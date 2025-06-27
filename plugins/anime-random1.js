const fetch = require('node-fetch');

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())];
}

// Definisikan API endpoints di luar handler
const apiEndpoints = {
    neko: { url: 'https://api.waifu.pics/sfw/neko', caption: ['Nyan~ 🐾', 'Jangan lupa kasih headpat.', 'Pspspsps...', 'Catgirl for a good day!', 'Meow~'] },
    megumin: { url: 'https://api.waifu.pics/sfw/megumin', caption: ['EXPLOSION! 💥', 'Waga na wa Megumin!', 'Seni adalah ledakan!', 'Penyihir agung dari klan Crimson Demon.', 'Sehari tanpa ledakan itu hampa.'] },
    maid: { url: 'https://api.nekorinn.my.id/waifuim/maid', caption: ['Selamat datang kembali, Tuan.', 'Ada yang bisa saya bantu, Goshujin-sama?', 'Teh Anda sudah siap.', 'Siap melayani dengan sepenuh hati! ✨', 'Rumah dijamin bersih dan kinclong!'] },
    oppai: { url: 'https://api.nekorinn.my.id/waifuim/oppai', caption: ['Besar adalah keadilan!', 'Plot-nya sangat berat.', 'Ara ara~', 'Penuh dengan... kepribadian.', 'Dua argumen yang tak terbantahkan.'] },
    selfies: { url: 'https://api.nekorinn.my.id/waifuim/selfies', caption: ['Cheese! 📸', 'Feeling cute, might delete later~', 'New profile picture?', 'Jangan lupa double tap ❤️', 'Cocok buat PP, kan?'] },
    uniform: { url: 'https://api.nekorinn.my.id/waifuim/uniform', caption: ['Seifuku adalah simbol masa muda.', 'Siap-siap berangkat sekolah!', 'Masa-masa paling indah~', 'Pulang sekolah mampir dulu, yuk?', 'Manisnya gadis berseragam.'] },
    loli: { url: 'https://api.nekorinn.my.id/random/loli', caption: ['Kawaii~', 'Lindungi dan sayangi.', 'FBI? Bukan, ini gambar legal kok.', 'Onii-chan, mite mite!', 'Cuteness overload!'] },
    yandere: { url: 'https://api.nekorinn.my.id/random/yandere', caption: ['Aku akan selalu mengawasimu, Senpai.', 'Kamu cuma milikku seorang, kan?', 'Just Monika.', 'Kalau bukan milikku, tak boleh jadi milik siapapun.', 'Cintaku padamu... sedikit berlebihan.'] },
    bluearchive: { url: 'https://api.nekorinn.my.id/random/bluearchive', caption: ['Halo, Sensei!', 'Waktunya gacha!', 'Seorang murid dari Kivotos.', 'Tagihanmu menumpuk, Sensei.', 'Nn, serahkan padaku.'] },
    konachan: { url: 'https://api.nekorinn.my.id/random/konachan', caption: ['Random art from Konachan.', 'Diambil langsung dari imageboard.', 'Semoga kamu suka yang ini.', 'Dari jutaan gambar, ini yang terpilih.', 'Art style-nya bagus, ya?'] },
    waifu: { url: 'https://api.waifu.pics/sfw/waifu', caption: ["Here's your waifu!", 'Semoga sesuai seleramu.', 'Waifu for laifu.', 'Jaga dia baik-baik, ya.', 'Dia memilihmu.'] },
    shinobu: { url: 'https://api.waifu.pics/sfw/shinobu', caption: ['Moshi moshi, daijoubu desu ka?', 'Kocho Shinobu is here.', 'Insect Hashira.', 'Ara ara, sayonara~', 'Cantik tapi mematikan.'] },

};

let handler = async (m, { conn, command }) => {
    // Pastikan command ada dalam apiEndpoints
    const type = command.toLowerCase();
    const endpoint = apiEndpoints[type];

    if (!endpoint) {
        return m.reply('Perintah tidak ditemukan.');
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
        let imageUrl;

        // Cek apakah URL berasal dari nekorinn.my.id
        if (endpoint.url.includes('nekorinn.my.id')) {
            // Jika ya, URL endpoint adalah URL gambar final
            imageUrl = endpoint.url;
        } else {
            // Jika tidak, proses sebagai JSON (untuk waifu.pics, dll)
            const response = await fetch(endpoint.url);
            if (!response.ok) throw new Error(`API merespon dengan status: ${response.status}`);
            
            const json = await response.json();
            if (!json.url) throw new Error('API tidak mengembalikan URL gambar yang valid dalam format JSON.');
            imageUrl = json.url;
        }

        const caption = Array.isArray(endpoint.caption) ? pickRandom(endpoint.caption) : endpoint.caption;

        // Kirim gambar menggunakan imageUrl yang sudah didapatkan
        await conn.sendFile(m.chat, imageUrl, `${type}.jpg`, caption, m);
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error(`Error pada command ${type}:`, error);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        // Perbaiki pesan error agar lebih informatif
        m.reply(`Gagal mengambil gambar dari ${endpoint.url}. Error: ${error.message}`);
    }
};

// Perbaikan untuk handler properties
handler.help = Object.keys(apiEndpoints).map(cmd => `${cmd}`);
handler.command = Object.keys(apiEndpoints);
handler.tags = ['randomnime'];
handler.limit = false;

module.exports = handler;