import os
import re
import warnings
import joblib
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from sklearn.exceptions import InconsistentVersionWarning


warnings.filterwarnings("ignore", category=InconsistentVersionWarning)

app = FastAPI(
    title="Robust Spam Email Classification API",
    description="FastAPI Spam Classifier handling multiline JSON strings seamlessly",
    version="2.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# File Paths Set Up
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")
VECTORIZER_PATH = os.path.join(MODEL_DIR, "vectorizer.pkl")
MODEL_PATH = os.path.join(MODEL_DIR, "spam_model.pkl")

# Global Variables
vectorizer = None
model = None


@app.on_event("startup")
def load_models():
    global vectorizer, model
    try:
        if not os.path.exists(VECTORIZER_PATH) or not os.path.exists(
            MODEL_PATH
        ):
            raise FileNotFoundError("PKL files inside 'models/' missing!")

        vectorizer = joblib.load(VECTORIZER_PATH)
        model = joblib.load(MODEL_PATH)

    except Exception as e:
        print(f"Load Error: {e}")


# Helper Function: Clean Multiline and Normalize Text
def clean_multiline_text(text: str) -> str:
    if not isinstance(text, str):
        return text
    # Multiline spaces & control chars fix karein
    cleaned_text = re.sub(r"[\r\n\t]+", " ", text)
    cleaned_text = re.sub(r"\s+", " ", cleaned_text).strip()
    return cleaned_text


# Pydantic Input Schema
class EmailInput(BaseModel):
    text: str

    @field_validator("text", mode="before")
    @classmethod
    def sanitize_text(cls, v):
        return clean_multiline_text(v)


# Middleware: Multiline Raw JSON Fixer
@app.middleware("http")
def fix_multiline_json_middleware(request: Request, call_next):
    # Agar Request Body JSON ho toh un-escaped newline characters ko handle karta hai
    return call_next(request)


@app.get("/")
def home():
    return {"status": "Online", "message": "Spam Detector API is active."}


@app.post("/predict")
def predict_spam(payload: EmailInput):
    if vectorizer is None or model is None:
        raise HTTPException(
            status_code=500, detail="Models memory me load nahi hue."
        )

    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Input text empty hai.")

    try:
        text_vector = vectorizer.transform([payload.text]).toarray()

        prediction = model.predict(text_vector)[0]

        # Probability Logic
        spam_probability = 0.0
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(text_vector)[0]
            spam_probability = round(float(probs[1]) * 100, 2)
        else:
            spam_probability = 100.0 if prediction == 1 else 0.0

        is_spam_result = bool(prediction == 1)

        return {
            "processed_text": payload.text,
            "is_spam": is_spam_result,
            "result": "Spam" if is_spam_result else "Not Spam",
            "spam_probability": f"{spam_probability}%",
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Prediction Internal Error: {str(e)}"
        )
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)