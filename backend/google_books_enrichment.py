import os, requests
from dotenv import load_dotenv

load_dotenv()

def title_similarity(a: str, b: str) -> float: # Helper function to compute 'word overlap' between two titles
    a_words = set(a.lower().split())
    b_words = set(b.lower().split())
    if not a_words:
        return 0.0
    return len(a_words & b_words) / len(a_words)

LANGUAGE_FILTERS = [
    "tamil", "hindi", "malay", "chinese", "french", "german",
    "spanish", "japanese", "korean", "arabic", "telugu", "urdu"
]
def is_non_english(title: str) -> bool: # Checks if input title is in non-English language
    title_lower = title.lower()
    return any(lang in title_lower for lang in LANGUAGE_FILTERS)

def enrich_with_google_books(title: str, author: str) -> dict | None: # Function to call Google Books API to validate identified book and obtain metadata
    api_key = os.getenv("GOOGLE_BOOKS_API_KEY")
    query = f"{title} {author}".strip()
    url = (
        f"https://www.googleapis.com/books/v1/volumes"
        f"?q={query}"
        f"&key={api_key}"
        f"&maxResults=5" # fetch first 5 results, iterate until we find a good match
        f"&printType=books" # Only books, no films/magazines
    )

    r = requests.get(url)
    data = r.json()
    
    if not data.get("items"):  # If book is not found then reject it
        return None
    
    searched_in_english = not is_non_english(title) # Whether the input title is English 

    for item in data["items"]: # Iterate over each possible match to evaluate the closeness of the match
        info = item["volumeInfo"]
        sale_info = item.get("saleInfo", {})
        returned_title = info.get("title", "")

        if searched_in_english and is_non_english(returned_title): # Skip non-English matches if user input was English
            continue

        if title_similarity(title, returned_title) < 0.3: # Reject if returned title is not a close enough match, arbitrary value 0.3 used
            return None

        return { # All metadata to grab from the first iteration that passes all checks
            "title": info.get("title", title),
            "author": ", ".join(info.get("authors", [author])),
            "genre": info.get("categories", ["Unknown"])[0],
            "description": info.get("description", ""),
            "page_count": info.get("pageCount"),
            "avg_rating": info.get("averageRating"),
            "thumbnail": info.get("imageLinks", {}).get("thumbnail", ""),
            "retail_price": sale_info.get("retailPrice", {}).get("amount")
        }
    return None

if __name__ == "__main__": # Test the function with a mix of valid and invalid books
    test_books = [
        {"title": "Atomic Habits", "author": "James Clear"},
        {"title": "Thinking Fast and Slow", "author": "Daniel Kahneman"},
        {"title": "The Psychology of Banana Peels", "author": "John Smith"},  # invalid
    ]
    
    print("Testing Google Books validation + enrichment:\n")
    for book in test_books:
        result = enrich_with_google_books(book["title"], book["author"])
        if result:
            print(f"VERIFIED: {result['title']} by {result['author']}")
            print(f"Genre: {result['genre']}")
            print(f"Price: ${result['retail_price'] or 'N/A'}")
            print(f"Rating: {result['avg_rating'] or 'N/A'}\n")
        else:
            print(f"REJECTED: '{book['title']}' — not found in Google Books\n")
