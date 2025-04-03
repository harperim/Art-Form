import os
import torch
from diffusers import StableDiffusionPipeline
from transformers import CLIPTextModel
from peft import PeftModel


def run_inference_t2i(model_dir: str, prompt: str, model_name: str, strength_str: str = "0.33") -> str:
    # 학습 시 저장한 LoRA 가중치 경로 설정
    text_encoder_dir = os.path.join(model_dir, "text_encoder")
    unet_dir = os.path.join(model_dir, "unet")

    # text2img 파이프라인 로드
    pipe = StableDiffusionPipeline.from_pretrained(
        "runwayml/stable-diffusion-v1-5",
        torch_dtype=torch.float16,
        safety_checker=None,
        low_cpu_mem_usage=False
    )

    # 텍스트 인코더에 LoRA 가중치 적용
    pipe.text_encoder = CLIPTextModel.from_pretrained("openai/clip-vit-large-patch14").float()
    pipe.text_encoder = PeftModel.from_pretrained(pipe.text_encoder, text_encoder_dir)
    pipe.text_encoder = pipe.text_encoder.to("cuda")

    # UNet에 LoRA 가중치 적용 (학습 시 저장한 방식에 맞게 불러오기)
    pipe.unet.load_attn_procs(unet_dir)
    pipe.unet = pipe.unet.to("cuda")

    # 파이프라인 전체를 CUDA로 이동
    pipe = pipe.to("cuda")

    # 사용자로부터 프롬프트 입력 (예: "해안가 절벽에서 바라본 달을 {모델명}스타일로 그려줘")
    # 명확한 프롬프트 필요
    # "고양이가 책상 위에 앉아있는 모습"
    # "강아지가 눈밭에서 뛰노는 장면"
    # "해질 무렵 바닷가를 걷는 사람"
    final_prompt = f"{prompt}을 {model_name}스타일로 그려줘"


    # 프롬프트 내 "{모델명}" 부분을 실제 스타일로 치환
    print("최종 프롬프트:", final_prompt)

    # 추론 실행 (세부 파라미터는 상황에 따라 조정)
    result = pipe(prompt=final_prompt, num_inference_steps=50, guidance_scale=7.5)

    # 결과 이미지 저장
    output_image_path = "./result/text2img_output.png"
    os.makedirs(os.path.dirname(output_image_path), exist_ok=True)
    result.images[0].save(output_image_path)
    print(f"생성 완료: {output_image_path}")
    
    return output_image_path