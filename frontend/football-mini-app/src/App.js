import React, { useEffect, useState } from 'react';
import {
    initTelegram,
    closeTelegramApp,
    saveDataToTelegram // Добавлен новый метод
} from './telegram';

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const { tg, user: telegramUser } = initTelegram();

        // 1. Проверка наличия данных
        if (!telegramUser) {
            tg.showAlert('Please open via Telegram!');
            return;
        }

        // 2. Используйте правильные методы
        tg.setBackgroundColor('#ffffff'); // вместо setHeaderColor
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
