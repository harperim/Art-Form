import os
import torch
from diffusers import StableDiffusionPipeline, DDPMScheduler
from peft import PeftModel
from PIL import Image

def remove_unexpected_kwargs(orig_func, *args, **kwargs):
    while True:
        try:
            return orig_func(*args, **kwargs)
        except TypeError as e:
            msg = str(e)
            if "unexpected keyword argument" in msg:
                key = msg.split("'")[1]
                kwargs.pop(key, None)
            else:
                raise

def run_text2img(model_dir: str, prompt: str, model_name: str, guidance_scale: float = 7.5, num_inference_steps: int = 50, strength_str: str = "0.") -> str:
    """
    text2img 추론 함수

    Args:
        model_dir (str): 학습 시 저장한 모델 디렉토리 (subdirectory 'text_encoder' 및 'unet' 포함).
        prompt (str): 이미지 생성을 위한 텍스트 프롬프트.
        model_name (str): 스타일 모델 이름.
        guidance_scale (float, optional): classifier-free guidance scale. 기본값 7.5.
        num_inference_steps (int, optional): 추론 시 step 수. 기본값 50.
        strength_str (str, optional): 원래 img2img에서 사용하는 강도 값 (text2img에서는 사용되지 않음).

    Returns:
        str: 생성된 이미지의 저장 경로.
    """
    # 결과 이미지 저장 폴더 생성
    os.makedirs("./result", exist_ok=True)
    output_image_path = os.path.join("./result", "text2img_output.png")
    # 강도는 text2img에서는 사용되지 않으므로 파싱만 수행
    strength = float(strength_str)
    
    # Stable Diffusion text2img 파이프라인 로드
    pipe = StableDiffusionPipeline.from_pretrained(
        "runwayml/stable-diffusion-v1-5",
        torch_dtype=torch.float16,
        safety_checker=None,
        low_cpu_mem_usage=False
    )
    
    # LoRA weight 로드
    # text_encoder에 LoRA 적용: 학습 시 저장한 text_encoder 폴더 사용
    text_encoder_lora_dir = os.path.join(model_dir, "text_encoder")
    pipe.text_encoder = PeftModel.from_pretrained(pipe.text_encoder, text_encoder_lora_dir)
    
    # text_encoder의 base_model.forward에 패치 적용 (예기치 않은 keyword 제거)
    if hasattr(pipe.text_encoder, "base_model"):
        orig_forward = pipe.text_encoder.base_model.forward
        def patched_forward(*args, **kwargs):
            return remove_unexpected_kwargs(orig_forward, *args, **kwargs)
        pipe.text_encoder.base_model.forward = patched_forward

    # UNet에 LoRA 적용: 학습 시 저장한 unet 폴더 사용
    unet_lora_dir = os.path.join(model_dir, "unet")
    pipe.load_lora_weights(unet_lora_dir)
    
    # 모델을 CUDA로 이동
    pipe = pipe.to("cuda")
    
    # (Optional) scheduler 재설정
    pipe.scheduler = DDPMScheduler.from_config(pipe.scheduler.config)
    
    # 최종 프롬프트 생성 (예시: "원본프롬프트를 {model_name}스타일로 그려줘줘")
    final_prompt = f"{prompt}, in the style of {model_name}"
    
    # 추론: 텍스트 프롬프트로부터 이미지 생성 (text2img 파이프라인은 strength 인자를 사용하지 않음)
    with torch.autocast("cuda"):
        result = pipe(
            prompt=final_prompt,
            guidance_scale=guidance_scale,
            num_inference_steps=num_inference_steps
        )
    
    # 결과 이미지 저장
    result.images[0].save(output_image_path)
    print(f"생성 완료: {output_image_path}")
    
    return output_image_path