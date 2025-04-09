import os
import uuid
import shutil
import mimetypes
from pathlib import Path
from typing import List

import httpx
import requests
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from PIL import Image

os.environ.pop("SSL_CERT_FILE", None)

from ai.train.augment import run_augmentation
from ai.train.train import run_training
from ai.apply.apply_img2img import run_inference
from ai.apply.apply_text2img import run_text2img

app = FastAPI()
security = HTTPBearer()

# 외부 서버 설정
CORE_SERVER_BASE = "http://j12d103.p.ssafy.io:8081"
USER_SERVER_BASE = "http://j12d103.p.ssafy.io:8082"

# 모델 이름 매핑
name_dict = {
    "모네": 'monet',
    "동양화": "oriental_painting",
    "반 고흐": "van_gogh",
    "수채화": "watercolor",
    "한국 전통화": "korean painting",
    "일본 전통화": "japanese painting",
    "유화": "oil painting"
}


# -------------------------------
# Helper functions
# -------------------------------
async def get_user_info(authorization: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{USER_SERVER_BASE}/user", headers={"Authorization": authorization}
        )
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="유저 정보 조회에 실패했습니다.")
    data = response.json().get("data")
    if not data:
        raise HTTPException(status_code=404, detail="유저 정보를 찾을 수 없습니다.")
    return data


async def request_presigned_url(authorization: str, params: dict) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{CORE_SERVER_BASE}/image/presigned-url",
            headers={"Authorization": authorization, "accept": "application/json"},
            params=params,
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=500, detail="presigned URL 요청에 실패했습니다.")
    data = resp.json()
    if not data.get("success"):
        raise HTTPException(status_code=500, detail="presigned URL 발급 실패")
    return data["data"]


async def upload_file_to_presigned_url(authorization: str, presigned_url: str, file_path: Path, content_type: str):
    with file_path.open("rb") as f:
        file_content = f.read()
    async with httpx.AsyncClient() as client:
        resp = await client.put(
            presigned_url, content=file_content, headers={"Content-Type": content_type}
        )
    if resp.status_code not in (200, 201):
        raise HTTPException(status_code=500, detail="파일 업로드에 실패했습니다.")


def resize_image(input_path: Path, target_width: int) -> None:
    """원본 이미지의 비율을 유지하면서 가로 길이를 target_width로 리사이즈합니다."""
    try:
        with Image.open(input_path) as img:
            img = img.convert("RGB")
            original_width, original_height = img.size
            target_height = int((target_width / original_width) * original_height)
            resized_img = img.resize((target_width, target_height), Image.LANCZOS)
            resized_img.save(input_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"이미지 리사이즈 실패: {e}")


def cleanup_files_in_directory(directory_path: str):
    """지정된 디렉토리의 모든 파일을 삭제합니다."""
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


# -------------------------------
# Endpoints
# -------------------------------

