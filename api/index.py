from fastapi import FastAPI

app = FastAPI()

@app.get("/api/test")
@app.get("/test")
def test():
    return {"status": "ok", "message": "FastAPI is running on Vercel"}

@app.get("/docs")
def docs_redirect():
    return {"status": "docs_ok"}
