import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

# Save a list of books for certain user to Supabase
def save_books_for_user(user_id: str, books: list[dict]) -> list[dict]:
    saved = []
    for book in books:
        if is_duplicate_book(user_id, book.get("title", ""), book.get("author", "")): # Skip if book is already in user's list
            print(f"⏭ Skipped duplicate: {book.get('title')}")
            continue
        data = {
            "user_id": user_id,
            "title": book.get("title"),
            "author": book.get("author"),
            "genre": book.get("genre"),
            "description": book.get("description"),
            "page_count": book.get("page_count"),
            "avg_rating": book.get("avg_rating"),
            "thumbnail": book.get("thumbnail"),
            "retail_price": book.get("retail_price"),
            "is_available": True
        }
        result = supabase.table("books").insert(data).execute()
        saved.append(result.data[0])
        print(f"Saved: {book.get('title')}")
    return saved # To show what was inserted

# Retrieve all available books of a certain user from Supabase
def get_user_books(user_id: str) -> list[dict]:
    result = supabase.table("books").select("*").eq("user_id", user_id).eq("is_available", True).execute()
    return result.data

# Create new user in Supabase
def create_user(username: str, email: str, location: str = None) -> dict:
    data = {
        "id": str(__import__('uuid').uuid4()),
        "username": username,
        "email": email,
        "location": location
    }
    result = supabase.table("users").insert(data).execute()
    return result.data[0]

# Check if user already owns a book with this title and author
def is_duplicate_book(user_id: str, title: str, author: str) -> bool:
    result = supabase.table("books")\
        .select("id")\
        .eq("user_id", user_id)\
        .ilike("title", title)\
        .ilike("author", author)\
        .execute()
    return len(result.data) > 0

# Tag that a user has used the shelf scanner before
def mark_shelf_scan_used(user_id: str) -> None:
    supabase.table("users").update({"has_used_shelf_scan": True}).eq("id", user_id).execute()

# Check the tag whether a user has used the shelf scanner before
def has_used_shelf_scan(user_id: str) -> bool:
    result = supabase.table("users").select("has_used_shelf_scan").eq("id", user_id).execute()
    return result.data[0]["has_used_shelf_scan"] if result.data else False

def create_swap_request(requester_id: str, receiver_id: str, offered_book_ids: list[str], requested_book_ids: list[str]) -> dict:
    # Create a swap request with possibly multiple books on either side of swap
    request_result = supabase.table("swap_requests").insert({
        "requester_id": requester_id,
        "receiver_id": receiver_id,
        "status": "pending"
    }).execute()
    
    request = request_result.data[0]
    request_id = request["id"]

    # Insert offered and requested books (separate tags) into supabase table
    for book_id in offered_book_ids:
        supabase.table("swap_request_books").insert({
            "swap_request_id": request_id,
            "book_id": book_id,
            "side": "offered"
        }).execute()

    for book_id in requested_book_ids:
        supabase.table("swap_request_books").insert({
            "swap_request_id": request_id,
            "book_id": book_id,
            "side": "requested"
        }).execute()

    return request

def get_swap_requests_for_user(user_id: str) -> dict:
    # Get all incoming and outgoing swap requests involving a user's books
    def enrich_requests(requests: list[dict]) -> list[dict]:
        enriched = []
        for r in requests:
            # Get all books on each side of this request (as they are stored in swap_request_books table)
            books_result = supabase.table("swap_request_books")\
                .select("side, books(id, title, author)")\
                .eq("swap_request_id", r["id"])\
                .execute()
            offered = [b["books"] for b in books_result.data if b["side"] == "offered"]
            requested = [b["books"] for b in books_result.data if b["side"] == "requested"]
            enriched.append({
                **r,
                "offered_books": offered,
                "requested_books": requested
            })
        return enriched

    incoming = supabase.table("swap_requests")\
        .select("*, requester:requester_id(username)")\
        .eq("receiver_id", user_id)\
        .eq("status", "pending")\
        .execute() # Which swap requests involving this user are requests sent to them

    outgoing = supabase.table("swap_requests")\
        .select("*, receiver:receiver_id(username)")\
        .eq("requester_id", user_id)\
        .execute() # Which swap requests involving this user are requests sent by them

    return {
        "incoming": enrich_requests(incoming.data),
        "outgoing": enrich_requests(outgoing.data)
    }

def update_swap_request_status(request_id: str, status: str) -> dict:
    # Accept or reject a swap request, and tag all involved books as 'unavailable' if accepted
    result = supabase.table("swap_requests")\
        .update({"status": status})\
        .eq("id", request_id)\
        .execute()

    if status == "accepted":
        # Get all books involved in this request and then tag them as 'unavailable'
        books_result = supabase.table("swap_request_books")\
            .select("book_id")\
            .eq("swap_request_id", request_id)\
            .execute()
        
        for book in books_result.data:
            supabase.table("books")\
                .update({"is_available": False})\
                .eq("id", book["book_id"])\
                .execute()

    return result.data[0]
