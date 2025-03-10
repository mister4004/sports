import React, { useEffect, useState } from 'react';
import {
    initTelegram,
    closeTelegramApp,
    saveDataToTelegram // Добавлен новый метод
} from './telegram';

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const { tg } = initTelegram();
        const telegramUser = tg.initDataUnsafe?.user;

        // 1. Проверка наличия данных
        if (!telegramUser) {
            tg.showPopup({
                title: 'Ошибка',
                message: 'Откройте приложение через Telegram',
                buttons: [{ type: 'ok' }]
            });
            return;
        }

        // 2. Используйте правильные методы
        tg.setHeaderColor({
            color: '#ffffff',
            text_color: '#000000'
        });
        tg.expand();

        // 3. Сохранение через CloudStorage
        saveDataToTelegram('lang', 'ru')
            .then(() => console.log('Language saved'))
            .catch(console.error);

        setUser(telegramUser);

        tg.onEvent('viewportChanged', () => {
            console.log('Размер окна изменился!');
        });
    }, []);

    if (!user) {
        return <div>Загрузка...</div>;
    }

    return (
        <div>
            <h1>Добро пожаловать, {user.first_name}!</h1>
            <button onClick={closeTelegramApp}>Закрыть приложение</button>
        </div>
    );
}

export default App;
