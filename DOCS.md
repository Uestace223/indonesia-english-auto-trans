What this bot does
This Telegram bot automatically translates messages between Indonesian (id) and English (en).

Default behavior
In a new chat, auto-translate is ON and direction is AUTO.
That means:
1) Indonesian input is translated to English.
2) English input is translated to Indonesian.
3) If detection is uncertain, it defaults to translating into English.

Private vs group chats
1) Private chats: the bot replies to every non-command text message (unless auto-translate is turned off).
2) Group chats: the bot replies only when you reply to a bot message OR mention the bot.

Commands
/start
What it does: Welcome message and quick examples.
Usage: /start

/help
What it does: Detailed usage and limitations.
Usage: /help

/auto_on
What it does: Enables auto-translate for the current chat.
Usage: /auto_on

/auto_off
What it does: Disables auto-translate for the current chat.
Usage: /auto_off

/toen
What it does: Forces translation target to English for the current chat.
Usage: /toen

/toid
What it does: Forces translation target to Indonesian for the current chat.
Usage: /toid

/mode
What it does: Shows current settings for the chat.
Usage: /mode

Environment variables
TELEGRAM_BOT_TOKEN
Required. Telegram bot token.

COOKMYBOTS_AI_ENDPOINT
Required. Base URL for CookMyBots AI Gateway.
Example format: https://api.cookmybots.com/api/ai

COOKMYBOTS_AI_KEY
Required. API key for CookMyBots AI Gateway.

MONGODB_URI
Optional but recommended. MongoDB connection string used to persist per-chat settings.

LOG_LEVEL
Optional. Default is info.

Running locally
1) npm install
2) Copy .env.sample to .env and fill values
3) npm run dev
