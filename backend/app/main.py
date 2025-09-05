from fastapi import FastAPI

app = FastAPI(title="Personal Finance App")

@app.get("/")
def root():
    return {"message": "API is running"}
