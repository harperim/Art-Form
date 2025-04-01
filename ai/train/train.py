import os

import inspect
import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
from diffusers import StableDiffusionPipeline, DDPMScheduler
from transformers import CLIPTextModel
from peft import get_peft_model, LoraConfig, TaskType


# 예기치 않은 keyword argument 자동 제거
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


def run_training(image_folder, output_dir, model_name):
    os.makedirs(output_dir, exist_ok=True)
    
    # LoRA 설정
    lora_config_text = LoraConfig(
        r=16,
        lora_alpha=32,
        target_modules=["q_proj", "v_proj"],
        lora_dropout=0.1,
        bias="none",
        task_type=TaskType.FEATURE_EXTRACTION,
    )
    lora_config_unet = LoraConfig(
        r=16,
        lora_alpha=32,
        target_modules=["to_q", "to_v"],
        lora_dropout=0.1,
        bias="none",
        task_type=TaskType.FEATURE_EXTRACTION,
    )
    
    # 데이터셋 클래스 정의
    class StyleImageDataset(Dataset):
        def __init__(self, folder):
            self.image_paths = [
                os.path.join(folder, f) for f in os.listdir(folder)
                if f.lower().endswith(('jpg', 'jpeg', 'png'))
            ]
            self.transform = transforms.Compose([
                transforms.Resize((512, 512)),
                transforms.ToTensor(),
                transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
            ])
            self.prompt = f"a painting in the style of {model_name}"
    
        def __len__(self):
            return len(self.image_paths)
    
        def __getitem__(self, idx):
            img = Image.open(self.image_paths[idx]).convert("RGB")
            img = self.transform(img)
            return {"pixel_values": img, "prompt": self.prompt}
    
    # 파이프라인 로딩 (Stable Diffusion)
    pipe = StableDiffusionPipeline.from_pretrained(
        "runwayml/stable-diffusion-v1-5",
        torch_dtype=torch.float32,
        safety_checker=None,
        low_cpu_mem_usage=False
    ).to("cuda")
    
    # Text Encoder에 LoRA 적용
    pipe.text_encoder = CLIPTextModel.from_pretrained("openai/clip-vit-large-patch14").float()
    pipe.text_encoder = get_peft_model(pipe.text_encoder, lora_config_text)
    if hasattr(pipe.text_encoder, "base_model"):
        orig_forward = pipe.text_encoder.base_model.forward
        def patched_forward(*args, **kwargs):
            return remove_unexpected_kwargs(orig_forward, *args, **kwargs)
        pipe.text_encoder.base_model.forward = patched_forward
    pipe.text_encoder = pipe.text_encoder.to("cuda")
    pipe.text_encoder.train()
    
    # UNet에 LoRA 적용
    pipe.unet = get_peft_model(pipe.unet, lora_config_unet)
    pipe.unet = pipe.unet.to("cuda")
    pipe.unet.train()
    if hasattr(pipe.unet, "base_model"):
        orig_unet_forward = pipe.unet.base_model.forward
        def patched_unet_forward(*args, **kwargs):
            return remove_unexpected_kwargs(orig_unet_forward, *args, **kwargs)
        pipe.unet.base_model.forward = patched_unet_forward
    
    # 데이터로더 준비
    dataset = StyleImageDataset(image_folder)
    dataloader = DataLoader(dataset, batch_size=1, shuffle=True)
    
    optimizer = torch.optim.Adam(
        list(pipe.text_encoder.parameters()) + list(pipe.unet.parameters()),
        lr=1e-5
    )
    num_epochs = 60
    pipe.scheduler = DDPMScheduler.from_config(pipe.scheduler.config)
    
    # 학습 루프
    for epoch in range(num_epochs):
        for step, batch in enumerate(dataloader):
            pixel_values = batch["pixel_values"].to(dtype=torch.float32, device="cuda")
            prompt = batch["prompt"]
    
            encoder_hidden_states, _ = pipe.encode_prompt(
                prompt,
                device="cuda",
                num_images_per_prompt=pixel_values.shape[0],
                do_classifier_free_guidance=False
            )
            encoder_hidden_states = encoder_hidden_states.to(dtype=torch.float32)
    
            latents = pipe.vae.encode(pixel_values).latent_dist.sample() * 0.18215
            noise = torch.randn_like(latents)
            timesteps = torch.randint(0, 1000, (latents.shape[0],), device="cuda").long()
            noisy_latents = pipe.scheduler.add_noise(latents, noise, timesteps)
    
            result = pipe.unet(
                sample=noisy_latents,
                timestep=timesteps,
                encoder_hidden_states=encoder_hidden_states
            )
            if isinstance(result, tuple):
                result = result[0]
            noise_pred = result
            loss = torch.nn.functional.mse_loss(noise_pred, noise)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(
                list(pipe.text_encoder.parameters()) + list(pipe.unet.parameters()),
                max_norm=1.0
            )
            if torch.isnan(loss) or torch.isinf(loss):
                print("[Warning] Loss is NaN or Inf!")
                print("→ noise_pred min/max:", noise_pred.min().item(), noise_pred.max().item())
                print("→ noise min/max:", noise.min().item(), noise.max().item())
                raise ValueError("Training stopped due to unstable loss")
            optimizer.step()
            optimizer.zero_grad()
        print(f"[Epoch {epoch+1}/{num_epochs}] Loss: {loss.item()}")
    
    # 모델 저장 (text_encoder와 unet 별도 저장)
    if isinstance(pipe.text_encoder, PeftModel):
        pipe.text_encoder.save_pretrained(os.path.join(output_dir, "text_encoder"))
    else:
        print("Warning: text_encoder는 PeftModel이 아닙니다. LoRA가 적용되지 않았을 수 있습니다.")
    pipe.unet.save_attn_procs(os.path.join(output_dir, "unet"))
    
    print("모델 저장 완료")