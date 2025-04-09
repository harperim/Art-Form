import os

import torch
from PIL import Image
from diffusers import StableDiffusionImg2ImgPipeline, DDPMScheduler

def run_inference(input_image_path: str, model_dir: str, strength_str: str = "0.33", model_name: str = "",
                  prompt: str = None) -> str:
    if prompt is None:
        prompt = f"a painting in the style of {model_name}"
    strength = float(strength_str)
    os.makedirs("./result", exist_ok=True)
    base_name = os.path.splitext(os.path.basename(input_image_path))[0]
    output_image_path = os.path.join("./result", f"{base_name}_output.png")
    
    # Stable Diffusion Img2Img 파이프라인 로드
    pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
        "runwayml/stable-diffusion-v1-5",
        torch_dtype=torch.float16,
        safety_checker=None,
        low_cpu_mem_usage=False
    )
    
    # UNet에만 LoRA 적용 (학습 시 저장된 모델은 model_dir/unet 에 있다고 가정)
    unet_lora_dir = os.path.join(model_dir, "unet")
    pipe.load_lora_weights(unet_lora_dir)
    
    # CUDA로 이동
    pipe = pipe.to("cuda")
    
    # scheduler 재설정 (optional)
    pipe.scheduler = DDPMScheduler.from_config(pipe.scheduler.config)
    
    # 입력 이미지 로드
    init_image = Image.open(input_image_path).convert("RGB")
    
    # 이미지 변환(추론) 실행
    with torch.autocast("cuda"):
        result = pipe(
            prompt=prompt,
            image=init_image,
            strength=strength,
            guidance_scale=7.5,
            num_inference_steps=50
        )
    
    # 결과 이미지 저장
    result.images[0].save(output_image_path)
    print(f"생성 완료: {output_image_path}")
    
    return output_image_path