# 썸네일 업로드 및 등록
@app.post("/thumnail/upload/")
async def upload_thumbnail(
    image: UploadFile = File(...),
    model_id: str = Form(...),
    strength: str = Form("0.4"),
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    authorization = f"Bearer {credentials.credentials}"
    user_info = await get_user_info(authorization)
    user_id = user_info.get("userId")

    input_dir = Path("ai/apply/input")
    input_dir.mkdir(parents=True, exist_ok=True)
    image_filename = f"{uuid.uuid4().hex}_{image.filename}"
    input_image_path = input_dir / image_filename

    with input_image_path.open("wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    # 이미지 리사이즈 (가로 1024 픽셀 기준)
    resize_image(input_image_path, target_width=1024)

    mime_type, _ = mimetypes.guess_type(input_image_path)
    if not mime_type:
        mime_type = "application/octet-stream"

    # presigned URL 요청 (원본 이미지)
    presigned_data = await request_presigned_url(
        authorization,
        params={"fileType": mime_type, "fileName": input_image_path.name, "service": "image"},
    )
    orig_presigned_url = presigned_data["presignedUrl"]
    orig_upload_filename = presigned_data["uploadFileName"]

    # 이미지 업로드
    await upload_file_to_presigned_url(authorization, orig_presigned_url, input_image_path, mime_type)

    # 이미지 메타데이터 등록
    register_payload = {
        "modelId": model_id,
        "userId": user_id,
        "isPublic": "true",
        "uploadFileName": orig_upload_filename,
    }
    async with httpx.AsyncClient() as client:
        register_resp = await client.post(
            f"{CORE_SERVER_BASE}/image/metadata", json=register_payload, headers={"Authorization": authorization}
        )
    if register_resp.status_code != 200:
        raise HTTPException(status_code=500, detail="이미지 등록에 실패했습니다.")
    register_data = register_resp.json()
    image_id = register_data["data"]["imageId"]

    # 추가 등록 요청 (썸네일 등록)
    async with httpx.AsyncClient() as client:
        update_resp = await client.post(
            f"{CORE_SERVER_BASE}/model/update/{image_id}/{model_id}",
            json=register_payload,
            headers={"Authorization": authorization},
        )
    if update_resp.status_code != 200:
        raise HTTPException(status_code=500, detail="썸네일 등록에 실패했습니다.")

    os.remove(input_image_path)

    return JSONResponse(
        content={
            "success": True,
            "data": {"original": {"imageId": image_id, "uploadFileName": orig_upload_filename}},
            "error": None,
        }
    )


# pretrained 모델 업로드
@app.post("/model/upload/")
async def upload_pretrained_model(
    model_name: str = Form(...),
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    authorization = f"Bearer {credentials.credentials}"
    user_info = await get_user_info(authorization)
    user_id = user_info.get("userId")

    model_dir = Path(f"ai/img_model/{user_id}/{model_name}")
    if not model_dir.exists() or not model_dir.is_dir():
        raise HTTPException(status_code=404, detail="해당 모델 폴더가 존재하지 않습니다.")
    zip_path = Path(f"{model_dir}.zip")
    if zip_path.exists():
        zip_path.unlink()  # 기존 zip 삭제
    shutil.make_archive(base_name=str(model_dir), format="zip", root_dir=str(model_dir))

    async with httpx.AsyncClient() as client:
        presigned_resp = await client.get(
            f"{CORE_SERVER_BASE}/model/presigned-url",
            headers={"Authorization": authorization, "accept": "application/json"},
            params={"fileType": "zip", "fileName": zip_path.name},
        )
    if presigned_resp.status_code != 200:
        raise HTTPException(status_code=500, detail="모델 presigned URL 요청에 실패했습니다.")
    presigned_data = presigned_resp.json()
    if not presigned_data.get("success"):
        raise HTTPException(status_code=500, detail="모델 presigned URL 발급 실패")
    model_presigned_url = presigned_data["data"]["presignedUrl"]
    model_upload_filename = presigned_data["data"]["uploadFileName"]

    # 모델 ZIP 업로드
    with zip_path.open("rb") as f:
        model_file_content = f.read()
    async with httpx.AsyncClient() as client:
        upload_resp = await client.put(
            model_presigned_url,
            content=model_file_content,
            headers={"Content-Type": "zip"},
        )
    if upload_resp.status_code not in (200, 201):
        raise HTTPException(status_code=500, detail="모델 업로드에 실패했습니다.")

    # 모델 메타데이터 등록
    register_payload = {
        "modelName": model_name,
        "userId": user_id,
        "isPublic": "true",
        "uploadFileName": model_upload_filename,
        "description": "",
    }
    async with httpx.AsyncClient() as client:
        reg_resp = await client.post(
            f"{CORE_SERVER_BASE}/model/metadata", json=register_payload, headers={"Authorization": authorization}
        )
    if reg_resp.status_code != 200:
        raise HTTPException(status_code=500, detail="모델 메타데이터 등록에 실패했습니다.")
    reg_data = reg_resp.json()
    model_id = reg_data.get("data", {}).get("modelId")

    return JSONResponse(
        content={"model_id": model_id, "message": "모델이 성공적으로 업로드되었습니다."}
    )


# 모델 학습 요청 (Train)
@app.post("/train/")
async def train_endpoint(
    token: str = Form(...),
    images: List[UploadFile] = File(...),
    model_name: str = Form(...),
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    authorization = f"Bearer {credentials.credentials}"
    user_info = await get_user_info(authorization)
    user_id = user_info.get("userId")

    # 디렉토리 생성
    img_dir = Path("ai/train/img")
    aug_dir = Path("ai/train/aug_img")
    model_dir = Path(f"ai/img_model/{user_id}/{model_name}")
    img_dir.mkdir(parents=True, exist_ok=True)
    aug_dir.mkdir(parents=True, exist_ok=True)
    model_dir.mkdir(parents=True, exist_ok=True)

    # 업로드된 이미지 저장
    for image in images:
        image_filename = f"{uuid.uuid4().hex}_{image.filename}"
        image_path = img_dir / image_filename
        with image_path.open("wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

    # 데이터 증강 실행 (목표: 20장)
    target_num_images = 20
    run_augmentation(input_dir=str(img_dir), output_dir=str(aug_dir), target_num_images=target_num_images)

    # 학습 실행
    run_training(image_folder=str(aug_dir), output_dir=str(model_dir), model_name=str(model_name))

    # 임시 이미지 삭제
    cleanup_files_in_directory(str(img_dir))
    cleanup_files_in_directory(str(aug_dir))

    # 학습 결과 ZIP 압축
    zip_path = f"{model_dir}.zip"
    shutil.make_archive(base_name=str(model_dir), format="zip", root_dir=str(model_dir))

    # presigned URL 요청 (모델 업로드)
    async with httpx.AsyncClient() as client:
        presigned_resp = await client.get(
            f"{CORE_SERVER_BASE}/model/presigned-url",
            headers={"Authorization": authorization, "accept": "application/json"},
            params={"fileType": "zip", "fileName": Path(zip_path).name},
        )
    if presigned_resp.status_code != 200:
        raise HTTPException(status_code=500, detail="모델 presigned URL 요청에 실패했습니다.")
    presigned_data = presigned_resp.json()
    if not presigned_data.get("success"):
        raise HTTPException(status_code=500, detail="모델 presigned URL 발급 실패")
    model_presigned_url = presigned_data["data"]["presignedUrl"]
    model_upload_filename = presigned_data["data"]["uploadFileName"]

    # 모델 업로드
    with open(zip_path, "rb") as f:
        model_file_content = f.read()
    async with httpx.AsyncClient() as client:
        upload_resp = await client.put(
            model_presigned_url,
            content=model_file_content,
            headers={"Content-Type": "zip"},
        )
    if upload_resp.status_code not in (200, 201):
        raise HTTPException(status_code=500, detail="모델 업로드에 실패했습니다.")

    # 모델 메타데이터 등록
    register_payload = {
        "modelName": model_name,
        "userId": user_id,
        "isPublic": "true",
        "uploadFileName": model_upload_filename,
        "description": "",
    }
    async with httpx.AsyncClient() as client:
        reg_resp = await client.post(
            f"{CORE_SERVER_BASE}/model/metadata", json=register_payload, headers={"Authorization": authorization}
        )
    if reg_resp.status_code != 200:
        raise HTTPException(status_code=500, detail="모델 등록에 실패했습니다.")
    reg_data = reg_resp.json()
    model_id = reg_data.get("data", {}).get("modelId")

    # FCM 알림 전송
    fcm_url = f"{USER_SERVER_BASE}/user/fcm/send"
    payload = {"token": token, "title": "모델 학습 완료", "body": "사용자님의 모델이 성공적으로 학습되었습니다!"}
    try:
        fcm_response = requests.post(fcm_url, json=payload)
        print(f"FCM 응답 코드: {fcm_response.status_code}")
    except Exception as e:
        print("FCM 전송 실패:", e)

    return JSONResponse(content={"model_id": model_id, "message": "모델이 성공적으로 생성되었습니다."})


# img2img 추론
@app.post("/apply/img2img/")
async def apply_img2img(
    image: UploadFile = File(...),
    model_id: str = Form(...),
    strength: str = Form("0.4"),
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    authorization = f"Bearer {credentials.credentials}"
    user_info = await get_user_info(authorization)
    user_id = user_info.get("userId")

    input_dir = Path("ai/apply/input")
    input_dir.mkdir(parents=True, exist_ok=True)
    image_filename = f"{uuid.uuid4().hex}_{image.filename}"
    input_image_path = input_dir / image_filename
    with input_image_path.open("wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    # 이미지 리사이즈 (가로 1024 픽셀 기준)
    resize_image(input_image_path, target_width=1024)

    # 모델 정보 조회
    async with httpx.AsyncClient() as client:
        model_info_resp = await client.get(
            f"{CORE_SERVER_BASE}/model/{model_id}/presigned-url",
            headers={"Authorization": authorization},
        )
    if model_info_resp.status_code != 200:
        raise HTTPException(status_code=500, detail="모델 정보 조회에 실패했습니다.")
    model_data = model_info_resp.json().get("data", {}).get("model")
    if not model_data:
        raise HTTPException(status_code=404, detail="모델 정보를 찾을 수 없습니다.")
    producer_id = model_data.get("userId")
    model_name = name_dict.get(model_data.get("modelName"))
    if not model_name:
        raise HTTPException(status_code=400, detail="올바르지 않은 모델명입니다.")

    # 로컬 모델 디렉토리 및 inference 실행
    model_dir = os.path.join("ai", "img_model", str(producer_id), model_name)
    if not os.path.exists(model_dir):
        raise HTTPException(status_code=404, detail="모델을 찾을 수 없습니다.")
    result_image_path = run_inference(str(input_image_path), model_dir, strength_str=strength, model_name=str(model_name))

    orig_mime_type, _ = mimetypes.guess_type(input_image_path)
    if not orig_mime_type:
        orig_mime_type = "application/octet-stream"
    presigned_orig_data = await request_presigned_url(
        authorization,
        params={"fileType": orig_mime_type, "fileName": input_image_path.name, "service": "image"},
    )
    orig_presigned_url = presigned_orig_data["presignedUrl"]
    orig_upload_filename = presigned_orig_data["uploadFileName"]

    result_mime_type, _ = mimetypes.guess_type(result_image_path)
    if not result_mime_type:
        result_mime_type = "application/octet-stream"
    presigned_result_data = await request_presigned_url(
        authorization,
        params={"fileType": result_mime_type, "fileName": Path(result_image_path).name, "service": "image"},
    )
    result_presigned_url = presigned_result_data["presignedUrl"]
    result_upload_filename = presigned_result_data["uploadFileName"]

    # 원본 이미지 업로드
    await upload_file_to_presigned_url(authorization, orig_presigned_url, input_image_path, orig_mime_type)
    # 변환 이미지 업로드
    await upload_file_to_presigned_url(authorization, result_presigned_url, Path(result_image_path), result_mime_type)

    # 이미지 메타데이터 등록 (원본, 변환 각각)
    image_ids = []
    for payload in [
        {"modelId": model_id, "userId": user_id, "isPublic": "true", "uploadFileName": orig_upload_filename},
        {"modelId": model_id, "userId": user_id, "isPublic": "true", "uploadFileName": result_upload_filename},
    ]:
        async with httpx.AsyncClient() as client:
            reg_resp = await client.post(
                f"{CORE_SERVER_BASE}/image/metadata", json=payload, headers={"Authorization": authorization}
            )
        if reg_resp.status_code != 200:
            raise HTTPException(status_code=500, detail="이미지 등록에 실패했습니다.")
        reg_data = reg_resp.json()
        image_ids.append(reg_data["data"]["imageId"])

    os.remove(input_image_path)
    # 필요시 결과 이미지도 삭제
    # os.remove(result_image_path)

    return JSONResponse(
        content={
            "success": True,
            "data": {
                "original": {"imageId": image_ids[0], "uploadFileName": orig_upload_filename},
                "result": {"imageId": image_ids[1], "uploadFileName": result_upload_filename},
            },
            "error": None,
        }
    )


# text2img 추론
@app.post("/apply/text2img/")
async def apply_text2img(
    prompt: str = Form(...),
    model_id: str = Form(...),
    strength: str = Form("0.4"),
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    authorization = f"Bearer {credentials.credentials}"
    user_info = await get_user_info(authorization)
    user_id = user_info.get("userId")

    async with httpx.AsyncClient() as client:
        model_info_resp = await client.get(
            f"{CORE_SERVER_BASE}/model/{model_id}/presigned-url", headers={"Authorization": authorization}
        )
    if model_info_resp.status_code != 200:
        raise HTTPException(status_code=500, detail="모델 정보 조회에 실패했습니다.")
    model_data = model_info_resp.json().get("data", {}).get("model")
    if not model_data:
        raise HTTPException(status_code=404, detail="모델 정보를 찾을 수 없습니다.")
    producer_id = model_data.get("userId")
    model_name = name_dict.get(model_data.get("modelName"))
    if not model_name:
        raise HTTPException(status_code=400, detail="올바르지 않은 모델명입니다.")

    model_dir = os.path.join("ai", "img_model", str(producer_id), model_name)
    if not os.path.exists(model_dir):
        raise HTTPException(status_code=404, detail="모델을 찾을 수 없습니다.")
    result_image_path = run_text2img(model_dir, prompt=str(prompt), model_name=str(model_name), strength_str=strength)

    result_mime_type, _ = mimetypes.guess_type(result_image_path)
    if not result_mime_type:
        result_mime_type = "application/octet-stream"
    presigned_result_data = await request_presigned_url(
        authorization,
        params={"fileType": result_mime_type, "fileName": Path(result_image_path).name, "service": "image"},
    )
    result_presigned_url = presigned_result_data["presignedUrl"]
    result_upload_filename = presigned_result_data["uploadFileName"]

    await upload_file_to_presigned_url(authorization, result_presigned_url, Path(result_image_path), result_mime_type)

    register_payload = {
        "modelId": model_id,
        "userId": user_id,
        "isPublic": "true",
        "uploadFileName": result_upload_filename,
    }
    async with httpx.AsyncClient() as client:
        reg_resp = await client.post(
            f"{CORE_SERVER_BASE}/image/metadata", json=register_payload, headers={"Authorization": authorization}
        )
    if reg_resp.status_code != 200:
        raise HTTPException(status_code=500, detail="이미지 등록에 실패했습니다.")
    reg_data = reg_resp.json()

    os.remove(result_image_path)

    return JSONResponse(
        content={
            "success": True,
            "data": {"uploadFileName": result_upload_filename, "imageId": reg_data["data"]["imageId"]},
            "error": None,
        }
    )
