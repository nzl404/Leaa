// Total Spam terdeteksi sebelum ban
const SPAM_TOTALSPAM = 5;
// Waktu untuk mereset counter spam (dalam milidetik)
const SPAM_RESET_TIME = 30000; // 30 detik
// Delay maksimal antar pesan yang dianggap spam (dalam milidetik)
const MAX_MESSAGE_DELAY = 2000; // 2 detik

// Durasi ban untuk spam di chat pribadi (1 menit)
const USER_BAN_DURATION = 60000; 
// Durasi ban dan penutupan grup karena spam (1 menit 30 detik)
const GROUP_BAN_DURATION = 90000;

exports.before = async function (m) {
    if (!this.spam) this.spam = {}
    if (!this.groupStatus) this.groupStatus = {}
    
    // Pastikan fitur anti-spam diaktifkan secara global
    if (!global.spam) return;
    
    let user = db.data.users[m.sender];
    let chat = db.data.chats[m.chat];
    
    // Pengecekan owner dan pesan dari bot sendiri
    let isOwner = m.sender.split('@')[0] === global.owner[0];
    let isSelf = m.fromMe;
    
    // Abaikan broadcast, pesan dari bot sendiri, dan jika chat tidak diban
    if ((m.chat.endsWith('broadcast') || m.fromMe) && !m.message && !chat.isBanned) return;
    
    // Hanya proses pesan yang kemungkinan adalah perintah
    if (!m.text.startsWith('.') && !m.text.startsWith('#') && !m.text.startsWith('!') && !m.text.startsWith('/') && !m.text.startsWith('\\')) return;
    
    // Abaikan jika pengirim adalah owner atau bot itu sendiri
    if (isOwner || isSelf) return;
    
    var now = new Date() * 1;
    
    // Proses unban otomatis jika waktu ban sudah selesai
    if (user.banned && now >= user.lastBanned) {
        user.banned = false;
        this.sendMessage(m.chat, {
            text: `@${m.sender.split('@')[0]} telah di-unban dari sistem anti-spam.`,
            mentions: [m.sender]
        });
    }

    // Jika user masih dalam status banned, abaikan pesan
    if (user.banned) return;
    
    const processSpam = async () => {
        if (!this.spam[m.sender] || !global.spam) return;
        
        if (this.spam[m.sender].count >= SPAM_TOTALSPAM) {
            user.banned = true;
            
            // Logika untuk spam di grup
            if (m.isGroup) {
                try {
                    // Jika fitur gcspam (penutupan grup) aktif
                    if (global.gcspam) {
                        const groupId = m.chat;
                        if (!this.groupStatus[groupId]) {
                            this.groupStatus[groupId] = {
                                isClosing: false,
                                originalName: (await this.groupMetadata(groupId)).subject
                            };
                        }
                        
                        if (!this.groupStatus[groupId].isClosing) {
                            this.groupStatus[groupId].isClosing = true;
                            
                            await this.groupSettingUpdate(groupId, 'announcement');
                            await this.groupUpdateSubject(groupId, `${this.groupStatus[groupId].originalName} (SPAM)`);
                            
                            await this.sendMessage(groupId, { 
                                text: `🚫 SPAM TERDETEKSI!\n\nPengguna @${m.sender.split('@')[0]} telah mengirim ${SPAM_TOTALSPAM} pesan beruntun.\nPelaku spam diban dan grup ditutup sementara selama 1 menit 30 detik.`,
                                mentions: [m.sender]
                            });
                            
                            user.lastBanned = now + GROUP_BAN_DURATION;
                            
                            // Buka kembali grup setelah durasi ban selesai
                            setTimeout(async () => {
                                try {
                                    user.banned = false;
                                    await this.groupSettingUpdate(groupId, 'not_announcement');
                                    await this.groupUpdateSubject(groupId, this.groupStatus[groupId].originalName);
                                    await this.sendMessage(groupId, {
                                        text: `✅ Grup telah dibuka kembali.\n@${m.sender.split('@')[0]} telah di-unban.`,
                                        mentions: [m.sender]
                                    });
                                    this.groupStatus[groupId].isClosing = false;
                                } catch (error) {
                                    console.error('Error saat membuka kembali grup:', error);
                                }
                            }, GROUP_BAN_DURATION);
                        }
                    } else { // Jika fitur gcspam tidak aktif, hanya ban user
                        await this.sendMessage(m.chat, { 
                            text: `🚫 SPAM TERDETEKSI!\n\nPengguna @${m.sender.split('@')[0]} telah mengirim ${SPAM_TOTALSPAM} pesan beruntun.\nPelaku spam diban sementara selama 1 menit 30 detik.`,
                            mentions: [m.sender]
                        });
                        
                        user.lastBanned = now + GROUP_BAN_DURATION;

                        setTimeout(async () => {
                            user.banned = false;
                            await this.sendMessage(m.chat, {
                                text: `✅ @${m.sender.split('@')[0]} telah di-unban.`,
                                mentions: [m.sender]
                            });
                        }, GROUP_BAN_DURATION);
                    }
                } catch (error) {
                    console.error('Error dalam manajemen grup:', error);
                }
            } else { // Logika untuk spam di chat pribadi
                await this.sendMessage(m.chat, {
                    text: `🚫 Spam terdeteksi! @${m.sender.split('@')[0]} telah mengirim ${SPAM_TOTALSPAM} pesan beruntun.\nAnda diban selama 1 menit.`,
                    mentions: [m.sender]
                });
                
                user.lastBanned = now + USER_BAN_DURATION;
                
                setTimeout(async () => {
                    user.banned = false;
                    await this.sendMessage(m.chat, {
                        text: `✅ @${m.sender.split('@')[0]} telah di-unban.`,
                        mentions: [m.sender]
                    });
                }, USER_BAN_DURATION);
            }
            
            delete this.spam[m.sender]; 
        }
    };
    
    const currentTime = m.messageTimestamp.toNumber();
    
    if (m.sender in this.spam) {
        const timeSinceLastSpam = currentTime - this.spam[m.sender].lastspam;
        
        if (timeSinceLastSpam <= MAX_MESSAGE_DELAY) {
            this.spam[m.sender].count++;
            this.spam[m.sender].lastspam = currentTime;
            
            await processSpam();
        } else {
            // Reset jika jeda antar pesan terlalu lama
            this.spam[m.sender] = {
                jid: m.sender,
                count: 1,
                lastspam: currentTime
            };
        }
        
        // Timeout untuk menghapus data spam user jika sudah tidak aktif
        setTimeout(() => {
            if (this.spam[m.sender] && (new Date() * 1) - this.spam[m.sender].lastspam >= SPAM_RESET_TIME) {
                delete this.spam[m.sender];
            }
        }, SPAM_RESET_TIME);
    } else {
        // Inisialisasi data spam untuk user baru
        this.spam[m.sender] = {
            jid: m.sender,
            count: 1,
            lastspam: currentTime
        };
        
        // Timeout untuk menghapus data spam user jika sudah tidak aktif
        setTimeout(() => {
            if (this.spam[m.sender] && (new Date() * 1) - this.spam[m.sender].lastspam >= SPAM_RESET_TIME) {
                delete this.spam[m.sender];
            }
        }, SPAM_RESET_TIME);
    }
};