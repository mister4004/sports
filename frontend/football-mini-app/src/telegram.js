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

export const expandTelegramApp = () => {
    const tg = window.Telegram.WebApp;
    tg.expand();
};

export const setHeaderColor = (color) => {
    const tg = window.Telegram.WebApp;
    tg.setHeaderColor(color);
};

// Для хранения данных вместо localStorage
export const saveDataToTelegram = (key, value) => {
    const tg = window.Telegram.WebApp;
    tg.sendData(JSON.stringify({ [key]: value }));
};
