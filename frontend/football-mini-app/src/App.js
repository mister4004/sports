import React, { useEffect, useState } from 'react';
import { 
    initTelegram, 
    closeTelegramApp, 
    expandTelegramApp, 
    setHeaderColor,
    saveDataToTelegram // Добавлен новый метод
} from './telegram';

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const { tg, user: telegramUser } = initTelegram();
        
        if (telegramUser) {
            setUser(telegramUser);
            // Пример сохранения данных через WebApp API вместо localStorage
            saveDataToTelegram('lang', 'ru');
        }

        expandTelegramApp();
        setHeaderColor('#ffffff');

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
