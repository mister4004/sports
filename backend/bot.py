import logging
import os
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update, WebAppInfo
from telegram.ext import ApplicationBuilder, CommandHandler, CallbackQueryHandler, ContextTypes

# Загрузка переменных окружения
load_dotenv("/home/mister/project-root/config/.env")

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

# Получение токена бота и URL FastAPI из .env
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
FASTAPI_URL = os.getenv("FASTAPI_URL", "http://localhost:8000")  # URL FastAPI по умолчанию

if not TELEGRAM_BOT_TOKEN:
    logging.error("Telegram bot token is not set in .env file.")
    exit(1)

# Главное меню
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    web_app_info = WebAppInfo(url="https://football.zapto.org/")  # Замените на URL вашего фронтенда
    keyboard = [
        [InlineKeyboardButton("Открыть мини-приложение", web_app=web_app_info)]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text("Нажмите кнопку, чтобы открыть мини-приложение:", reply_markup=reply_markup)

# Обработка выбора даты
async def handle_date_choice(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    # Динамические даты
    today = datetime.now().strftime("%Y-%m-%d")
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    day_after = (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")

    # Соответствие callback_data и дат
    date_map = {
        "today": today,
        "tomorrow": tomorrow,
        "day_after_tomorrow": day_after
    }
    date = date_map.get(query.data)

    if not date:
        await query.edit_message_text("Неверный выбор даты.")
        return

    # Запрос к FastAPI для получения списка матчей
    try:
        response = requests.get(f"{FASTAPI_URL}/matches/", params={"date": date})
        response.raise_for_status()  # Проверка на ошибки HTTP
        matches = response.json().get("response", [])  # Получаем "response" из ответа
    except requests.RequestException as e:
        logging.error(f"Ошибка при получении матчей: {e}")
        await query.edit_message_text("Не удалось загрузить матчи. Попробуйте позже.")
        return

    if not matches:
        await query.edit_message_text("На выбранную дату матчей нет.")
        return

    # Формируем список матчей для inline-клавиатуры
    keyboard = []
    for match in matches:
        match_id = match["fixture"]["id"]
        match_name = f"{match['teams']['home']['name']} vs {match['teams']['away']['name']}"
        keyboard.append([InlineKeyboardButton(match_name, callback_data=f"match_{match_id}")])

    reply_markup = InlineKeyboardMarkup(keyboard)
    await query.edit_message_text("Матчи на выбранную дату:", reply_markup=reply_markup)

# Обработка выбора матча
async def handle_match_choice(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    # Получаем ID матча из callback_data
    match_id = query.data.split("_")[1]

    # Запрос к FastAPI для получения деталей матча
    try:
        response = requests.get(f"{FASTAPI_URL}/match/{match_id}")
        response.raise_for_status()
        match_data = response.json()["response"][0]  # Первый элемент в "response"
    except requests.RequestException as e:
        logging.error(f"Ошибка при получении деталей матча: {e}")
        await query.edit_message_text("Не удалось загрузить данные о матче. Попробуйте позже.")
        return

    # Формируем сообщение с деталями матча
    message = (
        f"⚽ Матч: {match_data['teams']['home']['name']} vs {match_data['teams']['away']['name']}\n"
        f"🏆 Турнир: {match_data['league']['name']}\n"
        f"⏰ Время: {match_data['fixture']['date']}\n\n"
        "Выберите действие:"
    )

    # Кнопки для статистики и коэффициентов
    keyboard = [
        [InlineKeyboardButton("Статистика", callback_data=f"stats_{match_id}")],
        [InlineKeyboardButton("Линия/Коэффициенты", callback_data=f"odds_{match_id}")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await query.edit_message_text(message, reply_markup=reply_markup)

# Обработка статистики
async def handle_stats(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    # Получаем ID матча
    match_id = query.data.split("_")[1]

    # Запрос к FastAPI для получения данных матча
    try:
        response = requests.get(f"{FASTAPI_URL}/match/{match_id}")
        response.raise_for_status()
        match_data = response.json()["response"][0]
    except requests.RequestException as e:
        logging.error(f"Ошибка при получении статистики: {e}")
        await query.edit_message_text("Не удалось загрузить статистику. Попробуйте позже.")
        return

    # Формируем сообщение со статистикой
    stats = f"📊 Статистика для матча {match_data['teams']['home']['name']} vs {match_data['teams']['away']['name']}:\n"
    stats += f"- Последние 5 игр команды A: {match_data.get('team_a_last_5', 'Нет данных')}\n"
    stats += f"- Последние 5 игр команды B: {match_data.get('team_b_last_5', 'Нет данных')}\n"
    stats += f"- Личные встречи: {match_data.get('head_to_head', 'Нет данных')}"

    await query.edit_message_text(stats)

# Обработка линии/коэффициентов
async def handle_odds(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    # Получаем ID матча
    match_id = query.data.split("_")[1]

    # Запрос к FastAPI для получения данных матча
    try:
        response = requests.get(f"{FASTAPI_URL}/match/{match_id}")
        response.raise_for_status()
        match_data = response.json()["response"][0]
    except requests.RequestException as e:
        logging.error(f"Ошибка при получении коэффициентов: {e}")
        await query.edit_message_text("Не удалось загрузить коэффициенты. Попробуйте позже.")
        return

    # Формируем сообщение с коэффициентами
    odds = f"📈 Коэффициенты для матча {match_data['teams']['home']['name']} vs {match_data['teams']['away']['name']}:\n"
    odds_data = match_data.get("odds", {})
    odds += f"- Победа команды A: {odds_data.get('team_a', 'Нет данных')}\n"
    odds += f"- Ничья: {odds_data.get('draw', 'Нет данных')}\n"
    odds += f"- Победа команды B: {odds_data.get('team_b', 'Нет данных')}"

    await query.edit_message_text(odds)

# Основная функция
def main():
    application = ApplicationBuilder().token(TELEGRAM_BOT_TOKEN).build()

    # Регистрация обработчиков
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CallbackQueryHandler(handle_date_choice, pattern="^(today|tomorrow|day_after_tomorrow)$"))
    application.add_handler(CallbackQueryHandler(handle_match_choice, pattern="^match_"))
    application.add_handler(CallbackQueryHandler(handle_stats, pattern="^stats_"))
    application.add_handler(CallbackQueryHandler(handle_odds, pattern="^odds_"))

    # Запуск бота
    application.run_polling()

if __name__ == '__main__':
    main()
