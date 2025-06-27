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

const apiEndpoints = {
  // --- API dari Nekorinn (Tipe 1) ---
  anal: { api: 'nekorinn', path: 'anal' },
  ass: { api: 'nekorinn', path: 'ass' },
  bdsm: { api: 'nekorinn', path: 'bdsm' },
  black: { api: 'nekorinn', path: 'black' },
  boobs: { api: 'nekorinn', path: 'boobs' },
  bottomless: { api: 'nekorinn', path: 'bottomless' },
  collared: { api: 'nekorinn', path: 'collared' },
  cum: { api: 'nekorinn', path: 'cum' },
  cumsluts: { api: 'nekorinn', path: 'cumsluts' },
  dick: { api: 'nekorinn', path: 'dick' },
  dom: { api: 'nekorinn', path: 'dom' },
  dp: { api: 'nekorinn', path: 'dp' },
  easter: { api: 'nekorinn', path: 'easter' },
  extreme: { api: 'nekorinn', path: 'extreme' },
  feet: { api: 'nekorinn', path: 'feet' },
  finger: { api: 'nekorinn', path: 'finger' },
  fuck: { api: 'nekorinn', path: 'fuck' },
  futa: { api: 'nekorinn', path: 'futa' },
  gay: { api: 'nekorinn', path: 'gay' },
  group: { api: 'nekorinn', path: 'group' },
  kiss: { api: 'nekorinn', path: 'kiss' },
  lick: { api: 'nekorinn', path: 'lick' },
  pegged: { api: 'nekorinn', path: 'pegged' },
  puffies: { api: 'nekorinn', path: 'puffies' },
  pussy: { api: 'nekorinn', path: 'pussy' },
  real: { api: 'nekorinn', path: 'real' },
  sixtynine: { api: 'nekorinn', path: 'sixtynine' },
  suck: { api: 'nekorinn', path: 'suck' },
  tattoo: { api: 'nekorinn', path: 'tattoo' },
  tiny: { api: 'nekorinn', path: 'tiny' },
  xmas: { api: 'nekorinn', path: 'xmas' },

  // --- API dari Betabotz (Tipe 2) ---
  ahegao: { api: 'betabotz', path: 'ahegao' },
  blowjob: { api: 'betabotz', path: 'blowjob' },
  cuckold: { api: 'betabotz', path: 'cuckold' },
  ero: { api: 'betabotz', path: 'ero' },
  femdom: { api: 'betabotz', path: 'femdom' },
  foot: { api: 'betabotz', path: 'foot' },
  gangbang: { api: 'betabotz', path: 'gangbang' },
  betaglasses: { api: 'betabotz', path: 'glasses' },
  thighs: { api: 'betabotz', path: 'thighs' },
  masturbation: { api: 'betabotz', path: 'masturbation' },
};

// Handler utama
let handler = async (m, { conn, command }) => {
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

  const endpoint = apiEndpoints[command.toLowerCase()];

  if (!endpoint) {
    return m.reply('Invalid NSFW command.');
  }

  try {
    let imageUrl;

    if (endpoint.api === 'nekorinn') {
      imageUrl = `https://api.nekorinn.my.id/nsfwhub/${endpoint.path}`;

    } else if (endpoint.api === 'betabotz') {
      if (typeof lann === 'undefined' || !lann) {
        throw new Error("API key 'lann' is not defined. Please check your global bot configuration.");
      }
      const apiUrl = `https://api.betabotz.eu.org/api/nsfw/${endpoint.path}?apikey=${lann}`;
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`Betabotz API responded with status: ${response.status}`);
      
      const json = await response.json();
      imageUrl = json.url || json.result?.url || json.result; 
      if (!imageUrl) throw new Error('Invalid JSON response format from Betabotz API.');
    }

    if (!imageUrl) {
      throw new Error('Failed to get the image URL.');
    }
    
    // Membuat caption yang bervariasi dan menyertakan nama command
    const randomCaption = pickRandom(nsfwCaptions);
    const finalCaption = `${randomCaption}\n\n> _Request: .${command}_`;
    
    await conn.sendFile(m.chat, imageUrl, `${command}.jpg`, finalCaption, m);
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (error) {
    console.error(`Error on command ${command}:`, error);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    m.reply(`Failed to load image. \n_Reason: ${error.message}_`);
  }
};

handler.command = handler.help = Object.keys(apiEndpoints);

handler.tags = ['nsfw'];
handler.limit = false;
handler.premium = true;
handler.nsfw = true;
handler.group = false;

module.exports = handler;