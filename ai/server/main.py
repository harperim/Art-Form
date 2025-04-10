from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Header, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
from fastapi.responses import Response, JSONResponse
import uuid
import httpx
from pathlib import Path
import shutil
import os
import mimetypes
from PIL import Image
os.environ.pop("SSL_CERT_FILE", None)
import requests
from ai.train.augment import run_augmentation
from ai.train.train import run_training
from ai.apply.apply_img2img import run_inference
from ai.apply.apply_text2img import run_text2img

security = HTTPBearer()

name_dict = {
    "모네": 'monet',
    "동양화": "oriental_painting",
    "반 고흐": "van_gogh",
    "수채화": "watercolor",
    "한국 전통화": "korean painting",
    "일본 전통화": "japanese painting",
    "유화": "oil painting",
    "픽셀 아트": "pixel art"
}


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
USER_SERVER_BASE = "http://j12d103.p.ssafy.io:8082"


@app.post("/thumnail/upload/")
async def apply_endpoint(
    image: UploadFile = File(...),
    model_id: str = Form(...),
    strength: str = Form("0.4"),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    Authorization = f"Bearer {credentials.credentials}"
    # user정보 조회
    async with httpx.AsyncClient() as client:
        user_info_resp = await client.get(
            f"{USER_SERVER_BASE}/user",
            headers={"Authorization": Authorization}
        )
    if user_info_resp.status_code != 200:
        raise HTTPException(status_code=500, detail="유저 정보 조회에 실패했습니다.")
    user_info = user_info_resp.json().get("data")
    if not user_info:
        raise HTTPException(status_code=404, detail="유저 정보를 찾을 수 없습니다.")
    user_id = user_info.get("userId")

    # 업로드된 이미지를 임시 저장할 디렉토리 생성
    input_dir = Path("ai/apply/input")
    input_dir.mkdir(parents=True, exist_ok=True)
    
    # 업로드 파일 저장
    image_filename = f"{uuid.uuid4().hex}_{image.filename}"
    input_image_path = input_dir / image_filename
    with input_image_path.open("wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    try:
        with Image.open(input_image_path) as img:
            img = img.convert("RGB")
            original_width, original_height = img.size
            
            # 정사각형으로 크롭하기 위해 더 짧은 변의 길이를 기준으로 설정
            min_side = min(original_width, original_height)
            
            # 이미지 중앙을 기준으로 크롭할 영역 계산
            left = (original_width - min_side) // 2
            top = (original_height - min_side) // 2
            right = left + min_side
            bottom = top + min_side
            
            # 이미지 크롭
            square_img = img.crop((left, top, right, bottom))
            
            # 필요하다면 리사이징 (1024x1024로 예시)
            target_size = 1024
            resized_img = square_img.resize((target_size, target_size), Image.LANCZOS)
            
            # 저장
            resized_img.save(input_image_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"이미지 정사각형 크롭 실패: {e}")

    mime_type, _ = mimetypes.guess_type(input_image_path)
    if not mime_type:
        mime_type = "application/octet-stream"

    # Core 서버에 presigned URL 요청
    async with httpx.AsyncClient() as client:
        presigned_orig_resp = await client.get(
            f"{CORE_SERVER_BASE}/image/presigned-url",
            headers={"Authorization": Authorization,
                     "accept": "application/json"
                     },
            params={"fileType": mime_type, "fileName": Path(input_image_path).name, "service": "image"}
        )

    if presigned_orig_resp.status_code != 200:
        raise HTTPException(status_code=500, detail="원본 이미지 presigned URL 요청에 실패했습니다.")
    orig_presigned_data = presigned_orig_resp.json()
    if not orig_presigned_data.get("success"):
        raise HTTPException(status_code=500, detail="원본 이미지 presigned URL 발급 실패")
    orig_presigned_url = orig_presigned_data["data"]["presignedUrl"]
    orig_upload_filename = orig_presigned_data["data"]["uploadFileName"]
   
    # presigned URL을 사용하여 이미지 업로드 (HTTP PUT)
    with open(input_image_path, "rb") as f:
        orig_file_content = f.read()
    async with httpx.AsyncClient() as client:
        upload_orig_resp = await client.put(
            orig_presigned_url,
            content=orig_file_content,
            headers={"Content-Type": mime_type})
    if upload_orig_resp.status_code not in (200, 201):
        raise HTTPException(status_code=500, detail="원본 이미지 업로드에 실패했습니다.")
   
    # Core 서버에 업로드 완료 등록 요청
    register_payload = {
        "modelId": model_id,
        "userId": user_id,
        "uploadFileName": orig_upload_filename
    }

    async with httpx.AsyncClient() as client:
        register_resp = await client.post(
            f"{CORE_SERVER_BASE}/image/metadata",
            json=register_payload,
            headers={"Authorization": Authorization}
        )
    if register_resp.status_code != 200:
        raise HTTPException(status_code=500, detail="이미지 등록에 실패했습니다.")
    register_data = register_resp.json()
    image_id = (register_data["data"]["imageId"])
    print(image_id)
    async with httpx.AsyncClient() as client:
        register_resp = await client.post(
            f"{CORE_SERVER_BASE}/model/update/{model_id}/{image_id}",
            json=register_payload,
            headers={"Authorization": Authorization}
        )
    if register_resp.status_code != 200:
        raise HTTPException(status_code=500, detail="썸네일일 등록에 실패했습니다.")
    register_data = register_resp.json()
    
    # 임시 파일 삭제
    os.remove(input_image_path)

    return JSONResponse(content={
        "success": True,
        "data": {
            "original": {
                "imageId": image_id,
                "uploadFileName": orig_upload_filename
            }
        },
        "error": None
    })

@app.post("/model/upload/")
async def upload_pretrained_model(
    model_name: str = Form(...),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    authorization = f"Bearer {credentials.credentials}"

    # 사용자 정보 조회
    async with httpx.AsyncClient() as client:
        user_info_resp = await client.get(
            f"{USER_SERVER_BASE}/user",
            headers={"Authorization": authorization}
        )
    if user_info_resp.status_code != 200:
        raise HTTPException(status_code=500, detail="유저 정보 조회에 실패했습니다.")
    user_info = user_info_resp.json().get("data")
    if not user_info:
        raise HTTPException(status_code=404, detail="유저 정보를 찾을 수 없습니다.")
    user_id = user_info.get("userId")

    # 모델 폴더 경로 및 ZIP 경로 지정
    model_dir = Path(f"ai/img_model/{user_id}/{model_name}")
    if not model_dir.exists() or not model_dir.is_dir():
        raise HTTPException(status_code=404, detail="해당 모델 폴더가 존재하지 않습니다.")
    
    zip_path = Path(f"{model_dir}.zip")

    # 모델 폴더를 ZIP으로 압축
    if zip_path.exists():
        zip_path.unlink()  # 기존 zip파일이 있으면 삭제
    shutil.make_archive(base_name=str(model_dir), format="zip", root_dir=str(model_dir))

    # presigned URL 요청
    async with httpx.AsyncClient() as client:
        presigned_model_resp = await client.get(
            f"{CORE_SERVER_BASE}/model/presigned-url",
            headers={
                "Authorization": authorization,
                "accept": "application/json"
            },
            params={"fileType": "zip", "fileName": zip_path.name}
        )
    if presigned_model_resp.status_code != 200:
        raise HTTPException(status_code=500, detail="모델 presigned URL 요청에 실패했습니다.")
    
    presigned_data = presigned_model_resp.json()
    if not presigned_data.get("success"):
        raise HTTPException(status_code=500, detail="모델 presigned URL 발급 실패")

    model_presigned_url = presigned_data["data"]["presignedUrl"]
    model_upload_filename = presigned_data["data"]["uploadFileName"]

    # 모델 zip파일 PUT 요청으로 업로드
    with open(zip_path, "rb") as f:
        model_file_content = f.read()

    async with httpx.AsyncClient() as client:
        upload_resp = await client.put(
            model_presigned_url,
            content=model_file_content,
            headers={"Content-Type": "zip"}
        )
    if upload_resp.status_code not in (200, 201):
        raise HTTPException(status_code=500, detail="모델 업로드에 실패했습니다.")

    # Core 서버에 모델 메타데이터 등록
    register_payload = {
        "modelName": model_name,
        "userId": user_id,
        "isPublic": "true",
        "uploadFileName": model_upload_filename,
        "description": ""
    }
    async with httpx.AsyncClient() as client:
        register_resp = await client.post(
            f"{CORE_SERVER_BASE}/model/metadata",
            json=register_payload,
            headers={"Authorization": authorization}
        )
    if register_resp.status_code != 200:
        raise HTTPException(status_code=500, detail="모델 메타데이터 등록에 실패했습니다.")

    register_data = register_resp.json()
    model_id = register_data.get("data", {}).get("modelId")

    return JSONResponse(
        content={
            "model_id": model_id,
            "message": "모델이 성공적으로 업로드되었습니다."
        }
    )


@app.post("/train/")
async def train_endpoint(
    token: str = Form(...),
    images: List[UploadFile] = File(...),
    model_name: str = Form(...),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    Authorization = f"Bearer {credentials.credentials}"
    # user정보 조회
    async with httpx.AsyncClient() as client:
        user_info_resp = await client.get(
            f"{USER_SERVER_BASE}/user",
            headers={"Authorization": Authorization}
        )
    if user_info_resp.status_code != 200:
        raise HTTPException(status_code=500, detail="유저 정보 조회에 실패했습니다.")
    user_info = user_info_resp.json().get("data")
    if not user_info:
        raise HTTPException(status_code=404, detail="유저저 정보를 찾을 수 없습니다.")
    user_id = user_info.get("userId")

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

    # 데이터 증강 실행 (목표 20장)
    # LoRA는 데이터 효율성이 좋아서 20장 정도가 적당하다.
    target_num_images = 20
    run_augmentation(input_dir=str(img_dir), output_dir=str(aug_dir), target_num_images=target_num_images)

    # 증강된 이미지로 모델 학습 실행
    run_training(image_folder=str(aug_dir), output_dir=str(model_dir), model_name=str(model_name))

    # 학습 완료 후, 이미지들이 저장된 폴더 내부의 파일만 삭제
    cleanup_files_in_directory(str(img_dir))
    cleanup_files_in_directory(str(aug_dir))
    
    # 학습된 모델 폴더를 zip으로 압축 (모델은 ai/img_model/{user_id}/{model_name} 에 저장)
    zip_path = f"{model_dir}.zip"
    shutil.make_archive(base_name=str(model_dir), format="zip", root_dir=str(model_dir))

    # Core 서버에 presigned URL 요청 (모델 업로드)
    url = f"{CORE_SERVER_BASE}/model/presigned-url"
    async with httpx.AsyncClient() as client:
        presigned_model_resp = await client.get(
            f"{CORE_SERVER_BASE}/model/presigned-url",
            headers={"Authorization": Authorization,
                     "accept": "application/json"
                     },
            params={"fileType": "zip", "fileName": Path(zip_path).name}
        )

    if presigned_model_resp.status_code != 200:
        raise HTTPException(status_code=500, detail="모델 presigned URL 요청에 실패했습니다.")
    orig_presigned_data = presigned_model_resp.json()
    if not orig_presigned_data.get("success"):
        raise HTTPException(status_code=500, detail="모델 presigned URL 발급 실패")
    model_presigned_url = orig_presigned_data["data"]["presignedUrl"]
    model_upload_filename = orig_presigned_data["data"]["uploadFileName"]

    # presigned URL을 사용하여 모델 업로드 (HTTP PUT)
    with open(zip_path, "rb") as f:
        model_file_content = f.read()
    async with httpx.AsyncClient() as client:
        upload_orig_resp = await client.put(
            model_presigned_url,
            content=model_file_content,
            headers={"Content-Type": "zip"})
    if upload_orig_resp.status_code not in (200, 201):
        raise HTTPException(status_code=500, detail="모델 업로드에 실패했습니다.")
    
    # Core 서버에 업로드 완료 등록 요청
    register_payload = {
        "modelName": model_name,
        "userId": user_id,
        "isPublic": "true",
        "uploadFileName": model_upload_filename,
        'description': ""
    }
    
    
    async with httpx.AsyncClient() as client:
        register_resp = await client.post(
            f"{CORE_SERVER_BASE}/model/metadata",
            json=register_payload,
            headers={"Authorization": Authorization}
        )
    if register_resp.status_code != 200:
        raise HTTPException(status_code=500, detail="모델 등록에 실패했습니다.")
    register_data = register_resp.json()
    model_id = register_data.get("data", {}).get("modelId")
    
    # FCM 알림 전송
    url = f"{USER_SERVER_BASE}/user/fcm/send"
    payload = {
        "token": token,
        "title": "모델 학습 완료",
        "body": "사용자님의 모델이 성공적으로 학습되었습니다!"
    }
    try:
        fcm_response = requests.post(url, json=payload)
        print(f"FCM 응답 코드: {fcm_response.status_code}")
    except Exception as e:
        print("FCM 전송 실패:", e)

    return JSONResponse(
        content={
            "model_id": model_id,
            "message": "모델이 성공적으로 생성되었습니다."
        }
    )

# img2img 추론
@app.post("/apply/img2img/")
async def apply_endpoint(
    image: UploadFile = File(...),
    model_id: str = Form(...),
    strength: str = Form("0.4"),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    Authorization = f"Bearer {credentials.credentials}"
    # user정보 조회
    async with httpx.AsyncClient() as client:
        user_info_resp = await client.get(
            f"{USER_SERVER_BASE}/user",
            headers={"Authorization": Authorization}
        )
    if user_info_resp.status_code != 200:
        raise HTTPException(status_code=500, detail="유저 정보 조회에 실패했습니다.")
    user_info = user_info_resp.json().get("data")
    if not user_info:
        raise HTTPException(status_code=404, detail="유저 정보를 찾을 수 없습니다.")
    user_id = user_info.get("userId")

    # 업로드된 이미지를 임시 저장할 디렉토리 생성
    input_dir = Path("ai/apply/input")
    input_dir.mkdir(parents=True, exist_ok=True)
    
    # 업로드 파일 저장
    image_filename = f"{uuid.uuid4().hex}_{image.filename}"
    input_image_path = input_dir / image_filename
    with input_image_path.open("wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    # 이미지 리사이즈
    try:
        with Image.open(input_image_path) as img:
            img = img.convert("RGB")
            original_width, original_height = img.size
            target_width = 1024
            target_height = int((target_width / original_width) * original_height)
            resized_img = img.resize((target_width, target_height), Image.LANCZOS)
            resized_img.save(input_image_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"이미지 리사이즈 실패: {e}")

    # model정보 조회
    async with httpx.AsyncClient() as client:
        model_info_resp = await client.get(
            f"{CORE_SERVER_BASE}/model/{model_id}/presigned-url",
            # params={"model_id": model_id},
            headers={"Authorization": Authorization}
        )
    if model_info_resp.status_code != 200:
        raise HTTPException(status_code=500, detail="모델 정보 조회에 실패했습니다.")
    model_info = model_info_resp.json().get("data").get("model")
    if not model_info:
        raise HTTPException(status_code=404, detail="모델 정보를 찾을 수 없습니다.")
    producer_id = model_info.get("userId")
    model_name = name_dict[model_info.get("modelName")]

    # 로컬 모델 디렉토리 확인 및 inference 실행
    model_dir = os.path.join("ai", "img_model", str(producer_id), model_name)
    if not os.path.exists(model_dir):
        raise HTTPException(status_code=404, detail="모델을 찾을 수 없습니다.")
    result_image_path = run_inference(str(input_image_path), model_dir, strength_str=strength, model_name=str(model_name))

    mime_type, _ = mimetypes.guess_type(input_image_path)
    if not mime_type:
        mime_type = "application/octet-stream"

    # # Core 서버에 presigned URL 요청 (원본 이미지)
    # async with httpx.AsyncClient() as client:
    #     presigned_orig_resp = await client.get(
    #         f"{CORE_SERVER_BASE}/image/presigned-url",
    #         headers={"Authorization": Authorization,
    #                  "accept": "application/json"
    #                  },
    #         params={"fileType": mime_type, "fileName": Path(input_image_path).name, "service": "image"}
    #     )

    # if presigned_orig_resp.status_code != 200:
    #     raise HTTPException(status_code=500, detail="원본 이미지 presigned URL 요청에 실패했습니다.")
    # orig_presigned_data = presigned_orig_resp.json()
    # if not orig_presigned_data.get("success"):
    #     raise HTTPException(status_code=500, detail="원본 이미지 presigned URL 발급 실패")
    # orig_presigned_url = orig_presigned_data["data"]["presignedUrl"]
    # orig_upload_filename = orig_presigned_data["data"]["uploadFileName"]

    result_mime_type, _ = mimetypes.guess_type(result_image_path)
    if not result_mime_type:
        result_mime_type = "application/octet-stream"
    # Core 서버에 presigned URL 요청 (변환 이미지)
    async with httpx.AsyncClient() as client:
        presigned_result_resp = await client.get(
            f"{CORE_SERVER_BASE}/image/presigned-url",
            headers={"Authorization": Authorization,
                    "accept": "application/json"
                    },
            params={"fileType": result_mime_type, "fileName": Path(result_image_path).name, "service": "image"}
        )
  
    if presigned_result_resp.status_code != 200:
        raise HTTPException(status_code=500, detail="변환 이미지 presigned URL 요청에 실패했습니다.")
    result_presigned_data = presigned_result_resp.json()
    if not result_presigned_data.get("success"):
        raise HTTPException(status_code=500, detail="변환 이미지 presigned URL 발급 실패")
    result_presigned_url = result_presigned_data["data"]["presignedUrl"]
    result_upload_filename = result_presigned_data["data"]["uploadFileName"]
   
    # presigned URL을 사용하여 원본 이미지 업로드 (HTTP PUT)
    # with open(input_image_path, "rb") as f:
    #     orig_file_content = f.read()
    # async with httpx.AsyncClient() as client:
    #     upload_orig_resp = await client.put(
    #         orig_presigned_url,
    #         content=orig_file_content,
    #         headers={"Content-Type": mime_type})
    # if upload_orig_resp.status_code not in (200, 201):
    #     raise HTTPException(status_code=500, detail="원본 이미지 업로드에 실패했습니다.")
   
    # presigned URL을 사용하여 변환 이미지 업로드 (HTTP PUT)
    with open(result_image_path, "rb") as f:
        result_file_content = f.read()
    async with httpx.AsyncClient() as client:
        upload_result_resp = await client.put(
            result_presigned_url, 
            content=result_file_content,
            headers={"Content-Type": result_mime_type})
    if upload_result_resp.status_code not in (200, 201):
        raise HTTPException(status_code=500, detail="변환 이미지 업로드에 실패했습니다.")
   
    # Core 서버에 업로드 완료 등록 요청
    register_payloads = [
        # {
    #     "modelId": model_id,
    #     "userId": user_id,
    #     "uploadFileName": orig_upload_filename
    # },
    {
        "modelId": model_id,
        "userId": user_id,
        "uploadFileName": result_upload_filename
    }]

    image_id = []
    for register_payload in register_payloads:
        async with httpx.AsyncClient() as client:
            register_resp = await client.post(
                f"{CORE_SERVER_BASE}/image/metadata",
                json=register_payload,
                headers={"Authorization": Authorization}
            )
        if register_resp.status_code != 200:
            raise HTTPException(status_code=500, detail="이미지 등록에 실패했습니다.")
        register_data = register_resp.json()
        image_id.append(register_data["data"]["imageId"])
    
    # 임시 파일 삭제
    os.remove(input_image_path)
    os.remove(result_image_path)

    return JSONResponse(content={
        "success": True,
        "data": {
            # "original": {
            #     "imageId": image_id[0],
            #     "uploadFileName": orig_upload_filename
            # },
            "result": {
                "imageId": image_id[0],
                "uploadFileName": result_upload_filename
            }
        },
        "error": None
    })

# text2img 추론
@app.post("/apply/text2img/")
async def apply_endpoint(
    prompt: str = Form(...),
    model_id: str = Form(...),
    strength: str = Form("0.4"),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    authorization = f"Bearer {credentials.credentials}"
    # user정보 조회
    async with httpx.AsyncClient() as client:
        user_info_resp = await client.get(
            f"{USER_SERVER_BASE}/user",
            headers={"Authorization": authorization}
        )
    if user_info_resp.status_code != 200:
        raise HTTPException(status_code=500, detail=f"유저 정보 조회에 실패했습니다. token:{authorization}")
    user_info = user_info_resp.json().get("data")
    if not user_info:
        raise HTTPException(status_code=404, detail="유저 정보를 찾을 수 없습니다.")
    user_id = user_info.get("userId")
    
    # model정보 조회
    async with httpx.AsyncClient() as client:
        model_info_resp = await client.get(
            f"{CORE_SERVER_BASE}/model/{model_id}/presigned-url",
            # params={"model_id": model_id},
            headers={"Authorization": authorization}
        )
    if model_info_resp.status_code != 200:
        raise HTTPException(status_code=500, detail="모델 정보 조회에 실패했습니다.")
    model_info = model_info_resp.json().get("data").get("model")
    if not model_info:
        raise HTTPException(status_code=404, detail="모델 정보를 찾을 수 없습니다.")
    producer_id = model_info.get("userId")
    model_name = name_dict[model_info.get("modelName")]

    # 로컬 모델 디렉토리 확인 및 inference 실행
    model_dir = os.path.join("ai", "img_model", str(producer_id), model_name)
    if not os.path.exists(model_dir):
        raise HTTPException(status_code=404, detail="모델을 찾을 수 없습니다.")
    result_image_path = run_text2img(model_dir, prompt=str(prompt), model_name=str(model_name), strength_str=strength)

    result_mime_type, _ = mimetypes.guess_type(result_image_path)
    if not result_mime_type:
        result_mime_type = "application/octet-stream"
    # Core 서버에 presigned URL 요청 (변환 이미지)
    async with httpx.AsyncClient() as client:
        presigned_result_resp = await client.get(
            f"{CORE_SERVER_BASE}/image/presigned-url",
            headers={"Authorization": authorization,
                    "accept": "application/json"
                    },
            params={"fileType": result_mime_type, "fileName": Path(result_image_path).name, "service": "image"}
        )
  
    if presigned_result_resp.status_code != 200:
        raise HTTPException(status_code=500, detail="변환 이미지 presigned URL 요청에 실패했습니다.")
    result_presigned_data = presigned_result_resp.json()
    if not result_presigned_data.get("success"):
        raise HTTPException(status_code=500, detail="변환 이미지 presigned URL 발급 실패")
    result_presigned_url = result_presigned_data["data"]["presignedUrl"]
    result_upload_filename = result_presigned_data["data"]["uploadFileName"]
   
    # presigned URL을 사용하여 변환 이미지 업로드 (HTTP PUT)
    with open(result_image_path, "rb") as f:
        result_file_content = f.read()
    async with httpx.AsyncClient() as client:
        upload_result_resp = await client.put(
            result_presigned_url, 
            content=result_file_content,
            headers={"Content-Type": result_mime_type})
    if upload_result_resp.status_code not in (200, 201):
        raise HTTPException(status_code=500, detail="변환 이미지 업로드에 실패했습니다.")
   
    # Core 서버에 업로드 완료 등록 요청
    register_payload = {
        "modelId": model_id,
        "userId": user_id,
        "uploadFileName": result_upload_filename
    }
    
    
    async with httpx.AsyncClient() as client:
        register_resp = await client.post(
            f"{CORE_SERVER_BASE}/image/metadata",
            json=register_payload,
            headers={"Authorization": authorization}
        )
    if register_resp.status_code != 200:
        raise HTTPException(status_code=500, detail="이미지 등록에 실패했습니다.")
    register_data = register_resp.json()
    
    # 임시 파일 삭제
    os.remove(result_image_path)
    
    return JSONResponse(content={
        "success": True,
        "data": {
            "uploadFileName": result_upload_filename,
            "imageId": register_data["data"]["imageId"]
        },
        "error": None
    })