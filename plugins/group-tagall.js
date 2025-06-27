let handler = async (m, { conn, text, participants }) => {
    try {
        let readmore = String.fromCharCode(8206).repeat(4001);
        let message = `乂  *E V E R Y O N E*\n\n*“${text ? text : 'Nothing'}”*\n\n${readmore}\n`;

        for (let mem of participants) {
            message += `◦  @${mem.id.split('@')[0]}\n`;
        }

        conn.sendMessage(m.chat, { text: message, mentions: participants.map(a => a.id) });
    } catch (e) {
        console.log(e);
        return conn.reply(m.chat, JSON.stringify(e), m);
    }
};

handler.help = ['tagall <pesan>'];
handler.tags = ['group'];
handler.command = /^(tagall)$/i;
handler.group = true;
handler.admin = true;

module.exports = handler;