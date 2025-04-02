# apply.py
import os
import torch
from PIL import Image
from diffusers import StableDiffusionImg2ImgPipeline, DDPMScheduler

def run_inference(input_path: str, 
                  output_path: str, 
                  model_dir: str, 
                  prompt: str = "a painting in the style of Van Gogh", 
                  strength: float = 0.33):
    # 모델 로딩
    pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
        "runwayml/stable-diffusion-v1-5",
        torch_dtype=torch.float16,
        safety_checker=None,
        low_cpu_mem_usage=False
    )

    # LoRA 로드
    unet_path = os.path.join(model_dir, "unet")
    pipe.load_lora_weights(unet_path)

    # GPU로 이동
    pipe = pipe.to("cuda")

    # 스케줄러 설정
    pipe.scheduler = DDPMScheduler.from_config(pipe.scheduler.config)

    # 입력 이미지 로드
    init_image = Image.open(input_path).convert("RGB")

    # 추론
    with torch.autocast("cuda"):
        result = pipe(
            prompt=prompt,
            image=init_image,
            strength=strength,
            guidance_scale=7.5,
            num_inference_steps=50
        )

    # 저장
    result.images[0].save(output_path)
