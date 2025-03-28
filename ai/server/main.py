# server/main.py

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
import uuid
from pathlib import Path
from PIL import Image
import shutil
import sys
sys.path.append("../LoRA")

from apply_api import run_inference  # apply.py에 추론 로직이 있다고 가정

app = FastAPI()

@app.post("/infer/")
async def infer(
    image: UploadFile = File(...),
    producer_id: str = Form(...),
    model_name: str = Form(...)
):
    # 저장 경로 설정
    model_dir = Path(f"./LoRA/{producer_id}/{model_name}")
    if not model_dir.exists():
        raise HTTPException(status_code=404, detail="모델 경로가 존재하지 않음")

    # 이미지 저장
    input_filename = f"input_{uuid.uuid4()}.png"
    with open(input_filename, "wb") as f:
        shutil.copyfileobj(image.file, f)

    # 추론 실행
    output_filename = f"output_{uuid.uuid4()}.png"
    run_inference(input_filename, output_filename, model_dir)

    return FileResponse(output_filename, media_type="image/png")
