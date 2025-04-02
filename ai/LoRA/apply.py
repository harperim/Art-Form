import os
os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"
os.environ["CUDA_VISIBLE_DEVICES"] = "0"

import torch
from PIL import Image
from diffusers import StableDiffusionImg2ImgPipeline, DDPMScheduler

# 입력값
strength_str, image_name = "0.33", "input1"
strength = float(strength_str)
input_image_path = f"./data/{image_name}.jpg"
output_image_path = f"./result/{image_name}_output2.png"
output_dir = "./data/output3"
os.makedirs("./result", exist_ok=True)

# 파이프라인 로드
pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16,
    safety_checker=None,
    low_cpu_mem_usage=False  # low mem 옵션 제거 가능
)

# UNet에만 LoRA 적용
pipe.load_lora_weights(os.path.join(output_dir, "unet"))

# CUDA로 이동
pipe = pipe.to("cuda")

# scheduler 재설정 (optional)
pipe.scheduler = DDPMScheduler.from_config(pipe.scheduler.config)

# 입력 이미지 불러오기
init_image = Image.open(input_image_path).convert("RGB")

# 프롬프트
prompt = "a painting in the style of Van Gogh"

# 이미지 생성
with torch.autocast("cuda"):
    result = pipe(
        prompt=prompt,
        image=init_image,
        strength=strength,
        guidance_scale=7.5,
        num_inference_steps=50
    )

# 저장
result.images[0].save(output_image_path)
print(f"생성 완료: {output_image_path}")
