
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "group-bot"
    }),

    puppeteer: {
        executablePath:
            "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",

        headless: true,

        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu"
        ]
    }
});

// ========================================
// BOT SETTINGS
// ========================================

const BOT_NAME = "Chris Bot";

// Time between automatic replies.
// This helps prevent the bot from flooding the group.
const REPLY_DELAY = 1500;

// Keep track of messages already processed.
const processedMessages = new Set();

// Keep track of user warnings.
const warnings = new Map();

// ========================================
// MODERATION WORDS
// ========================================

const BANNED_WORDS = [
    "scam",
    "spam"
];

// ========================================
// REPLY COLLECTION
// ========================================

const GENERAL_REPLIES = [
    "Interesting 👀",
    "I hear you 😄",
    "That's a good one.",
    "Hmm, tell us more 👀",
    "I see what you mean.",
    "Absolutely! 👍",
    "That's interesting.",
    "Got you 😄",
    "Fair enough!",
    "Well said 👌",
    "Haha 😂",
    "True!",
    "I understand.",
    "That's something to think about 🤔",
    "Nice one!",
    "Interesting perspective 👀",
    "Noted 👍",
    "I agree with you.",
    "That's cool 😎",
    "Really? Tell me more!"
];

// ========================================
// GREETING REPLIES
// ========================================

const GREETING_REPLIES = [
    "👋 Hello! Nice to see you.",
    "Hey! 😄 Welcome.",
    "👋 Hello there!",
    "Hi! 😊 How are you doing?",
    "Hey everyone! 👋",
    "Hello! Hope you're having a great day."
];

// ========================================
// HOW ARE YOU REPLIES
// ========================================

const HOW_ARE_YOU_REPLIES = [
    "😊 I'm doing great! Thanks for asking.",
    "I'm good 😄 Hope you're doing well too!",
    "Doing great over here 🤖👍",
    "I'm perfectly fine! How about you?"
];

// ========================================
// THANK YOU REPLIES
// ========================================

const THANK_YOU_REPLIES = [
    "You're very welcome! 😊",
    "Anytime! 👍",
    "You're welcome 😄",
    "No problem!",
    "Happy to help! 🤖"
];

// ========================================
// QUESTION REPLIES
// ========================================

const QUESTION_REPLIES = [
    "That's a good question 🤔",
    "Interesting question! 👀",
    "Hmm, let's think about that.",
    "Good question. What do you think?",
    "I'd like to hear what everyone thinks about that."
];

// ========================================
// RANDOM ITEM
// ========================================

function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// ========================================
// DELAY
// ========================================

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

// ========================================
// CHOOSE RESPONSE
// ========================================

function getAutomaticReply(text) {
    const lowerText = text.toLowerCase().trim();

    // -------------------------------
    // COMMANDS
    // -------------------------------

    if (lowerText === "!help") {
        return (
            `🤖 *${BOT_NAME} Commands*\n\n` +
            `!help - Show commands\n` +
            `!rules - Show group rules\n` +
            `!time - Show current time\n` +
            `!hello - Say hello\n` +
            `!warnings - Show your warnings\n\n` +
            `💬 I automatically reply to group messages.`
        );
    }

    if (lowerText === "!rules") {
        return (
            `📜 *GROUP RULES*\n\n` +
            `1️⃣ Respect everyone.\n` +
            `2️⃣ No spam.\n` +
            `3️⃣ No scams.\n` +
            `4️⃣ No harassment.\n` +
            `5️⃣ No inappropriate content.\n` +
            `6️⃣ Keep the group respectful.`
        );
    }

    if (lowerText === "!time") {
        return `🕐 Current time: ${new Date().toLocaleTimeString("en-NG")}`;
    }

    if (lowerText === "!hello") {
        return randomItem(GREETING_REPLIES);
    }

    // -------------------------------
    // GREETINGS
    // -------------------------------

    const greetings = [
        "hello",
        "hi",
        "hey",
        "good morning",
        "good afternoon",
        "good evening",
        "morning",
        "afternoon",
        "evening"
    ];

    if (
        greetings.some((greeting) =>
            lowerText === greeting ||
            lowerText.startsWith(greeting + " ")
        )
    ) {
        return randomItem(GREETING_REPLIES);
    }

    // -------------------------------
    // HOW ARE YOU
    // -------------------------------

    if (
        lowerText.includes("how are you") ||
        lowerText.includes("how is everyone") ||
        lowerText.includes("how are things")
    ) {
        return randomItem(HOW_ARE_YOU_REPLIES);
    }

    // -------------------------------
    // THANK YOU
    // -------------------------------

    if (
        lowerText.includes("thank you") ||
        lowerText.includes("thanks")
    ) {
        return randomItem(THANK_YOU_REPLIES);
    }

    // -------------------------------
    // QUESTION
    // -------------------------------

    if (lowerText.includes("?")) {
        return randomItem(QUESTION_REPLIES);
    }

    // -------------------------------
    // DEFAULT
    // -------------------------------

    return randomItem(GENERAL_REPLIES);
}

