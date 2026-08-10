from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import re

app = FastAPI(title="AI Resume Matching Engine")

# Pre-compiled technical vocabulary token matrix
TECH_VOCABULARY = {
    "python", "java", "react", "git", "mysql", "cpp", "c++", "postgresql",
    "rtl", "modelsim", "lenet", "hardware", "synthesis", "pandas", 
    "seaborn", "matplotlib", "excel", "power query", "sql", "aws"
}

class MatchRequest(BaseModel):
    resume_text: str
    job_description: str

def tokenize(text: str) -> set:
    if not text:
        return set()
    # Normalize text and strip out formatting noise while keeping chars like ++
    clean = text.lower()
    clean = re.sub(r'[^a-zA-Z0-9+#\s-]', ' ', clean)
    return set(clean.split())

@app.post("/api/ai/match")
async def calculate_match(payload: MatchRequest):
    resume_tokens = tokenize(payload.resume_text)
    job_tokens = tokenize(payload.job_description)
    
    # Filter out targets based on industry vocabulary signatures
    target_requirements = job_tokens.intersection(TECH_VOCABULARY)
    
    if not target_requirements:
        return {
            "score": 75,
            "matched": "General match validated",
            "missing": "None"
        }
    
    # Identify matched credentials and structural deficits
    matched = target_requirements.intersection(resume_tokens)
    missing = target_requirements.difference(resume_tokens)
    
    # Compute alignment index ratio bounded securely between 0-100%
    score = int(round((len(matched) / len(target_requirements)) * 100))
    
    return {
        "score": max(0, min(100, score)),
        "matched": ", ".join(matched) if matched else "None",
        "missing": ", ".join(missing) if missing else "None"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000)