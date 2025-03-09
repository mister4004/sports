import React, { useEffect, useState } from 'react';
import { initTelegram, closeTelegramApp, expandTelegramApp, setHeaderColor } from './telegram';

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Инициализация Telegram Web App
        const { tg, user: telegramUser } = initTelegram();
        if (telegramUser) {
            setUser(telegramUser);
        }

        // Настройка интерфейса
        expandTelegramApp(); // Расширяем мини-приложение на весь экран
        setHeaderColor('#ffffff'); // Устанавливаем цвет заголовка

        // Пример использования tg для отслеживания событий
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
