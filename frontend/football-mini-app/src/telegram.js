export const initTelegram = () => {
    const tg = window.Telegram.WebApp;

    // Инициализация приложения
    tg.ready();

    // Получение данных пользователя
    const user = tg.initDataUnsafe?.user;
    return { tg, user };
};

export const closeTelegramApp = () => {
    const tg = window.Telegram.WebApp;
    tg.close();
};

// Удалены устаревшие методы expandTelegramApp и setHeaderColor

// Для хранения данных вместо localStorage
export const saveDataToTelegram = async (key, value) => {
    try {
        await window.Telegram.WebApp.CloudStorage.setItem(key, value);
        console.log('Data saved to CloudStorage');
    } catch (e) {
        console.error('CloudStorage error:', e);
    }
};
