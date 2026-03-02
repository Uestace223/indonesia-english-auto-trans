This is a Telegram translation bot built with grammY (Node.js ES modules).

It automatically translates between Indonesian (id) and English (en).
If you send Indonesian, it replies in English. If you send English, it replies in Indonesian.

In group chats, the bot replies only when:
1) You reply to a bot message, or
2) You mention the bot (for example @YourBotUsername)

Setup
1) Install deps
npm install

2) Create a .env file (or set Render env vars) based on .env.sample

Required
1) TELEGRAM_BOT_TOKEN
2) COOKMYBOTS_AI_ENDPOINT
3) COOKMYBOTS_AI_KEY

Optional but recommended
1) MONGODB_URI (persists per-chat settings across restarts)

Run locally
npm run dev

Run in production
npm start

Commands
/start
Shows a welcome message and quick examples.

/help
Shows detailed help.

/auto_on
Enable auto-translate for the current chat.

/auto_off
Disable auto-translate for the current chat.

/toen
Force translations to English for this chat.

/toid
Force translations to Indonesian for this chat.

/mode
Show current chat settings.

Notes
1) Only text messages are translated.
2) If MONGODB_URI is missing, the bot still works but settings reset on restart.
3) The bot uses CookMyBots AI Gateway only (no direct OpenAI calls).
