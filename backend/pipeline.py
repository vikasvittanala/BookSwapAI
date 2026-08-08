from shelf_scanner import extract_books_from_shelf
from google_books_enrichment import enrich_with_google_books
from database import save_books_for_user

def run_pipeline(image_path: str, user_id: str) -> list[dict]: # Order: extract books from shelf, filter low confidence results, enrich via Google Books, save to Supabase
    print("Step 1: Scanning shelf image")
    raw_books = extract_books_from_shelf(image_path)
    print(f"Detected {len(raw_books)} books")

    print("Step 2: Removing low-confidence results")
    filtered = [b for b in raw_books if b.get("confidence") in ["high", "medium"]]
    print(f"{len(filtered)} books passed confidence filter")

    print("Step 3: Enriching results via Google Books")
    verified = []
    for book in filtered:
        enriched = enrich_with_google_books(book["title"], book.get("author", ""))
        if enriched:
            verified.append(enriched)
            print(f"Verified: {enriched['title']}")
        else:
            print(f"Rejected: {book['title']}")

    print(f"Step 4: Saving {len(verified)} verified books to our database ---")
    saved = save_books_for_user(user_id, verified)

    print(f"Process complete. {len(saved)} books saved for user {user_id}")
    return saved