let handler = async (m, { conn, args, participants }) => {
  let users = Object.entries(global.db.data.users).map(([key, value]) => {
    return { ...value, jid: key };
  })

  let sortedExp = users.map(toNumber('exp')).sort(sort('exp'))
  let sortedLim = users.map(toNumber('limit')).sort(sort('limit'))
  let sortedLevel = users.map(toNumber('level')).sort(sort('level'))
  let sortedMoney = users.map(toNumber('money')).sort(sort('money'))
  let sortedDiamond = users.map(toNumber('diamond')).sort(sort('diamond'))
  let sortedBank = users.map(toNumber('bank')).sort(sort('bank'))
  
  let userJid = m.sender || m.mentionedJid?.[0] || ''
  
  let usersExp = sortedExp.map(enumGetKey)
  let usersLim = sortedLim.map(enumGetKey)
  let usersLevel = sortedLevel.map(enumGetKey)
  let usersMoney = sortedMoney.map(enumGetKey)
  let usersDiamond = sortedDiamond.map(enumGetKey)
  let usersBank = sortedBank.map(enumGetKey)
  
  let expPosition = usersExp.indexOf(userJid) + 1 || 0
  let limPosition = usersLim.indexOf(userJid) + 1 || 0
  let levelPosition = usersLevel.indexOf(userJid) + 1 || 0
  let moneyPosition = usersMoney.indexOf(userJid) + 1 || 0
  let diamondPosition = usersDiamond.indexOf(userJid) + 1 || 0
  let bankPosition = usersBank.indexOf(userJid) + 1 || 0
  
  let len = 10;
  if (args[0] && !isNaN(parseInt(args[0]))) {
      len = parseInt(args[0]);
  }
  len = Math.min(len, sortedExp.length);

  // --- FUNGSI FORMAT DIPERBARUI DENGAN LOGIKA CERDAS ---
  const formatLeaderboard = (data, propertyName, propertyUnit) => {
    // Regex untuk mendeteksi string yang hanya berisi angka, spasi, +, -
    const phoneRegex = /^[\s\d+-]+$/;
    
    return data.slice(0, len).map(({ jid, name, [propertyName]: value }, i) => {
        const rank = i + 1;
        
        // Cek apakah 'name' ada dan BUKAN hanya nomor telepon.
        // Jika salah satu kondisi tidak terpenuhi, tampilkan 'Unnamed'.
        const userDisplay = (name && !phoneRegex.test(name)) ? name.trim() : 'Unnamed';
            
        return `${rank}. ${userDisplay} *${value.toLocaleString()} ${propertyUnit}*`;
    }).join('\n');
  };

  let text = `
• *XP Leaderboard Top ${len}* •
Kamu: *${expPosition}* dari *${usersExp.length}*

${formatLeaderboard(sortedExp, 'exp', 'Exp')}

• *Limit Leaderboard Top ${len}* •
Kamu: *${limPosition}* dari *${usersLim.length}*

${formatLeaderboard(sortedLim, 'limit', 'Limit')}

• *Level Leaderboard Top ${len}* •
Kamu: *${levelPosition}* dari *${usersLevel.length}*

${formatLeaderboard(sortedLevel, 'level', 'Level')}

• *Money Leaderboard Top ${len}* •
Kamu: *${moneyPosition}* dari *${usersMoney.length}*

${formatLeaderboard(sortedMoney, 'money', 'Money')}

• *Diamond Leaderboard Top ${len}* •
Kamu: *${diamondPosition}* dari *${usersDiamond.length}*

${formatLeaderboard(sortedDiamond, 'diamond', 'Diamond')}

• *Bank Leaderboard Top ${len}* •
Kamu: *${bankPosition}* dari *${usersBank.length}*

${formatLeaderboard(sortedBank, 'bank', 'Bank')}
`.trim()

  conn.reply(m.chat, text, m)
}

handler.help = ['leaderboard <jumlah user>']
handler.tags = ['info']
handler.command = /^(leaderboard|lb)$/i
handler.group = true
handler.rpg = true

module.exports = handler

function sort(property) {
  return (a, b) => b[property] - a[property];
}

function toNumber(property, _default = 0) {
  if (property) return (a, i, b) => {
    return {...b[i], [property]: a[property] === undefined ? _default : a[property]}
  }
  else return a => a === undefined ? _default : a
}

function enumGetKey(a) {
  return a.jid
}