// ========================================
// QR CODE
// ========================================

client.on("qr", (qr) => {
    console.log("\n📱 Scan this QR code with WhatsApp:\n");

    qrcode.generate(qr, {
        small: true
    });
});

// ========================================
// AUTHENTICATION
// ========================================

client.on("authenticated", () => {
    console.log("🔐 WhatsApp authenticated!");
});

client.on("auth_failure", (message) => {
    console.error("❌ Authentication failed:", message);
});

// ========================================
// READY
// ========================================

client.on("ready", () => {
    console.log("\n=================================");
    console.log("✅ WhatsApp bot is ready!");
    console.log("🤖 Bot:", BOT_NAME);
    console.log("🌍 Groups: ALL GROUPS");
    console.log("💬 Reply to EVERY text message: ON");
    console.log("🛡️ Moderation: ON");
    console.log("=================================\n");
});

// ========================================
// DISCONNECTED
// ========================================

client.on("disconnected", (reason) => {
    console.log("⚠️ WhatsApp disconnected:", reason);
});

// ========================================
// MESSAGE HANDLER
// ========================================

client.on("message", async (message) => {
    try {
        // --------------------------------
        // IGNORE BOT'S OWN MESSAGES
        // --------------------------------

        if (message.fromMe) {
            return;
        }

        // --------------------------------
        // IGNORE EMPTY MESSAGES
        // --------------------------------

        if (!message.body || !message.body.trim()) {
            return;
        }

        // --------------------------------
        // CHECK GROUP
        // --------------------------------

        const isGroup =
            typeof message.from === "string" &&
            message.from.endsWith("@g.us");

        if (!isGroup) {
            return;
        }

        // --------------------------------
        // DUPLICATE PROTECTION
        // --------------------------------

        const messageId = message.id?.id;

        if (messageId && processedMessages.has(messageId)) {
            return;
        }

        if (messageId) {
            processedMessages.add(messageId);
        }

        // Prevent unlimited memory usage
        if (processedMessages.size > 5000) {
            const first =
                processedMessages.values().next().value;

            processedMessages.delete(first);
        }

        // --------------------------------
        // MESSAGE
        // --------------------------------

        const text = message.body.trim();

        console.log("\n--------------------------------");
        console.log("📩 Group message");
        console.log("From:", message.from);
        console.log("Message:", text);

        // ========================================
        // MODERATION
        // ========================================

        const lowerText = text.toLowerCase();

        const bannedWord = BANNED_WORDS.find((word) =>
            lowerText.includes(word)
        );

        if (bannedWord) {
            const userId =
                message.author ||
                message.from;

            const currentWarnings =
                warnings.get(userId) || 0;

            const newWarnings =
                currentWarnings + 1;

            warnings.set(userId, newWarnings);

            console.log(
                `⚠️ Warning ${newWarnings} issued`
            );

            await sleep(REPLY_DELAY);

            await message.reply(
                `⚠️ *Warning ${newWarnings}*\n\n` +
                `Please avoid spam, scams, or inappropriate messages.\n` +
                `Please follow the group rules.`
            );

            return;
        }

        // ========================================
        // WARNINGS COMMAND
        // ========================================

        if (lowerText === "!warnings") {
            const userId =
                message.author ||
                message.from;

            const count =
                warnings.get(userId) || 0;

            await sleep(REPLY_DELAY);

            await message.reply(
                `⚠️ You currently have *${count} warning(s)*.`
            );

            return;
        }

        // ========================================
        // AUTOMATIC RESPONSE
        // ========================================

        const reply = getAutomaticReply(text);

        console.log("🤖 Reply:", reply);

        await sleep(REPLY_DELAY);

        await message.reply(reply);

        console.log("✅ Reply sent");

    } catch (error) {
        console.error("\n❌ MESSAGE HANDLING ERROR");
        console.error("Name:", error?.name);
        console.error("Message:", error?.message);
        console.error("Stack:", error?.stack);
        console.error("--------------------------------");
    }
});

// ========================================
// START BOT
// ========================================

client.initialize();