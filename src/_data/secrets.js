// Runtime secrets come from environment variables (GitHub Actions secrets in CI, local .env for dev).
// Nothing here is committed. The Web3Forms access key is public by design but is kept out of the repo too.
const fs = require("fs");
const path = require("path");
const envFile = path.join(__dirname, "..", "..", ".env");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
module.exports = {
  web3forms_key: process.env.WEB3FORMS_KEY || "",
  telegram_bot_token: process.env.TG_BOT_TOKEN || "",
  telegram_chat_id: process.env.TG_CHAT_ID || "",
};
