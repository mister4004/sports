from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from api_football import get_matches, get_match_details  # Убран импорт translate

app = FastAPI()

# НАСТРОЙКА CORS (разрешаем GitHub Pages и локальный фронтенд)
origins = [
    "https://mister4004.github.io",
    "http://localhost:3002",
    "http://football.zapto.org"  # Ваш домен
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# УДАЛЕНО: Модель TranslationRequest и эндпоинт /translate/

# ЭНДПОИНТ МАТЧЕЙ
@app.get("/matches/")
async def matches(date: str, language: str = "en"):
    try:
        return get_matches(date, language)  # Убран перевод
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка матчей: {str(e)}")

# ЭНДПОИНТ ДЕТАЛЕЙ МАТЧА
@app.get("/match/{match_id}")
async def match_details(match_id: int, language: str = "en"):
    try:
        return get_match_details(match_id, language)  # Убран перевод
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка деталей: {str(e)}")
