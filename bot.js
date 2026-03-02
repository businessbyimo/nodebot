// bot.js
// ফেসবুক বট - ফাইনাল ওয়ার্কিং ভার্সন

const express = require('express');
const login = require('facebook-chat-api');
const app = express();
const PORT = process.env.PORT || 3000;

// কুকি লোড
const appState = require('./cookies.js');

let api = null;
let botStarted = false;

// ========== বট লগিন ==========
login({ appState: appState }, (err, apiInstance) => {
    if (err) {
        console.error('❌ লগিন ব্যর্থ:', err);
        return;
    }
    
    api = apiInstance;
    botStarted = true;
    
    console.log('✅ ফেসবুকে লগিন সফল!');
    console.log(`👤 ইউজার আইডি: ${api.getCurrentUserID()}`);
    
    // ========== মেসেজ লিসেন করা ==========
    api.listen((err, event) => {
        if (err) {
            console.error('❌ এরর:', err);
            return;
        }
        
        // নিজের মেসেজ ইগনোর
        if (event.senderID === api.getCurrentUserID()) return;
        
        // ===== মেসেজ হ্যান্ডলিং =====
        if (event.type === 'message' && event.body) {
            const msg = event.body.toLowerCase();
            console.log(`📨 ${event.senderID}: ${event.body}`);
            
            let reply = 'জ্বী বলুন? 🤗';
            
            // গ্রিটিংস
            if (msg.includes('কেমন') || msg.includes('হ্যালো') || msg.includes('হাই') || msg.includes('সালাম')) {
                reply = 'ওয়ালাইকুম আসসালাম! 🤗 আলহামদুলিল্লাহ ভালো আছি। তুমি কেমন আছো?';
            }
            // ধন্যবাদ
            else if (msg.includes('ধন্যবাদ') || msg.includes('thanks')) {
                reply = 'আপনাকেও ধন্যবাদ! 🤝';
            }
            // নাম
            else if (msg.includes('নাম') || msg.includes('কে তুমি')) {
                reply = 'আমি তোমার ফেসবুক সহায়ক বট!';
            }
            // বিদায়
            else if (msg.includes('বিদায়') || msg.includes('bye') || msg.includes('আসি')) {
                reply = 'আল্লাহ হাফেজ! ভালো থাকবেন 🤗';
            }
            // পরিবার
            else if (msg.includes('পরিবার') || msg.includes('বাবা') || msg.includes('মা')) {
                reply = 'পরিবারের সবাই আলহামদুলিল্লাহ ভালো আছে। আপনার পরিবার কেমন আছেন?';
            }
            // পড়াশোনা
            else if (msg.includes('পড়াশোনা') || msg.includes('স্টাডি') || msg.includes('বই')) {
                reply = 'পড়াশোনা চলছে আলহামদুলিল্লাহ। আপনি কী পড়েন?';
            }
            
            api.sendMessage(reply, event.threadID);
        }
        
        // ===== ফ্রেন্ড রিকোয়েস্ট হ্যান্ডলিং =====
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

// ========== এক্সপ্রেস সার্ভার ==========
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>ফেসবুক বট</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; background: #f0f2f5; }
                    .container { max-width: 400px; margin: auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .status { padding: 20px; background: ${botStarted ? '#e8f5e9' : '#ffebee'}; border-left: 5px solid ${botStarted ? '#4caf50' : '#f44336'}; border-radius: 5px; }
                    h1 { color: #1877f2; }
                    a { color: #1877f2; text-decoration: none; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🤖 ফেসবুক বট</h1>
                    <div class="status">
                        <h2 style="color: ${botStarted ? '#2e7d32' : '#c62828'};">বট ${botStarted ? 'চলছে ✅' : 'বন্ধ ❌'}</h2>
                    </div>
                    <p><a href="/check">স্ট্যাটাস চেক করুন</a></p>
                </div>
            </body>
        </html>
    `);
});

app.get('/check', (req, res) => {
    res.json({
        bot: {
            চলছে: botStarted,
            লগিন: api ? true : false,
            ইউজার_আইডি: api ? api.getCurrentUserID() : null
        },
        কুকি: {
            লোড_হয়েছে: true,
            সংখ্যা: appState.length
        },
        সময়: new Date().toLocaleString('bn-BD')
    });
});

app.listen(PORT, () => {
    console.log(`🌐 সার্ভার চলছে port ${PORT}-এ`);
    console.log(`📱 ওপেন করো: http://localhost:${PORT}`);
});
