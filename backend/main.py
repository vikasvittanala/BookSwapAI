from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil, os, uuid
from database import (
    create_user,
    save_books_for_user,
    get_user_books,
    create_swap_request,
    get_swap_requests_for_user,
    update_swap_request_status
)
from pipeline import run_pipeline
from search import search_books_by_title

app = FastAPI(title="BookSwapAI API") # Creates the website backend / server

app.add_middleware( # Allows React frontend to talk to backend by trusting requests coming from 5173
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# The models that requests can have are below, if smth from frontend doesn't follow this shape, FastAPI rejects it.
class CreateUserRequest(BaseModel):
    username: str
    email: str
    location: str = None

class SwapRequestCreate(BaseModel):
    requester_id: str
    receiver_id: str
    offered_book_ids: list[str]
    requested_book_ids: list[str]

class SwapStatusUpdate(BaseModel):
    status: str  # "accepted" or "rejected"

# TODO All endpoints.
