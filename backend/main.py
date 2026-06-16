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
    update_swap_request_status,
    has_used_shelf_scan, 
    mark_shelf_scan_used,
    is_duplicate_book
)
from pipeline import run_pipeline
from search import search_books_by_title
from google_books_enrichment import enrich_with_google_books

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

class ManualBookRequest(BaseModel):
    user_id: str
    title: str
    author: str = ""

# User endpoint
@app.post("/users")
async def register_user(body: CreateUserRequest):
    try:
        user = create_user(body.username, body.email, body.location)
        return user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) # Client error (e.g. wrong formatting)
    
# Pipeline endpoint
@app.post("/pipeline/{user_id}")
async def run_book_pipeline(user_id: str, file: UploadFile = File(...)):
    if has_used_shelf_scan(user_id): # Enforce one-use limit on shelf scanner
        raise HTTPException(
            status_code=400,
            detail="Shelf upload already used. Add more books manually instead."
        )

    temp_path = f"temp_{uuid.uuid4().hex}.jpg" # Save uploaded image temporarily
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        books = run_pipeline(temp_path, user_id)
        return {"message": f"{len(books)} books saved", "books": books}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) # Server error
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

# Manual book entry endpoint
@app.post("/books/manual")
async def add_manual_book(body: ManualBookRequest):

    if is_duplicate_book(body.user_id, body.title, body.author):
        raise HTTPException(status_code=400, detail="You already own this book")

    enriched = enrich_with_google_books(body.title, body.author)
    if not enriched:
        raise HTTPException(status_code=404, detail="Book not found, or could not be verified")
    
    saved = save_books_for_user(body.user_id, [enriched])
    if not saved:
        raise HTTPException(status_code=400, detail="You already own this book")
    return saved[0]

# Search endpoint
@app.get("/search")
async def search_books(query: str, user_id: str):
    try:
        results = search_books_by_title(query, user_id)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# Swap endpoint
@app.post("/swaps") # Create swap request
async def create_swap(body: SwapRequestCreate):
    try:
        request = create_swap_request(
            body.requester_id,
            body.receiver_id,
            body.offered_book_ids,
            body.requested_book_ids
        )
        return request
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 

@app.get("/swaps/{user_id}") # Retrieve all swaps involving a user
async def get_swaps(user_id: str):
    try:
        return get_swap_requests_for_user(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 

@app.put("/swaps/{request_id}") # Update swap status
async def update_swap(request_id: str, body: SwapStatusUpdate):
    if body.status not in ["accepted", "rejected"]:
        raise HTTPException(status_code=400, detail="Status must be 'accepted' or 'rejected'")
    try:
        return update_swap_request_status(request_id, body.status)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/users/{user_id}/books") # Get all books owned by a user
async def get_books(user_id: str):
    try:
        return get_user_books(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    