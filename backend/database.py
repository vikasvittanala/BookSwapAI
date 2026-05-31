import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

def save_books_for_user(user_id: str, books: list[dict]) -> list[dict]: # Save a list of books for certain user to Supabase
    saved = []
    for book in books:
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

def get_user_books(user_id: str) -> list[dict]: # Retrieve all available books of a certain user from Supabase
    result = supabase.table("books").select("*").eq("user_id", user_id).eq("is_available", True).execute()
    return result.data

def create_user(username: str, email: str, location: str = None) -> dict: # Create new user in Supabase
    data = {
        "id": str(__import__('uuid').uuid4()),
        "username": username,
        "email": email,
        "location": location
    }
    result = supabase.table("users").insert(data).execute()
    return result.data[0]

if __name__ == "__main__": # Only runs following block if file is run manually, test with a dummy user and books
    print("Creating test user...\n") # Dummy user
    user = create_user("testuser", f"test_{__import__('uuid').uuid4().hex[:6]}@test.com", "Singapore")
    print(f"Created user: {user['id']}")
    
    test_books = [ # Dummy book
        {
            "title": "Atomic Habits",
            "author": "James Clear",
            "genre": "Self-Help",
            "description": "A proven framework for improving every day.",
            "page_count": 320,
            "avg_rating": 4.5,
            "thumbnail": "",
            "retail_price": 13.99
        }
    ]
    
    print("Saving test books to Supabase...\n")
    saved = save_books_for_user(user["id"], test_books)
    
    print("\nRetrieving books from Supabase...\n")
    retrieved = get_user_books(user["id"])
    print(f"Found {len(retrieved)} books for user")
    for book in retrieved:
        print(f"- {book['title']} by {book['author']}")