import base64, os, json, requests
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY")) # Create OpenAI client obj

def encode_image(image_path: str) -> str: # Function to convert binary image to base64 string
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

def extract_books_from_shelf(image_path: str) -> list[dict]: # Function to call openAI API to extract books from image
    base64_image = encode_image(image_path)
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image_url", # Provide OpenAI with image input
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                },
                {
                    "type": "text", # Provide OpenAI with text prompt instructions
                    "text": """Look at this bookshelf image. Extract every book you can identify.
                    Return ONLY valid JSON in this exact format:
                    {
                        "books": [
                            {"title": "book title", "author": "author name", "confidence": "high/medium/low"},
                            ...
                        ]
                    }
                    If you cannot read a spine clearly, skip it. Only include books you can reasonably identify."""
                }
            ]
        }],
        response_format={"type": "json_object"}, # Force OpenAI to return JSON output and limit token usage
        max_tokens=1000
    )
    result = json.loads(response.choices[0].message.content)
    return result.get("books", [])

if __name__ == "__main__": # Only runs this block if file is executed directly
    image_path = "Example bookshelf image.jpeg" # Using a test image for now to ensure it works
    books = extract_books_from_shelf(image_path)
    print(f"Found {len(books)} books:\n")
    for book in books:
        print(f"  [{book['confidence'].upper()}] {book['title']} — {book.get('author', 'Unknown')}")