from fastapi import FastAPI

app = FastAPI()


@app.get("/fastapi")
async def root():
    return {"message": "fastapi 테스트"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}
