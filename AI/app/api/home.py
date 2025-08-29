from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.rag_chain import create_qa_chain
from app.services.read_vertor_db import read_vertors_db
from app.models.load_response_model import llm
from app.services.create_prompt import create_prompt
from app.services.templates import templates

router = APIRouter()


@router.get("/")
async def ask_question() -> dict:
    try:
        return {"result": "Hello, World!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
