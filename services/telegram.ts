import { TelegramConfig } from '../types';

export const sendTelegramMessage = async (
  config: TelegramConfig,
  message: string
): Promise<{ success: boolean; error?: string }> => {
  if (!config.botToken || !config.chatId) {
    console.warn("Telegram credentials missing");
    return { success: false, error: 'Settings missing' };
  }

  const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: message,
      }),
    });

    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(data.description || 'Failed to send message');
    }

    return { success: true };
  } catch (error: any) {
    console.error('Telegram Error:', error);
    return { success: false, error: error.message };
  }
};