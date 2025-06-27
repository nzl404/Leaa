module.exports = {
  help: ["genshinstalk"].map((a) => a + " *[uuid profile]*"),
  limit: true,
  tags: ["anime"],
  command: ["genshinstalk", "gistalk"],
  code: async (
    m,
    {
      conn,
      usedPrefix,
      command,
      text,
      isOwner,
      isAdmin,
      isBotAdmin,
      isPrems,
      chatUpdate,
    },
  ) => {
    if (!text) {
      return m.reply(`*• Example :* ${usedPrefix + command} 830980536`);
    }
    m.reply(wait);
    try {
      let res = await fetch(`https://enka.network/api/uid/${text}`, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
        },
      });
      let data = await res.json();
      let playerInfo = data.data;

      if (res.ok) {
        let nickname = data.playerInfo.nickname || "Not found";
        let arLevel = data.playerInfo.level || "Not found";
        let signature = data.playerInfo.signature || "Not found";
        let worldLevel = data.playerInfo.worldLevel || "Not found";
        let achievement = data.playerInfo.finishAchievementNum || "Not found";
        let spiralFloorIndex = data.playerInfo.towerFloorIndex || "Not found";
        let spiralLeverIndex = data.playerInfo.towerLevelIndex || "Not found";

        let ssurl = `https://enka.network/u/${text}`;
        let screenshot = `https://api.mightyshare.io/v1/19EIFDUEL496RA3F/jpg?url=${ssurl}`;
        let profileMessage = `┌─⭓「Nickname: ${nickname} - AR ${arLevel}」
│ Signature: ${signature}
│ World Level: ${worldLevel}
│ Achievement: ${achievement}
│
│ *Challenge*
│ Spiral Abbys: ${spiralFloorIndex} - ${spiralLeverIndex}
│ More Details At:
└───────────────⭓
    ❀ https://enka.network/u/${text}
    ✧ UID: ${text}
    `.trim();

        await conn.sendFile(
          m.chat,
          screenshot.result,
          "screenshot.jpg",
          profileMessage,
          m,
        );
      } else {
        if (res.status === 400) {
          m.reply("Format UID salah. Mohon masukkan UID yang valid.");
        } else if (res.status === 404) {
          m.reply(
            "Pemain tidak ditemukan. Periksa kembali UID atau nama pemain.",
          );
        } else if (res.status === 424) {
          m.reply(
            "Server sedang dalam pemeliharaan atau mengalami masalah setelah pembaruan game. Silakan coba lagi nanti.",
          );
        } else if (res.status === 429) {
          m.reply(
            "Anda telah mencapai batas permintaan. Mohon tunggu sebentar sebelum membuat permintaan lain.",
          );
        } else if (res.status === 500) {
          m.reply("Terjadi kesalahan pada server. Silakan coba lagi nanti.");
        } else if (res.status === 503) {
          m.reply(
            "Terjadi kesalahan besar dalam aplikasi. Kami akan segera memperbaikinya.",
          );
        } else {
          m.reply(
            "Terjadi kesalahan saat memuat data. Silakan coba lagi nanti.",
          );
        }
      }
    } catch (e) {
      throw e;
    }
  },
};