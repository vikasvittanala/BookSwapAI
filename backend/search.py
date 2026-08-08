import os
from dotenv import load_dotenv
from database import supabase

load_dotenv()

def search_books_by_title(query: str, current_user_id: str) -> list[dict]: # Search for users who own the queried book
    result = supabase.table("books")\
        .select("id, title, author, genre, thumbnail, retail_price, user_id, users(username)")\
        .ilike("title", f"%{query}%")\
        .eq("is_available", True)\
        .neq("user_id", current_user_id)\
        .execute() # Exclude current user from result
    
    return result.data