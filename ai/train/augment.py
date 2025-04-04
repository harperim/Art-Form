import os
import random
from PIL import Image
from torchvision import transforms
from tqdm import tqdm


def run_augmentation(input_dir, output_dir, target_num_images):
    os.makedirs(output_dir, exist_ok=True)

    # 증강 정의
    augmentation = transforms.Compose([
    transforms.Resize((512, 512)),
    # 좌우 반전
    transforms.RandomHorizontalFlip(p=0.5),
    # 약간의 밝기 조정
    transforms.RandomApply([
        transforms.ColorJitter(brightness=0.5, contrast=0.5)
    ], p=0.2),  
    transforms.ToTensor(),
])

    # 입력 디렉토리의 이미지 목록
    image_paths = [
        os.path.join(input_dir, f)
        for f in os.listdir(input_dir)
        if f.lower().endswith(('png', 'jpg', 'jpeg'))
    ]

    image_count = 0
    iteration = 0

    print(f"원본 이미지: {len(image_paths)}개 → 목표: {target_num_images}장으로 증강")

    # 목표 장수만큼 반복 증강
    while image_count < target_num_images:
        for path in image_paths:
            if image_count >= target_num_images:
                break
            img = Image.open(path).convert("RGB")
            aug_img = augmentation(img)
            save_path = os.path.join(output_dir, f"aug_{image_count:03d}.jpg")
            aug_img.save(save_path)
            image_count += 1
        iteration += 1


    print(f"증강 완료: {image_count}장 생성 → 저장 경로: {output_dir}")