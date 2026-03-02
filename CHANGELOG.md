# Changelog

All notable changes to this bot project are recorded here.

## 2026-03-02 20:06:20. UTC
- Request: Task: Update the Telegram translation bot to add Spanish (es), French (fr), and Portuguese (pt) with auto-detection plus new commands. Edits required: 1) src/services/chatSettings.js - In defaultChatSettings, update com…
- Summary: Summary of changes: updated chat settings validation and translation logic to support es/fr/pt modes, added /tosp /tofr /topt commands, registered them in commands.json, updated /help text, and updated README.md and DOC…
- Files: .env.sample, DOCS.md, README.md, commands.json, package.json, src/commands/help.js, src/commands/tofr.js, src/commands/topt.js, src/commands/tosp.js, src/services/chatSettings.js, src/services/translate.js

## 2026-03-02 00:29:44. UTC
- Request: build a simple translator bot for indonesia and english ,whenever the bot got messages it will automatically translate in reverse of the input
- Summary: Created a new Telegram-only grammY project for auto translating between Indonesian and English. Implemented /start, /help, /auto_on, /auto_off, /toen, /toid, /mode, group mention/reply rules, per-user soft rate limiting…
- Files: .env.sample, DOCS.md, README.md, package.json, project.json, src/bot.js, src/commands/auto_off.js, src/commands/auto_on.js, src/commands/help.js, src/commands/loader.js, src/commands/mode.js, src/commands/start.js, src/commands/toen.js, src/commands/toid.js (…

