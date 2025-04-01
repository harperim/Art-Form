from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.responses import Response
import uuid
from pathlib import Path
from PIL import Image
import shutil
import os

from ai.train.augment import run_augmentation
from ai.train.train import run_training
from ai.apply.apply import run_inference


def cleanup_files_in_directory(directory_path):
    if os.path.exists(directory_path):
        for filename in os.listdir(directory_path):
            file_path = os.path.join(directory_path, filename)
            try:
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    os.remove(file_path)
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
            except Exception as e:
                print(f"파일 삭제 실패: {file_path}. 이유: {e}")


app = FastAPI()

@app.post("/train/")
async def train_endpoint(
    image: UploadFile = File(...),
    user_id: str = Form(...),
    model_name: str = Form(...)
):
    # 디렉토리 설정
    img_dir = Path("ai/train/img")
    aug_dir = Path("ai/train/aug_img")
    model_dir = Path(f"ai/img_model/{user_id}/{model_name}")

    img_dir.mkdir(parents=True, exist_ok=True)
    aug_dir.mkdir(parents=True, exist_ok=True)
    model_dir.mkdir(parents=True, exist_ok=True)

    # 업로드된 이미지를 ai/train/img에 저장
    image_filename = f"{uuid.uuid4().hex}_{image.filename}"
    image_path = img_dir / image_filename
    with image_path.open("wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    # 데이터 증강 실행 (목표 50장)
    target_num_images = 50
    run_augmentation(input_dir=str(img_dir), output_dir=str(aug_dir), target_num_images=target_num_images)

    # 증강된 이미지로 모델 학습 실행
    run_training(image_folder=str(aug_dir), output_dir=str(model_dir))

    # 학습 완료 후, 이미지들이 저장된 폴더 내부의 파일만 삭제
    cleanup_files_in_directory(str(img_dir))
    cleanup_files_in_directory(str(aug_dir))
    
    # 학습된 모델 폴더를 zip으로 압축 (모델은 ai/img_model/{user_id}/{model_name} 에 저장됨)
    zip_path = f"{model_dir}.zip"
    shutil.make_archive(base_name=str(model_dir), format="zip", root_dir=str(model_dir))
    
    # multipart 응답 바디 구성 (각 파트: user_id와 모델 zip 파일)
    boundary = "myboundary"
    parts = []
    
    # user_id 파트 추가
    parts.append(f"--{boundary}\r\n".encode())
    parts.append(b'Content-Disposition: form-data; name="user_id"\r\n\r\n')
    parts.append(user_id.encode())
    parts.append(b"\r\n")
    
    # 모델 zip 파일 파트 추가
    with open(zip_path, "rb") as f:
        zip_data = f.read()
    zip_filename = f"{model_name}.zip"
    parts.append(f"--{boundary}\r\n".encode())
    parts.append(f'Content-Disposition: form-data; name="model_zip"; filename="{zip_filename}"\r\n'.encode())
    parts.append(b"Content-Type: application/zip\r\n\r\n")
    parts.append(zip_data)
    parts.append(b"\r\n")
    
    # 종료 boundary 추가
    parts.append(f"--{boundary}--\r\n".encode())
    body = b"".join(parts)
    
    headers = {"Content-Type": f"multipart/mixed; boundary={boundary}"}
    return Response(content=body, headers=headers)


@app.post("/apply/")
async def apply_endpoint(
    image: UploadFile = File(...),
    user_id: str = Form(...),
    producer_id: str = Form(...),
    model_name: str = Form(...),
    strength: str = Form("0.33")
):
 
    # 업로드된 이미지를 임시 저장할 디렉토리 생성 (예: ai/apply/input)
    input_dir = Path("ai/apply/input")
    input_dir.mkdir(parents=True, exist_ok=True)
    
    # 업로드 파일 저장
    image_filename = f"{uuid.uuid4().hex}_{image.filename}"
    input_image_path = input_dir / image_filename
    with input_image_path.open("wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
    
    # 사용할 모델 디렉토리 (ai/img_model/{producer_id}/{model_name})
    model_dir = os.path.join("ai", "img_model", producer_id, model_name)
    if not os.path.exists(model_dir):
        raise HTTPException(status_code=404, detail="모델을 찾을 수 없습니다.")
    
    # inference 실행: 추론 결과 이미지 경로 반환
    result_image_path = run_inference(str(input_image_path), model_dir, strength_str=strength)
    
    # multipart 응답 바디 구성 (각 파트: user_id, 원본 이미지, 결과 이미지)
    boundary = "myboundary"
    parts = []
    
    # user_id 파트
    parts.append(f"--{boundary}\r\n".encode())
    parts.append(b'Content-Disposition: form-data; name="user_id"\r\n\r\n')
    parts.append(user_id.encode())
    parts.append(b"\r\n")
    
    # 원본 이미지 파트
    with open(input_image_path, "rb") as f:
        original_data = f.read()
    orig_filename = Path(input_image_path).name
    # 파일 확장자에 따라 content-type 지정 (jpg)
    parts.append(f"--{boundary}\r\n".encode())
    parts.append(f'Content-Disposition: form-data; name="original_image"; filename="{orig_filename}"\r\n'.encode())
    parts.append(b"Content-Type: image/jpeg\r\n\r\n")
    parts.append(original_data)
    parts.append(b"\r\n")
    
    # 추론 결과 이미지 파트
    with open(result_image_path, "rb") as f:
        result_data = f.read()
    result_filename = Path(result_image_path).name
    # 결과 이미지는 jpg로
    parts.append(f"--{boundary}\r\n".encode())
    parts.append(f'Content-Disposition: form-data; name="result_image"; filename="{result_filename}"\r\n'.encode())
    parts.append(b"Content-Type: image/jpeg\r\n\r\n")
    parts.append(result_data)
    parts.append(b"\r\n")
    
    # multipart 종료
    parts.append(f"--{boundary}--\r\n".encode())
    body = b"".join(parts)
    
    # 임시 파일 삭제
    os.remove(input_image_path)
    os.remove(result_image_path)
    
    headers = {"Content-Type": f"multipart/mixed; boundary={boundary}"}
    return Response(content=body, headers=headers)