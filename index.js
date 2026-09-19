const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const OpenAI = require("openai");

// 🔑 මෙතැනට ඔයාගේ OpenAI (ChatGPT) API Key එක දාන්න
const OPENAI_API_KEY = "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";
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

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
    console.log("🤖 PERSONAL AI BOT READY (ChatGPT)");
    console.log("========================================");
});

// 🧠 ChatGPT (OpenAI) එකෙන් පිළිතුරු සකස් කරගැනීම
async function getAIResponse(userMessage) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // ඉතාමත් වේගවත් සහ ලාභදායී මොඩල් එකක්
            messages: [
                { role: "system", content: "You are a helpful personal AI assistant. Reply naturally, politely, and concisely." },
                { role: "user", content: userMessage }
            ],
        });
        const textResponse = completion.choices[0].message.content;
        console.log("💡 ChatGPT Response:", textResponse);
        return textResponse;
    } catch (error) {
        console.error("❌ OpenAI API Error:", error);
        return "Sorry මං චුට්ටක් busy. message එකක් දාලා තියන්නකෝ, රිප්ලයි කරන්නම් ඉක්මනටම! (This was system generated message)";
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
