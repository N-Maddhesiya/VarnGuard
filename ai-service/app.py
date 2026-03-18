from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline
import re
import warnings

# Suppress warnings from transformers cache
warnings.filterwarnings("ignore")

app = FastAPI()

print("Loading summarization model... (this may take a moment)")
try:
    # Use a smaller model for faster inference and lower memory usage
    summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    summarizer = None


class AnalyzeRequest(BaseModel):
    text: str


RISKY_CLAUSES = [
    "data selling",
    "sell your data",
    "sell your personal information",
    "forced arbitration",
    "waive class action",
    "share with third parties",
    "share your personal information with third parties",
    "perpetual license",
    "irrevocable license",
    "auto-renewal",
    "automatic renewal"
]


def detect_risky_clauses(text: str):
    text_lower = text.lower()
    found_clauses = []
    score = 10  # Base risk score

    for clause in RISKY_CLAUSES:
        # Simple string matching, could be upgraded to regex if needed
        if clause in text_lower:
            found_clauses.append(clause)
            score += 25

    # Cap score at 100
    final_score = min(score, 100)
    return final_score, found_clauses


def generate_summary(text: str):
    if not summarizer:
        return ["Model not loaded. Summarization unavailable."]

    try:
        # Approximate token limit. distilbart-cnn-12-6 has a max length of 1024.
        # 1 token is roughly 4 chars. We truncate safely to avoid token index errors.
        max_chars = 1024 * 3 
        truncated_text = text[:max_chars]
        
        # Determine max_length for the summarizer. Needs to be less than input length.
        input_length = len(truncated_text.split())
        calc_max_length = min(130, max(30, int(input_length * 0.5)))
        calc_min_length = min(30, max(10, int(calc_max_length * 0.3)))

        if input_length < 20: # text too short
            return ["Provided text is too short to summarize adequately."]

        summary_out = summarizer(
            truncated_text, 
            max_length=calc_max_length, 
            min_length=calc_min_length, 
            do_sample=False
        )
        
        summary_text = summary_out[0]['summary_text'].strip()
        
        # Split by periods to form bullet points. Get best 3.
        sentences = [s.strip() + "." for s in summary_text.split('.') if len(s.strip()) > 10]
        
        if not sentences:
            return [summary_text]
            
        return sentences[:3]
        
    except Exception as e:
        print(f"Summarization error: {e}")
        return ["An error occurred while generating the summary."]


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "VarnGuard AI Service"}


@app.post("/analyze")
def analyze_text(request: AnalyzeRequest):
    if not request.text or len(request.text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    text = request.text
    
    risk_score, clauses = detect_risky_clauses(text)
    summary_bullets = generate_summary(text)

    return {
        "riskScore": risk_score,
        "summary": summary_bullets,
        "riskyClause": clauses
    }
