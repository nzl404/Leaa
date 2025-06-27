// --- Menggunakan '@adiwajshing/baileys' ---
const {
    generateWAMessage,
    STORIES_JID,
    generateWAMessageFromContent
} = require('@adiwajshing/baileys');

// Helper functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getMimeTypeFromBuffer(buffer) {
    if (buffer.length < 4) return null;
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return 'image/jpeg';
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return 'image/png';
    if (buffer.subarray(4, 8).toString('ascii') === 'ftyp') return 'video/mp4';
    if (buffer.subarray(0, 3).toString('ascii') === 'ID3') return 'audio/mpeg';
    return null;
}

function itemStages(itemArray, stageSize = 5) {
    const hasil = [];
    for (let index = 0; index < itemArray.length; index += stageSize) {
        const stage = itemArray.slice(index, index + stageSize);
        hasil.push(stage);
    }
    return hasil;
}

// --- FUNGSI INTI: Diterjemahkan langsung dari contoh yang Anda berikan ---
const sendStatusMention = async (conn, content, groupData, statusJidList) => {
    let success = 0;
    let failed = 0;
    let index = 0;

    if (!content.image && !content.video && !content.audio && !content.text) {
        throw new Error("Konten media atau teks tidak boleh kosong.");
    }

    // Generate pesan story utama sekali saja
    const media = await generateWAMessage(STORIES_JID, content, {
        upload: conn.waUploadToServer,
    });
    
    // Memecah daftar grup menjadi beberapa bagian (batch)
    const groupStages = itemStages(groupData);

    for (const groupChunk of groupStages) {
        // 'additionalNodes' dibuat untuk setiap batch grup
        const additionalNodes = [{
            tag: "meta",
            attrs: {},
            content: [{
                tag: "mentioned_users",
                attrs: {},
                content: groupChunk.map((jid) => ({
                    tag: "to",
                    attrs: { jid },
                    content: undefined,
                })),
            }],
        }];

        // Loop untuk mengirim "poke" ke setiap grup dalam batch
        for (const jid of groupChunk) {
            try {
                // Menggunakan 'statusMentionMessage' seperti di contoh, meskipun targetnya grup
                const msg = await generateWAMessageFromContent(jid, {
                    statusMentionMessage: {
                        message: {
                            protocolMessage: {
                                key: media.key,
                                type: 25,
                            },
                        },
                    },
                }, {});
                
                await conn.relayMessage(jid, msg.message, {
                    additionalNodes: [{
                        tag: "meta",
                        attrs: { is_status_mention: "true" },
                        content: undefined,
                    }],
                });
                success++;
            } catch (error) {
                console.error(`Gagal mengirim poke ke ${jid}`, error);
                failed++;
            }

            index++;
            const delay = (index % 10 === 0) ? 20000 : 2000; // Jeda
            await sleep(delay);
        }

        // Mempublikasikan story utama dengan me-relay pesan 'media'
        // Ini dilakukan setelah setiap batch poke, sesuai alur logika di contoh Anda
        await conn.relayMessage(STORIES_JID, media.message, {
            messageId: media.key.id,
            statusJidList, // Daftar lengkap semua partisipan
            additionalNodes, // Node untuk batch grup saat ini
        });
        
        await sleep(5000); // Jeda antar batch
    }

    return { success, failed };
};


// --- Handler Utama ---
let handler = async (m, { conn, text }) => {
    try {
        if (!text) return m.reply('Format salah.\nContoh: `.upswtag --all Halo semua`');
        
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        // Menggunakan metode 'conn.chats' yang paling stabil untuk Anda
        const groups = Object.values(conn.chats)
            .filter(chat => chat.id.endsWith('@g.us') && chat.metadata)
            .map(chat => chat.metadata);
            
        if (groups.length === 0) {
            return m.reply("Bot tidak terdeteksi berada di grup manapun.");
        }

        const isAll = text.trim().startsWith("--all");
        if (!isAll) {
            return m.reply("Perintah ini hanya mendukung mode `--all`.");
        }

        // Mengambil semua ID grup dan semua partisipan
        const groupData = groups.map(g => g.id);
        const statusJidList = [...new Set(groups.flatMap(g => g.participants.map(p => p.id)))];
        const reps = text.trim().substring(5).trim();

        if (statusJidList.length === 0) {
            return m.reply('Gagal mengumpulkan daftar partisipan.');
        }
        if (!reps && !m.quoted) return m.reply('Tidak ada teks atau media untuk dijadikan story.');
        
        let content = {};
        if (m.quoted && (m.quoted.mtype === 'imageMessage' || m.quoted.mtype === 'videoMessage' || m.quoted.mtype === 'audioMessage')) {
            let media = await m.quoted.download();
            if (!media) return m.reply('Media gagal diunduh.');
            const mime = getMimeTypeFromBuffer(media);
            if (!mime) return m.reply('Tipe media tidak didukung.');
            if (/image/.test(mime)) content.image = media;
            else if (/video/.test(mime)) content.video = media;
            else if (/audio/.test(mime)) { content.audio = media; content.ptt = true; }
            content.caption = reps;
        } else {
            content.text = reps;
        }
        
        const { success, failed } = await sendStatusMention(conn, content, groupData, statusJidList);

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        await conn.reply(m.chat, `*Laporan Publikasi Story --all:*\n\n` +
            `- Total User Ditargetkan: ${statusJidList.length}\n` +
            `- Dari Total Grup: ${groupData.length}\n\n` +
            `*Notifikasi Terkirim ke:* ${success} grup\n` +
            (failed > 0 ? `*Gagal Terkirim ke:* ${failed} grup` : ''), m);

    } catch (error) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        console.error(error);
        const fullError = error.stack || error.toString();
        await m.reply(`*Terjadi Error Kritis!* 🐞\n\n\`\`\`${fullError}\`\`\``);
    }
};

handler.help = ["upswtag --all [teks]"];
handler.tags = ["owner"];
handler.command = ["upswtag"];
handler.owner = true;

module.exports = handler;