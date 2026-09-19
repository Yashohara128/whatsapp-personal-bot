const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const Groq = require("groq-sdk");

// 🔑 මෙතැනට ඔයාගේ Groq API Key එක දාන්න (gsk_...)
const GROQ_API_KEY = "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";
const groq = new Groq({ apiKey: GROQ_API_KEY });

const CHROME_PATH = "/usr/bin/chromium-browser";

const client = new Client({
    authStrategy: new LocalAuth({ clientId: "personal-session" }),
    puppeteer: {
        executablePath: CHROME_PATH,
        headless: true, 
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--single-process",
            "--disable-gpu"
        ]
    }
});

client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
    console.log("✅ Personal Bot Authenticated");
});

client.on("ready", () => {
    console.log("\n========================================");
    console.log("🤖 PERSONAL AI BOT READY (Groq Llama 3)");
    console.log("========================================");
});

// 🧠 Groq AI එකෙන් පිළිතුරු සකස් කරගැනීම
async function getAIResponse(userMessage) {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful personal AI assistant. Reply naturally, politely, and concisely." },
                { role: "user", content: userMessage }
            ],
            model: "llama-3.3-70b-versatile",
        });
        const textResponse = chatCompletion.choices[0]?.message?.content || "";
        console.log("💡 Groq AI Response:", textResponse);
        return textResponse;
    } catch (error) {
        console.error("❌ Groq API Error:", error);
        return "Sorry මං චුට්ටක් busy අනේ message එකක් දාලා තියන්නකෝ, රිප්ලයි කරන්නම් මම ඉක්මනටම!";
    }
}

client.on("message_create", async (message) => {
    try {
        if (message.from.endsWith("@g.us") || message.fromMe) return;

        const text = message.body;
        if (!text) return;

        console.log(`\n📩 Personal DM from ${message.from}: ${text}`);

        const aiReply = await getAIResponse(text);

        await client.sendMessage(message.from, aiReply);
        console.log(`🤖 AI Replied Successfully: ${aiReply}`);

    } catch (error) {
        console.error("❌ Error in message handling:", error);
    }
});

client.initialize();
