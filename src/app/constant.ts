export const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
export const FILE_ID_CHANNEL = process.env.FILE_ID_CHANNEL;
export const FILE_UPLOAD_CHANNEL = process.env.FILE_UPLOAD_CHANNEL;
export const PRODUCTION_URL = process.env.PRODUCTION_URL;

export const HOST = process.env.NODE_ENV === "development" ? "http://localhost:3000" : PRODUCTION_URL;
