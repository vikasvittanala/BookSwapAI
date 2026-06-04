import os
from dotenv import load_dotenv
from database import supabase

load_dotenv()

def search_books_by_title(query: str, current_user_id: str) -> list[dict]: # Search for users who own the queried book
    result = supabase.table("books")\
        .select("id, title, author, genre, thumbnail, retail_price, user_id, users(username, location)")\
        .ilike("title", f"%{query}%")\
        .eq("is_available", True)\
        .neq("user_id", current_user_id)\
        .execute() # Exclude current user from result
    
    return result.data

if __name__ == "__main__": # If this file is run manually, test code
    users = supabase.table("users").select("id, username").limit(2).execute().data
    
    if len(users) < 2:
        print("Insufficient users to run search")
    else:
        searcher = users[0]
        print(f"Searching as user: {searcher['username']}\n")
        
        results = search_books_by_title("beatrix", searcher["id"])
        
        if not results:
            print("No books found matching that query")
        else:
            print(f"Found {len(results)} result(s):\n")
            for book in results:
                owner = book.get("users", {})
                print(f"📖 {book['title']} by {book['author']}")
                print(f"Owner: {owner.get('username')} ({owner.get('location')})")
                print(f"Genre: {book['genre']} | Price: ${book.get('retail_price', 'N/A')}\n")