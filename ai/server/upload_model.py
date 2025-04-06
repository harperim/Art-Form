from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Header
from fastapi.responses import JSONResponse
from pathlib import Path
import httpx
import shutil
import requests
import os
import zipfile

app = FastAPI()

CORE_SERVER_BASE = "http://j12d103.p.ssafy.io:8081"
USER_SERVER_BASE = "http://j12d103.p.ssafy.io:8082"

# 예시 Authorization 토큰
authorization = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiYXV0aCI6IlJPTEVfVVNFUiIsImV4cCI6MTc0MzkxMzc4MH0.d9ho84eCf1ea_Vh-f2PjpoeOb12Xlm1fhIg2hFfo7mk'

@app.post("/model/upload/")
async def upload_pretrained_model(
    model_name: str = Form(...),
    # authorization: str = Header(...),

):

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
            f"{CORE_SERVER_BASE}/core/image/presigned-url",
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
            f"{CORE_SERVER_BASE}/core/model/metadata",
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
