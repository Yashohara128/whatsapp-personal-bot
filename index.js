const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 🔑 මෙතැනට ඔයාගේ Google Gemini API Key එක දාන්න (Google AI Studio එකෙන් නොමිලේ ගන්න පුළුවන්)
const GEMINI_API_KEY = "AQ.Ab8RN6LwKHyqEDeQO1jsrJoqYUoHjua1eCA5RgcsMPnDqrpJ9Q";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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
    console.log("🤖 PERSONAL AI BOT READY");
    console.log("========================================");
});

// 🧠 Gemini AI එකෙන් පිළිතුරු සකස් කරගැනීම (ಅලුත්ම Model එක සමඟ)
async function getAIResponse(userMessage) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });
        const prompt = `You are a helpful personal AI assistant. Reply naturally, politely, and concisely to this message: "${userMessage}"`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("AI Error:", error);
        return "Sorry මං චුට්ටක් busy අනේ message එකක් දාලා තියන්නකෝ, රිප්ලයි කරන්නම් මම ඉක්මනටම (System generated message)!";
    }
}

client.on("message_create", async (message) => {
    try {
        // ගෲප් මැසේජ් සහ බොට් විසින්ම යවන මැසේජ් නොසලකා හැරීම (Personal DMs පමණක් ක්‍රියාත්මක වේ)
        if (message.from.endsWith("@g.us") || message.fromMe) return;

        const text = message.body;
        if (!text) return;

        console.log(`📩 Personal DM from ${message.from}: ${text}`);

        // AI එකෙන් පිළිතුරක් ලබා ගැනීම
        const aiReply = await getAIResponse(text);

        // අදාළ පුද්ගලයාට ස්වයංක්‍රීයව පිළිතුරු යැවීම
        await client.sendMessage(message.from, aiReply);
        console.log(`🤖 AI Replied: ${aiReply}`);

    } catch (error) {
        console.error("Error in message handling:", error);
    }
});

client.initialize();
