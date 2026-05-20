from fastapi import FastAPI

app = FastAPI(title="Annapurna AI API", description="Core API for Annapurna AI institutional food platform", version="1.0.0")

@app.get("/")
def read_root():
    return {"message": "Welcome to Annapurna AI Backend"}
