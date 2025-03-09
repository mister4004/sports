import requests
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from cachetools import cached, TTLCache

# Настройка кеша (данные хранятся 10 минут)
cache = TTLCache(maxsize=100, ttl=600)

load_dotenv("/home/mister/project-root/config/.env")

API_FOOTBALL_KEY = os.getenv("API_FOOTBALL_KEY")
BASE_URL = "https://v3.football.api-sports.io"

def make_api_request(url, params=None):
    """Универсальный метод для запросов с кешированием"""
    headers = {
        "x-apisports-key": API_FOOTBALL_KEY,
        "Accept": "application/json"
    }
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    return response.json()

@cached(cache)
def get_matches():
    """
    Получает матчи на 3 дня с кешированием.
    Включает: основную информацию, статистику и коэффициенты.
    """
    dates = [
        datetime.now().strftime("%Y-%m-%d"),
        (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"),
        (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")
    ]

    all_data = []

    for date in dates:
        # Запрос матчей на дату
        fixtures_url = f"{BASE_URL}/fixtures"
        fixtures_data = make_api_request(fixtures_url, {"date": date})

        for fixture in fixtures_data.get("response", []):
            match_id = fixture["fixture"]["id"]
            league_id = fixture["league"]["id"]
            season = fixture["league"]["season"]

            # Статистика команд
            stats_url = f"{BASE_URL}/teams/statistics"
            stats_params = {
                "team": fixture["teams"]["home"]["id"],
                "league": league_id,
                "season": season
            }
            stats_data = make_api_request(stats_url, stats_params)

            # Коэффициенты
            odds_url = f"{BASE_URL}/odds"
            odds_data = make_api_request(odds_url, {"fixture": match_id})

            all_data.append({
                "fixture": fixture,
                "stats": stats_data.get("response", {}),
                "odds": odds_data.get("response", [])
            })

    return {"response": all_data}

@cached(cache)
def get_match_details(match_id):
    """
    Получает детали матча по его ID.
    """
    match_url = f"{BASE_URL}/fixtures/id/{match_id}"
    match_data = make_api_request(match_url)
    return match_data
