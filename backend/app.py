from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from summarizer import FinancialSummarizer
import requests
from bs4 import BeautifulSoup
import uvicorn

app = FastAPI(title="Financial Intelligence Summarizer API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize summarizer
print("Starting Summarizer Optimization...")
try:
    summarizer = FinancialSummarizer()
    print("Summarizer Ready.")
except Exception as e:
    print(f"CRITICAL ERROR LOADING SUMMARIZER: {str(e)}")
    import traceback
    traceback.print_exc()
    summarizer = None

class SummarizeRequest(BaseModel):
    text: str = ""
    url: str = ""
    num_sentences: int = 4

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Financial Intelligence Summarizer API is running"}

@app.post("/summarize")
def summarize_text(req: SummarizeRequest):
    content = ""
    
    if req.url:
        try:
            print(f"Scraping {req.url}...")
            # Use headers to mimic a real browser for scraping
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = requests.get(req.url, headers=headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            # Extract content from paragraphs
            paragraphs = soup.find_all('p')
            content = " ".join([p.get_text() for p in paragraphs if len(p.get_text()) > 20])
            
            if not content:
                raise HTTPException(status_code=400, detail="Could not extract meaningful content from the URL")
                
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to scrape URL: {str(e)}")
    else:
        content = req.text
        
    if not content:
        raise HTTPException(status_code=400, detail="Either text or url must be provided")

    try:
        summary = summarizer.summarize(content, num_sentences=req.num_sentences)
        return {
            "summary": summary,
            "original_length": len(content),
            "summary_points": len(summary)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
