const fetch = require('node-fetch');

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const nsfwCaptions = [
    'Here\'s the meal you ordered. 🍽️',
    'Don\'t stare too long, you might get addicted.',
    'Just for your eyes... and maybe something else. 😉',
    'I know you needed this. Don\'t lie.',
    'Use this wisely... or don\'t. I\'m not your mom.',
    'Is this what you were craving? 🥵',
    'Careful, it\'s extremely hot.',
    'You weren\'t supposed to see this... oops.',
    'A little secret between us, okay? 🤫',
    'Caught you looking! What are you gonna do now?',
    'Think you can handle this? Prove it.',
    'Just a little peek for my favorite user.',
    'Feast your eyes. You\'re welcome.',
    'Your daily dose of degeneracy, served fresh.',
    'This should keep you busy for a while. 😈',
    'Another one for the "homework" folder, I see.',
    'I hope you have a good... reason for this. 💦',
    'Don\'t make a mess now.',
    'Fulfilling your deepest desires... one request at a time.',
    'Speechless? I thought so. 🤤',
    'A gift from heaven... or maybe hell.',
    'Handle with care... or not. Your choice.',
    'Satisfied yet?',
];


const nsfwEndpoints = {
    // --- Fantox-APIs (Tipe JSON) ---
    swimsuit: { type: 'json', path: 'swimsuit' },
    schoolswimsuit: { type: 'json', path: 'schoolswimsuit' },
    white: { type: 'json', path: 'white' },
    barefoot: { type: 'json', path: 'barefoot' },
    touhou: { type: 'json', path: 'touhou' },
    gamecg: { type: 'json', path: 'gamecg' },
    hololive: { type: 'json', path: 'hololive' },
    uncensored: { type: 'json', path: 'uncensored' },
    sunglasses: { type: 'json', path: 'sunglasses' },
    nsfwglasses: { type: 'json', path: 'glasses' },
    weapon: { type: 'json', path: 'weapon' },
    shirtlift: { type: 'json', path: 'shirtlift' },
    chain: { type: 'json', path: 'chain' },
    fingering: { type: 'json', path: 'fingering' },
    flatchest: { type: 'json', path: 'flatchest' },
    torncloth: { type: 'json', path: 'torncloth' },
    bondage: { type: 'json', path: 'bondage' },
    demon: { type: 'json', path: 'demon' },
    wet: { type: 'json', path: 'wet' },
    pantypull: { type: 'json', path: 'pantypull' },
    headdress: { type: 'json', path: 'headdress' },
    headphone: { type: 'json', path: 'headphone' },
    tie: { type: 'json', path: 'tie' },
    anusview: { type: 'json', path: 'anusview' },
    shorts: { type: 'json', path: 'shorts' },
    stokings: { type: 'json', path: 'stokings' },
    topless: { type: 'json', path: 'topless' },
    beach: { type: 'json', path: 'beach' },
    bunnygirl: { type: 'json', path: 'bunnygirl' },
    bunnyear: { type: 'json', path: 'bunnyear' },
    idol: { type: 'json', path: 'idol' },
    vampire: { type: 'json', path: 'vampire' },
    gun: { type: 'json', path: 'gun' },
    nsfwmaid: { type: 'json', path: 'maid' },
    bra: { type: 'json', path: 'bra' },
    nobra: { type: 'json', path: 'nobra' },
    bikini: { type: 'json', path: 'bikini' },
    whitehair: { type: 'json', path: 'whitehair' },
    blonde: { type: 'json', path: 'blonde' },
    pinkhair: { type: 'json', path: 'pinkhair' },
    bed: { type: 'json', path: 'bed' },
    ponytail: { type: 'json', path: 'ponytail' },
    dress: { type: 'json', path: 'dress' },
    underwear: { type: 'json', path: 'underwear' },
    foxgirl: { type: 'json', path: 'foxgirl' },
    nsfwuniform: { type: 'json', path: 'uniform' },
    skirt: { type: 'json', path: 'skirt' },
    sex: { type: 'json', path: 'sex' },
    sex2: { type: 'json', path: 'sex2' },
    sex3: { type: 'json', path: 'sex3' },
    breast: { type: 'json', path: 'breast' },
    twintail: { type: 'json', path: 'twintail' },
    spreadpussy: { type: 'json', path: 'spreadpussy' },
    tears: { type: 'json', path: 'tears' },
    seethrough: { type: 'json', path: 'seethrough' },
    breasthold: { type: 'json', path: 'breasthold' },
    drunk: { type: 'json', path: 'drunk' },
    fateseries: { type: 'json', path: 'fateseries' },
    spreadlegs: { type: 'json', path: 'spreadlegs' },
    openshirt: { type: 'json', path: 'openshirt' },
    headband: { type: 'json', path: 'headband' },
    food: { type: 'json', path: 'food' },
    close: { type: 'json', path: 'close' },
    tree: { type: 'json', path: 'tree' },
    nipples: { type: 'json', path: 'nipples' },
    erectnipples: { type: 'json', path: 'erectnipples' },
    horns: { type: 'json', path: 'horns' },
    greenhair: { type: 'json', path: 'greenhair' },
    wolfgirl: { type: 'json', path: 'wolfgirl' },
    nsfwcatgirl: { type: 'json', path: 'catgirl' },

    // --- BetaBotz API (Tipe Direct) ---
    hentai: { type: 'direct', path: 'hentai' },
    gifs: { type: 'direct', path: 'gifs' },
    jahy: { type: 'direct', path: 'jahy' },
    manga: { type: 'direct', path: 'manga' },
    nsfwneko: { type: 'direct', path: 'neko' },
    neko2: { type: 'direct', path: 'neko2' },
    orgy: { type: 'direct', path: 'orgy' },
    panties: { type: 'direct', path: 'panties' },
    tentacles: { type: 'direct', path: 'tentacles' },
    yuri: { type: 'direct', path: 'yuri' },
    zettai: { type: 'direct', path: 'zettai' }
};

// Handler utama
const handler = async (m, { conn, command }) => {
    const config = nsfwEndpoints[command.toLowerCase()];
    if (!config) return;

    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });

    try {
        let imageUrl;

        if (config.type === 'json') {
            const res = await fetch(`https://fantox-apis.vercel.app/${config.path}`);
            if (!res.ok) throw new Error(`API Fantox responded with status ${res.status}`);
            const json = await res.json();
            if (!json.url) throw new Error('Invalid API response from Fantox (missing "url" property).');
            imageUrl = json.url;

        } else if (config.type === 'direct') {
            if (typeof lann === 'undefined' || !lann) throw new Error("API Key 'lann' is not configured globally.");
            imageUrl = `https://api.betabotz.eu.org/api/nsfw/${config.path}?apikey=${lann}`;
        }

        if (!imageUrl) throw new Error("Failed to get the image URL.");

        const randomCaption = pickRandom(nsfwCaptions);
        const finalCaption = `${randomCaption}\n\n> _Request: .${command}_`;

        await conn.sendFile(m.chat, imageUrl, 'nsfw.jpg', finalCaption, m);
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error(`Error on command ${command}:`, error);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply(`🚩 Failed to load image. \n_Reason: ${error.message}_`);
    }
};

handler.help = Object.keys(nsfwEndpoints);
handler.command = Object.keys(nsfwEndpoints);
handler.tags = ['nsfwnime'];
handler.premium = true;
handler.nsfw = true;
handler.group = false;
handler.limit = false;

module.exports = handler;