const fetch = require('node-fetch');

var handler = async (m, { conn, text }) => {
    if (!text) throw `*_Masukan Judul Anime Yang Ingin Kamu Cari !_*`;
    conn.reply(m.chat, 'Sedang mencari ANIME... Silahkan tunggu', m);
    
    try {
        let res = await fetch('https://api.jikan.moe/v4/anime?q=' + text);
        if (!res.ok) throw 'Tidak Ditemukan';
        let json = await res.json();
        
        // Cek apakah ada data
        if (!json.data || json.data.length === 0) throw 'Anime tidak ditemukan!';
        
        let { episodes, url, type, score, rating, scored_by, popularity, rank, season, year, members, background, status, duration, synopsis, favorites } = json.data[0];
        
        let producers = json.data[0].producers.map(prod => `${prod.name} (${prod.url})`).join('\n');
        let studio = json.data[0].studios.map(stud => `${stud.name} (${stud.url})`).join('\n');
        let genre = json.data[0].genres.map(xnuvers007 => `${xnuvers007.name}`).join('\n');
        let judul = json.data[0].titles.map(jud => `${jud.title} [${jud.type}]`).join('\n');
        let trailerUrl = json.data[0].trailer.url || 'Tidak tersedia';

        let animeingfo = `📺 ᴛɪᴛʟᴇ: ${judul}
📺 Trailer: ${trailerUrl}
🎬 ᴇᴘɪsᴏᴅᴇs: ${episodes}
✉️ ᴛʀᴀɴsᴍɪsɪ: ${type}
👺 Genre: ${genre}
🗂 sᴛᴀᴛᴜs: ${status}
⌛ ᴅᴜʀᴀᴛɪᴏɴ: ${duration}
🌟 ғᴀᴠᴏʀɪᴛᴇ: ${favorites}
🧮 sᴄᴏʀᴇ: ${score}
😍 RATING: ${rating}
😎 SCORED BY: ${scored_by}
💥 POPULARITY: ${popularity}
⭐ RANK: ${rank}
✨ SEASON / MUSIM: ${season}
🏁 YEAR / TAHUN (RILIS): ${year} 
🤗 PRODUSER: ${producers}
🤠 STUDIO: ${studio}
👥 ᴍᴇᴍʙᴇʀs: ${members}
⛓️ ᴜʀʟ: ${url}
📝 ʙᴀᴄᴋɢʀᴏᴜɴᴅ: ${background || 'Tidak ada'}
💬 sɪɴᴏᴘsɪs: ${synopsis}`;

        // Menggunakan simbol unicode sebagai pengganti htki dan htka
        const border = '━━━━━━━━━━━━━━━━━━━━━';
        
        conn.sendFile(m.chat, json.data[0].images.jpg.image_url, 'animek.jpg', `${border}\n   ANIME INFO\n${border}\n\n${animeingfo}`, m);
        
    } catch (e) {
        console.log(e);
        throw 'Terjadi error saat mencari anime!';
    }
};

handler.help = ['animeinfo <anime>'];
handler.tags = ['anime'];
handler.command = /^(animeinfo|infoanime|nimeinfo)$/i;

module.exports = handler;