let handler = async (m, { conn, text, isOwner, usedPrefix, command }) => {
  if (isOwner) {
    conn.sendFile(m.chat, './vn/claraaa.mp3', "lah.mp3", null, m, true, {
      type: "audioMessage",
      ptt: true,
    });
  } else {
    conn.sendFile(m.chat, './vn/claraaaa.mp3', "lah.mp3", null, m, true, {
      type: "audioMessage",
      ptt: true,
    });
  }
}
handler.customPrefix = /^(sayang|ayang|ay)$/i;
handler.command = new RegExp();

module.exports = handler;