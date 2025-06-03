import type { NextApiRequest, NextApiResponse } from "next";
import TelegramBot from "node-telegram-bot-api";

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN!;
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const body = req.body;
    const chatId = body.message?.chat?.id;

    if (body.message?.text === "/start" && chatId) {
      const options = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Играть",
                web_app: { url: "https://fragmentstgm.ru" },
              },
            ],
          ],
        },
      };

      await bot.sendMessage(chatId, "Добро пожаловать!", options);
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Error in Telegram bot handler: ", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
