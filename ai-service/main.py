from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    text: str

RISKY_KEYWORDS = [
    "sell your data", 
    "third parties", 
    "arbitration", 
    "waive", 
    "no refund", 
    "share with partners",
    "cancel anytime", 
    "binding arbitration"
]

@app.get("/")
def read_root():
    return {"status": "ok"}

@app.post("/analyze")
def analyze_text(request: AnalyzeRequest):
    text_lower = request.text.lower()
    
    found_clauses = []
    for keyword in RISKY_KEYWORDS:
        if keyword in text_lower:
            found_clauses.append(keyword)
            
    # Calculate risk score based on number of matches
    # Just a simple heuristic to map to 0-100
    risk_score = min(len(found_clauses) * 20, 100)
    
    # Generate exactly 3 summary strings
    summary = []
    if len(found_clauses) > 0:
        summary.append(f"Detected {len(found_clauses)} potentially risky clauses.")
        if any(k in found_clauses for k in ["arbitration", "binding arbitration", "waive"]):
            summary.append("Contains language that may require you to waive certain legal rights.")
        elif "no refund" in found_clauses:
            summary.append("Contains clauses related to no refunds.")
        else:
            summary.append("Review the identified clauses carefully.")

        if any(k in found_clauses for k in ["sell your data", "third parties", "share with partners"]):
            summary.append("Document mentions sharing or selling your data to third parties.")
        else:
            summary.append("No explicit data selling clauses found, but other risks present.")
    else:
        summary = [
            "No standard risky keywords were detected in the provided text.",
            "The document appears to be low risk based on our keyword matching.",
            "However, you should always read terms and conditions carefully before accepting."
        ]
        
    return {
        "riskScore": risk_score,
        "summary": summary,
        "riskyClauses": found_clauses
    }
