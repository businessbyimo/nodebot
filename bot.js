// bot.js
// ফেসবুক বট - Node.js ভার্সন

const fs = require('fs');
const express = require('express');
const login = require('facebook-chat-api');

const app = express();
const PORT = process.env.PORT || 3000;

// ========== অ্যাপ স্ট্যাটাস ==========
let api = null;
let botStarted = false;

// ========== কুকি লোড ==========
function loadCookies() {
    try {
        const data = fs.readFileSync('cookies.txt', 'utf8');
        const cookies = [];
        
        data.split('\n').forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#')) {
                const parts = line.split('\t');
                if (parts.length >= 7) {
                    cookies.push({
                        domain: parts[0],
                        name: parts[5],
                        value: parts[6],
                        path: parts[2],
                        secure: parts[3] === 'TRUE',
                        httpOnly: true,
                        expirationDate: parseInt(parts[4])
                    });
                }
            }
        });
        
        console.log(`✅ ${cookies.length} টি কুকি লোড হয়েছে`);
        return cookies;
    } catch (err) {
        console.log('❌ কুকি লোড করতে পারেনি:', err.message);
        return null;
    }
}

// ========== বট লগিন ==========
function startBot() {
    const cookies = loadCookies();
    if (!cookies) return;
    
    login({ cookies: cookies }, (err, api) => {
        if (err) {
            console.log('❌ লগিন ব্যর্থ:', err);
            return;
        }
        
        console.log('✅ ফেসবুকে লগিন সফল!');
        console.log(`👤 ইউজার আইডি: ${api.getCurrentUserID()}`);
        
        // বট স্টার্ট
        botStarted = true;
        
        // মেসেজ লিসেন করা
        api.listen((err, event) => {
            if (err) {
                console.log('❌ এরর:', err);
                return;
            }
            
            // নিজের মেসেজ ইগনোর
            if (event.senderID === api.getCurrentUserID()) return;
            
            // মেসেজ প্রিন্ট
            if (event.body) {
                console.log(`📨 ${event.senderID}: ${event.body}`);
                
                // সিম্পল রিপ্লাই
                let reply = 'জ্বী বলুন? 🤗';
                const msg = event.body.toLowerCase();
                
                if (msg.includes('কেমন') || msg.includes('হ্যালো') || msg.includes('হাই') || msg.includes('সালাম')) {
                    reply = 'ওয়ালাইকুম আসসালাম! 🤗 আলহামদুলিল্লাহ ভালো আছি। তুমি কেমন আছো?';
                } else if (msg.includes('ধন্যবাদ') || msg.includes('thanks')) {
                    reply = 'আপনাকেও ধন্যবাদ! 🤝';
                } else if (msg.includes('নাম') || msg.includes('কে তুমি')) {
                    reply = 'আমি তোমার ফেসবুক বট!';
                } else if (msg.includes('বিদায়') || msg.includes('bye') || msg.includes('আসি')) {
                    reply = 'আল্লাহ হাফেজ! ভালো থাকবেন 🤗';
                }
                
                // রিপ্লাই পাঠানো
                api.sendMessage(reply, event.threadID);
            }
        });
        
        // ফ্রেন্ড রিকোয়েস্ট হ্যান্ডলিং
        api.listen((err, event) => {
            if (err) return;
            if (event.type === 'friend_request') {
                api.acceptFriendRequest(event.senderID, (err) => {
                    if (!err) {
                        console.log(`✅ ফ্রেন্ড রিকোয়েস্ট অ্যাক্সেপ্ট: ${event.senderID}`);
                        api.sendMessage('ওয়ালাইকুম আসসালাম! 🤗 ফ্রেন্ড রিকোয়েস্ট অ্যাক্সেপ্ট করলাম।', event.senderID);
                    }
                });
            }
        });
    });
}

// ========== এক্সপ্রেস সার্ভার ==========
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head><title>ফেসবুক বট</title>
            <style>
                body { font-family: Arial; margin: 40px; background: #f0f2f5; }
                .container { max-width: 400px; margin: auto; background: white; padding: 20px; border-radius: 10px; }
                .status { padding: 20px; background: ${botStarted ? '#e8f5e9' : '#ffebee'}; border-left: 5px solid ${botStarted ? '#4caf50' : '#f44336'}; }
            </style>
            </head>
            <body>
                <div class="container">
                    <h1>🤖 ফেসবুক বট (Node.js)</h1>
                    <div class="status">
                        <h2>বট ${botStarted ? 'চলছে ✅' : 'বন্ধ ❌'}</h2>
                    </div>
                    <p><a href="/check">চেক স্ট্যাটাস</a></p>
                </div>
            </body>
        </html>
    `);
});

app.get('/check', (req, res) => {
    res.json({
        cookies_txt: fs.existsSync('cookies.txt'),
        bot_running: botStarted
    });
});

// ========== বট স্টার্ট ==========
startBot();

app.listen(PORT, () => {
    console.log(`🌐 সার্ভার চলছে port ${PORT}-এ`);
});
