#!/usr/bin/env python3
"""给图标添加 padding，符合 macOS 设计规范"""
from PIL import Image
import sys

def add_padding(input_path, output_path, padding_percent=15, remove_white_bg=True):
    """
    给图标添加 padding
    padding_percent: 四周留白百分比（默认 15%）
    remove_white_bg: 是否移除白色背景（默认 True）
    """
    img = Image.open(input_path)

    # 确保是 RGBA 模式
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    # 移除白色背景
    if remove_white_bg:
        data = img.getdata()
        new_data = []
        for item in data:
            # 将白色或接近白色的像素变为透明
            if item[0] > 240 and item[1] > 240 and item[2] > 240:
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)
        img.putdata(new_data)

    # 计算缩小后的尺寸
    scale = (100 - padding_percent * 2) / 100
    new_size = int(img.width * scale)

    # 缩小图标主体
    img_resized = img.resize((new_size, new_size), Image.Resampling.LANCZOS)

    # 创建透明画布
    canvas = Image.new('RGBA', (img.width, img.height), (0, 0, 0, 0))

    # 居中放置
    offset = (img.width - new_size) // 2
    canvas.paste(img_resized, (offset, offset), img_resized)

    # 保存
    canvas.save(output_path, 'PNG')
    print(f"✓ 已移除白色背景 + 添加 {padding_percent}% padding: {output_path}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("用法: python3 add-padding.py <输入图标> [输出图标] [padding百分比]")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else input_file.replace('.png', '-padded.png')
    padding = int(sys.argv[3]) if len(sys.argv) > 3 else 15

    add_padding(input_file, output_file, padding)
