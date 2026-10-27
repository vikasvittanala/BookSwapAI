# BookSwapAI
**BookSwapAI** is a web app for readers to find and swap physical books with fellow users using AI.

<img width="800" height="450" alt="BookSwap demo gif" src="https://github.com/user-attachments/assets/fe65faff-f450-480a-a118-d0b56b2228f2" />

[![Watch the demo](https://img.youtube.com/vi/Bdejzmm-V0s/hqdefault.jpg)](https://www.youtube.com/watch?v=Bdejzmm-V0s)

⬆️ **Click above to watch the 1-min walkthrough**

**Live site:** https://book-swap-ai.vercel.app

## Features

Bookshelf scanner

- Users upload an image of their bookshelf, which is processed using GPT-4o Vision to quickly identify what books they currently own.

Book metadata enrichment

- Identified books are then enriched using Google Books API. Matches are supplemented with metadata like page count, thumbnails, and price.

Search books and swap requests
  
- Users can search other readers' shelves and propose swaps, including multi-book offers.

Contact reveal on acceptance
  
- Once a swap is accepted, both users can see each other's Telegram handle to arrange the meetup.

## Tech Stack

React · Tailwind CSS · FastAPI · Supabase · OpenAI GPT-4o Vision · Google Books API

## Contact

Vikas Vittanala

- LinkedIn: [linkedin.com/in/vikas-vittanala](https://www.linkedin.com/in/vikas-vittanala)
- Email: sonu.vikas.v@gmail.com
