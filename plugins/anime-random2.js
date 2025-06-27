const fetch = require('node-fetch');

const pickRandom = (list) => list[Math.floor(list.length * Math.random())];

const characterEndpoints = {
    akira: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/akira.json',
    akiyama: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/akiyama.json',
    anna: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/ana.json',
    asuna: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/asuna.json',
    ayuzawa: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/ayuzawa.json',
    boruto: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/boruto.json',
    chitanda: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/chitanda.json',
    chitoge: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/chitoge.json',
    deidara: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/deidara.json',
    doraemon: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/doraemon.json',
    elaina: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/elaina.json',
    emilia: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/emilia.json',
    erza: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/erza.json',
    genshin: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/genshin.json',
    gremory: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/gremory.json',
    hestia: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/hestia.json',
    hinata: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/hinata.json',
    inori: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/inori.json',
    isuzu: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/suzu.json',
    itachi: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/itachi.json',
    itori: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/itori.json',
    kaga: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/kaga.json',
    kagura: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/kagura.json',
    kakasih: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/kakasih.json',
    kaori: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/kaori.json',
    kaneki: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/kaneki.json',
    kosaki: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/kosaki.json',
    kotori: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/kotori.json',
    kuriyama: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/kuriyama.json',
    kuroha: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/kuroha.json',
    kurumi: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/kurumi.json',
    madara: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/madara.json',
    mikasa: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/mikasa.json',
    miku: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/miku.json',
    minato: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/minato.json',
    naruto: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/naruto.json',
    natsukawa: 'https://raw.githubusercontent.com/ketchupmaze/AssistenYulaDB/main/anime/natsukawa.json',
    nezuko: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/nezuko.json',
    nishimiya: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/nishimiya.json',
    onepiece: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/onepiece.json',
    pokemon: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/pokemon.json',
    rem: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/rem.json',
    rize: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/rize.json',
    sagiri: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/sagiri.json',
    sakura: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/sakura.json',
    sasuke: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/sasuke.json',
    shina: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/shina.json',
    shinka: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/shinka.json',
    shizuka: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/shizuka.json',
    tomori: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/tomori.json',
    toukachan: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/toukachan.json',
    tsunade: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/tsunade.json',
    yatogami: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/yatogami.json',
    yuki: 'https://raw.githubusercontent.com/XM4ZE/DATABASE/master/anime/yuki.json'
};

const handler = async (m, { conn, command }) => {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const commandName = command.toLowerCase();
    const caption = `Ketik lagi jika ingin foto lainnya`;

    try {
        const apiUrl = characterEndpoints[commandName];
        if (!apiUrl) return;

        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error(`File JSON untuk '${commandName}' tidak ditemukan.`);
        
        const jsonArray = await res.json();
        const imageUrl = pickRandom(jsonArray);

        if (!imageUrl) throw new Error('Gagal mendapatkan URL gambar dari file JSON.');

        await conn.sendFile(m.chat, imageUrl, 'image.jpg', caption, m);
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error(`Error pada command ${commandName}:`, error);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply(`Gagal mengambil gambar. Mungkin karakter ini belum tersedia atau terjadi kesalahan jaringan.`);
    }
};

handler.command = handler.help = [
    'akira', 'akiyama', 'anna', 'asuna', 'ayuzawa', 'boruto', 'chitanda', 'chitoge', 'deidara', 'doraemon',
    'elaina', 'emilia', 'erza', 'genshin', 'gremory', 'hestia', 'hinata', 'inori', 'isuzu', 'itachi',
    'itori', 'kaga', 'kagura', 'kakasih', 'kaneki', 'kaori', 'kosaki', 'kotori', 'kuriyama', 'kuroha',
    'kurumi', 'madara', 'mikasa', 'miku', 'minato', 'naruto', 'natsukawa', 'nezuko', 'nishimiya', 'onepiece',
    'pokemon', 'rem', 'rize', 'sagiri', 'sakura', 'sasuke', 'shina', 'shinka', 'shizuka', 'tomori',
    'toukachan', 'tsunade', 'yatogami', 'yuki'
];

handler.tags = ['randomnime'];
handler.premium = false;
handler.register = false;
handler.limit = false;

module.exports = handler;