from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Header
from typing import List
from fastapi.responses import Response
import uuid
import httpx
from pathlib import Path
import shutil
import os
import mimetypes
os.environ.pop("SSL_CERT_FILE", None)

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

CORE_SERVER_BASE = "http://j12d103.p.ssafy.io:8081"

@app.post("/train/")
async def train_endpoint(
    images: List[UploadFile] = File(...),
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
    for image in images:
        image_filename = f"{uuid.uuid4().hex}_{image.filename}"
        image_path = img_dir / image_filename
        with image_path.open("wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

    # 데이터 증강 실행 (목표 50장)
    target_num_images = 50
    run_augmentation(input_dir=str(img_dir), output_dir=str(aug_dir), target_num_images=target_num_images)

    # 증강된 이미지로 모델 학습 실행
    run_training(image_folder=str(aug_dir), output_dir=str(model_dir), model_name=str(model_name))

    # 학습 완료 후, 이미지들이 저장된 폴더 내부의 파일만 삭제
    cleanup_files_in_directory(str(img_dir))
    cleanup_files_in_directory(str(aug_dir))
    
    # 학습된 모델 폴더를 zip으로 압축 (모델은 ai/img_model/{user_id}/{model_name} 에 저장)
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
    model_id: str = Form(...),
    producer_id: str = Form(...),
    model_name: str = Form(...),
    strength: str = Form("0.33"),
    # authorization: str = Header(...)
):
    authorization = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiYXV0aCI6IlJPTEVfVVNFUiIsImV4cCI6MTc0MzY0MjM3MH0.dTbECMukFIJIcLWpUUYXXmkVPupjKRPwdZK7M1Vwm74'
    # 업로드된 이미지를 임시 저장할 디렉토리 생성
    input_dir = Path("ai/apply/input")
    input_dir.mkdir(parents=True, exist_ok=True)
    
    # 업로드 파일 저장
    image_filename = f"{uuid.uuid4().hex}_{image.filename}"
    input_image_path = input_dir / image_filename
    with input_image_path.open("wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
    
    # # model정보 조회
    # async with httpx.AsyncClient() as client:
    #     model_info_resp = await client.get(
    #         f"{CORE_SERVER_BASE}/model/{model_id}",
    #         params={"model_id": model_id},
    #         headers={"Authorization": authorization}
    #     )
    # if model_info_resp.status_code != 200:
    #     raise HTTPException(status_code=500, detail="모델 정보 조회에 실패했습니다.")
    # model_info = model_info_resp.json().get("data")
    # if not model_info:
    #     raise HTTPException(status_code=404, detail="모델 정보를 찾을 수 없습니다.")
    # producer_id = model_info.get("user_id")
    # model_name = model_info.get("model_name")

    # 로컬 모델 디렉토리 확인 및 inference 실행
    model_dir = os.path.join("ai", "img_model", producer_id, model_name)
    if not os.path.exists(model_dir):
        raise HTTPException(status_code=404, detail="모델을 찾을 수 없습니다.")
    result_image_path = run_inference(str(input_image_path), model_dir, strength_str=strength, model_name=str(model_name))

    mime_type, _ = mimetypes.guess_type(input_image_path)
    if not mime_type:
        mime_type = "application/octet-stream"

    # Core 서버에 presigned URL 요청 (원본 이미지)
    url = f"{CORE_SERVER_BASE}/image/presigned-url"
    async with httpx.AsyncClient() as client:
        presigned_orig_resp = await client.get(
            f"{CORE_SERVER_BASE}/image/presigned-url",
            headers={"Authorization": authorization,
                     "accept": "application/json"
                     },
            params={"fileType": mime_type, "fileName": Path(input_image_path).name}
        )

    if presigned_orig_resp.status_code != 200:
        raise HTTPException(status_code=500, detail="원본 이미지 presigned URL 요청에 실패했습니다.")
    orig_presigned_data = presigned_orig_resp.json()
    if not orig_presigned_data.get("success"):
        raise HTTPException(status_code=500, detail="원본 이미지 presigned URL 발급 실패")
    orig_presigned_url = orig_presigned_data["data"]["presignedUrl"]
    orig_upload_filename = orig_presigned_data["data"]["uploadFileName"]

    # Core 서버에 presigned URL 요청 (변환 이미지)
    async with httpx.AsyncClient() as client:
        presigned_result_resp = await client.get(
            f"{CORE_SERVER_BASE}/image/presigned-url",
            headers={"Authorization": authorization,
                    "accept": "application/json"
                    },
            params={"fileType": mime_type, "fileName": Path(input_image_path).name}
        )
  
    if presigned_result_resp.status_code != 200:
        raise HTTPException(status_code=500, detail="변환 이미지 presigned URL 요청에 실패했습니다.")
    result_presigned_data = presigned_result_resp.json()
    if not result_presigned_data.get("success"):
        raise HTTPException(status_code=500, detail="변환 이미지 presigned URL 발급 실패")
    result_presigned_url = result_presigned_data["data"]["presignedUrl"]
    result_upload_filename = result_presigned_data["data"]["uploadFileName"]
   
    # presigned URL을 사용하여 원본 이미지 업로드 (HTTP PUT)
    with open(input_image_path, "rb") as f:
        orig_file_content = f.read()
    async with httpx.AsyncClient() as client:
        upload_orig_resp = await client.put(
            orig_presigned_url,
            content=orig_file_content,
            headers={"Content-Type": mime_type})
    if upload_orig_resp.status_code not in (200, 201):
        raise HTTPException(status_code=500, detail="원본 이미지 업로드에 실패했습니다.")
   
    # presigned URL을 사용하여 변환 이미지 업로드 (HTTP PUT)
    with open(result_image_path, "rb") as f:
        result_file_content = f.read()
    async with httpx.AsyncClient() as client:
        upload_result_resp = await client.put(
            result_presigned_url, 
            content=result_file_content,
            headers={"Content-Type": mime_type})
    if upload_result_resp.status_code not in (200, 201):
        raise HTTPException(status_code=500, detail="변환 이미지 업로드에 실패했습니다.")
   
    # Core 서버에 업로드 완료 등록 요청
    register_payloads = [{
        "modelId": model_id,
        "userId": user_id,
        "isPublic": "true",
        "uploadFileName": orig_upload_filename
    },
    {
        "modelId": model_id,
        "userId": user_id,
        "isPublic": "true",
        "uploadFileName": result_upload_filename
    }]
    
    for register_payload in register_payloads:
        async with httpx.AsyncClient() as client:
            register_resp = await client.post(
                f"{CORE_SERVER_BASE}/image/metadata",
                json=register_payload,
                headers={"Authorization": authorization}
            )
        if register_resp.status_code != 200:
            raise HTTPException(status_code=500, detail="이미지 등록에 실패했습니다.")
        register_data = register_resp.json()

    # 원본 이미지와 변환 이미지 각각을 읽어 multipart 메시지 구성
    boundary = "myboundary"
    parts = []
    
    # 원본 이미지 파트
    with open(input_image_path, "rb") as f:
        orig_data = f.read()
    orig_filename = Path(input_image_path).name
    parts.append(f"--{boundary}\r\n".encode())
    parts.append(f'Content-Disposition: form-data; name="original_image"; filename="{orig_filename}"\r\n'.encode())
    parts.append(b"Content-Type: image/jpeg\r\n\r\n")
    parts.append(orig_data)
    parts.append(b"\r\n")
    
    # 추론 이미지 파트
    with open(result_image_path, "rb") as f:
        result_data = f.read()
    result_filename = Path(result_image_path).name
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
    
    # multipart 응답 전송
    headers = {"Content-Type": f"multipart/mixed; boundary={boundary}"}
    return Response(content=body, headers=headers)