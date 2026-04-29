import boto3
import os
from dotenv import load_dotenv
import mimetypes

load_dotenv()

def upload_images_to_r2(folder_path="Images/augment_images"):
    s3_client = boto3.client(
        's3',
        endpoint_url=os.getenv('R2_ENDPOINT'),
        aws_access_key_id=os.getenv('R2_ACCESS_KEY'),
        aws_secret_access_key=os.getenv('R2_SECRET_KEY'),
        region_name='auto'
    )

    bucket_name = os.getenv('R2_BUCKET_NAME')
    public_url_base = os.getenv('R2_PUBLIC_URL')

    if not os.path.exists(folder_path):
        print(f"Thư mục {folder_path} không tồn tại!")
        return

    results = {}

    for filename in os.listdir(folder_path):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.svg', '.webp')):
            file_path = os.path.join(folder_path, filename)
            object_key = f"augments/{filename}"
            content_type, _ = mimetypes.guess_type(file_path)
            
            try:
                s3_client.upload_file(
                    file_path, 
                    bucket_name, 
                    object_key,
                    ExtraArgs={'ContentType': content_type or 'image/png'}
                )
                
                final_url = f"{public_url_base}/{object_key}"
                trait_name_slug = os.path.splitext(filename)[0]
                results[trait_name_slug] = final_url
                
                print(f"Upload thành công: {filename} -> {final_url}")
                
            except Exception as e:
                print(f"Lỗi khi upload {filename}: {str(e)}")

    print("\n--- Hoàn thành upload ---")
    return results

if __name__ == "__main__":
    uploaded_data = upload_images_to_r2()

    if uploaded_data:
        print("\nDanh sách link để nạp vào DB:")
        import json
        print(json.dumps(uploaded_data, indent=4, ensure_ascii=False))