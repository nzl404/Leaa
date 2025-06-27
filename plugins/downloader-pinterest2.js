const fetch = require('node-fetch');
const { generateWAMessageContent, generateWAMessageFromContent, proto } = require('@adiwajshing/baileys');

let handler = async (m, { usedPrefix, command, conn, args }) => {
  // Input validation
  if (!args[0]) throw `*🚩 Example:* ${usedPrefix}${command} Marsha JKT48`;
  
  // Loading reaction
  await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });
  
  try {
    const searchQuery = args.join(' ');
    
    // Initialize global cache if not exists
    global.pinterestCache ??= new Map();
    const commandCache = global.pinterestCache.get(searchQuery) || [];
    
    // Search queries variation
    const queries = [
      searchQuery,
      `${searchQuery} aesthetic`,
      `${searchQuery} wallpaper`,
      `${searchQuery} photo`,
      `${searchQuery} portrait`
    ];
    
    let allResults = [];
    
    // Try different queries until we get results
    for (const query of queries) {
      const results = await pinterest(query, 15);
      if (results.length > 0) {
        allResults = results;
        break;
      }
    }
    
    // Filter duplicates and valid images
    allResults = allResults.filter(item => 
      item.images_url && 
      !commandCache.includes(item.images_url)
    );
    
    if (allResults.length === 0) {
      throw new Error("No images found. Please try again.");
    }
    
    // Update cache
    const newUrls = allResults.map(result => result.images_url);
    const updatedCache = [...commandCache, ...newUrls].slice(-30);
    global.pinterestCache.set(searchQuery, updatedCache);

    // Prepare carousel cards
    let push = [];
    
    // Create image message function
    async function createImage(url) {
      const { imageMessage } = await generateWAMessageContent({
        image: { url }
      }, {
        upload: conn.waUploadToServer
      });
      return imageMessage;
    }

    // Create carousel cards for each result
    for (let result of allResults.slice(0, 10)) {
      push.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({
          text: `📌 ${result.title}\n🔗 ${result.pin}\n📅 ${result.created_at}`
        }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({
          text: global.footer
        }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title: '',
          hasMediaAttachment: true,
          imageMessage: await createImage(result.images_url)
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          buttons: [
            {
              name: "cta_url",
              buttonParamsJson: `{"display_text":"View Image","cta_type":"1","url":"${result.images_url}"}`
            }
          ]
        })
      });
    }

    // Generate and send carousel message
    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({
              text: `Total results: ${push.length}`
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: `Search Results for: ${searchQuery}`
            }),
            header: proto.Message.InteractiveMessage.Header.create({
              hasMediaAttachment: false
            }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
              cards: push
            })
          })
        }
      }
    }, { quoted: m });

    await conn.relayMessage(m.chat, msg.message, {
      messageId: msg.key.id
    });

  } catch (error) {
    console.error('Pinterest Handler Error:', error);
    await conn.reply(m.chat, `❌ ${error.message || 'Failed to search for images'}`, m);
  }
};

// Pinterest fetch function with timeout and better error handling
async function pinterest(query, limit = 15) {
  try {
    const baseUrl = 'https://www.pinterest.com/resource/BaseSearchResource/get/';
    const queryParams = {
      source_url: `/search/pins/?q=${encodeURIComponent(query)}`,
      data: JSON.stringify({
        options: {
          query,
          scope: 'pins',
          page_size: limit
        }
      }),
      _: Date.now()
    };
    
    const url = new URL(baseUrl);
    Object.entries(queryParams).forEach(([key, value]) => 
      url.searchParams.set(key, value)
    );
    
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 5000
    });
    
    if (!response.ok) throw new Error('Failed to fetch Pinterest data');
    
    const json = await response.json();
    const results = json.resource_response?.data?.results ?? [];
    
    return results
      .map(item => ({
        pin: `https://www.pinterest.com/pin/${item.id}`,
        created_at: formatDate(item.created_at),
        images_url: getHighestQualityImage(item.images),
        title: item.title || item.grid_title || 'No Title',
        grid_title: item.grid_title || ''
      }))
      .filter(item => item.images_url);
    
  } catch (error) {
    console.error('Pinterest Fetch Error:', error);
    return [];
  }
}

// Utility functions
function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function getHighestQualityImage(images) {
  const qualityOrder = ['orig', '736x', 'base'];
  for (let quality of qualityOrder) {
    if (images[quality]?.url) return images[quality].url;
  }
  return '';
}

handler.help = ['pinterest2 <keyword>'];
handler.tags = ['internet', 'downloader'];
handler.command = /^(pinterest2|pin2)$/i;
handler.limit = 5;

module.exports = handler;