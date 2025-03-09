from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from app.api_football import get_matches, get_match_details

app = FastAPI()

# Добавление CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://football.zapto.org"],  # Разрешенный домен
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Модель для запроса перевода (заглушка)
class TranslationRequest(BaseModel):
    text: str

@app.post("/translate/")
async def translate(request: TranslationRequest):
    """
    Заглушка для эндпоинта перевода текста.
    Возвращает оригинальный текст без перевода.
    """
    if not request.text:
        raise HTTPException(status_code=400, detail="Текст не может быть пустым")

    # Возвращаем оригинальный текст без перевода
    return {"original": request.text, "translated": request.text}

@app.get("/matches/")
async def matches(date: str, language: str = "en"):
    """
    Эндпоинт для получения списка матчей на указанную дату.
    Данные возвращаются на английском языке.
    """
    try:
        # Получаем данные о матчах
        matches_data = get_matches(date)
        return matches_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при получении матчей: {str(e)}")

@app.get("/match/{match_id}")
async def match_details(match_id: int, language: str = "en"):
    """
    Эндпоинт для получения деталей матча по его ID.
    Данные возвращаются на английском языке.
    """
    try:
        # Получаем данные о матче
        match_data = get_match_details(match_id)
        return match_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при получении деталей матча: {str(e)}")
