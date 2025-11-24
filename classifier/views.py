# from django.shortcuts import render
# from django.http import JsonResponse
# import numpy as np
# from tensorflow.keras.models import load_model
# from tensorflow.keras.preprocessing.image import img_to_array
# from PIL import Image
# import io
# import base64

# # Load model
# model = load_model('best_model.h5')
# classes = ['bike', 'bus', 'car', 'motorcycle', 'plane', 'ship', 'train']

# def index(request):
#     return render(request, 'classifier/index.html')

# def predict_image(request):
#     if request.method == 'POST' and request.FILES.get('image'):
#         try:
#             # Nhận file ảnh
#             image_file = request.FILES['image']
#             img = Image.open(image_file).convert("RGB")
            
#             # ============================================================
#             # PREPROCESSING - PHẢI GIỐNG COLAB
#             # ============================================================
#             img_resized = img.resize((150, 150))
#             img_array = img_to_array(img_resized) / 255.0  # CHỈ rescale, KHÔNG standardize
#             img_batch = np.expand_dims(img_array, axis=0)

#             # ============================================================
#             # DỰ ĐOÁN
#             # ============================================================
#             predictions = model.predict(img_batch)
#             predicted_index = np.argmax(predictions[0])
#             predicted_class = classes[predicted_index]
#             confidence = round(float(predictions[0][predicted_index]) * 100, 2)

#             # ============================================================
#             # CHUYỂN ẢNH GỐC THÀNH BASE64
#             # ============================================================
#             buffered_original = io.BytesIO()
#             img.save(buffered_original, format="PNG")
#             original_image_base64 = base64.b64encode(buffered_original.getvalue()).decode('utf-8')
#             original_image_data = f"data:image/png;base64,{original_image_base64}"

#             # ============================================================
#             # CHUYỂN ẢNH ĐÃ PREPROCESSING THÀNH BASE64
#             # ============================================================
#             # Chuyển từ normalized array [0, 1] về uint8 [0, 255] để hiển thị
#             img_processed_uint8 = (img_array * 255).astype(np.uint8)
#             img_processed_pil = Image.fromarray(img_processed_uint8)
            
#             buffered_processed = io.BytesIO()
#             img_processed_pil.save(buffered_processed, format="PNG")
#             processed_image_base64 = base64.b64encode(buffered_processed.getvalue()).decode('utf-8')
#             processed_image_data = f"data:image/png;base64,{processed_image_base64}"

#             # ============================================================
#             # TRẢ VỀ JSON
#             # ============================================================
#             return JsonResponse({
#                 'original_image': original_image_data,      # Ảnh gốc
#                 'processed_image': processed_image_data,   # Ảnh sau preprocessing (150x150)
#                 'prediction': predicted_class,
#                 'confidence': confidence
#             })

#         except Exception as e:
#             return JsonResponse({'error': f'Prediction failed: {str(e)}'}, status=400)

#     return JsonResponse({'error': 'Invalid request'}, status=400)

# views.py
from django.shortcuts import render
from django.http import JsonResponse
from django.core.files.base import ContentFile
from django.views.decorators.http import require_http_methods
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from PIL import Image
import io
import base64
from .models import PredictionHistory

# Load model
model = load_model('best_model.h5')
classes = ['bike', 'bus', 'car', 'motorcycle', 'plane', 'ship', 'train']

def index(request):
    # Lấy 15 lịch sử gần nhất
    recent_predictions = PredictionHistory.objects.all()[:15]
    context = {
        'recent_predictions': recent_predictions
    }
    return render(request, 'classifier/index.html', context)

def predict_image(request):
    if request.method == 'POST' and request.FILES.get('image'):
        try:
            # Nhận file ảnh
            image_file = request.FILES['image']
            img = Image.open(image_file).convert("RGB")
            
            # PREPROCESSING - PHẢI GIỐNG COLAB
            img_resized = img.resize((150, 150))
            img_array = img_to_array(img_resized) / 255.0
            img_batch = np.expand_dims(img_array, axis=0)

            # DỰ ĐOÁN
            predictions = model.predict(img_batch)
            predicted_index = np.argmax(predictions[0])
            predicted_class = classes[predicted_index]
            confidence = round(float(predictions[0][predicted_index]) * 100, 2)

            # LƯU VÀO DATABASE
            buffered = io.BytesIO()
            img_resized.save(buffered, format='PNG')
            image_content = ContentFile(buffered.getvalue(), name=f'pred_{predicted_class}.png')
            
            history_item = PredictionHistory.objects.create(
                image=image_content,
                predicted_class=predicted_class,
                confidence=confidence
            )

            # CHUYỂN ẢNH GỐC THÀNH BASE64
            buffered_original = io.BytesIO()
            img.save(buffered_original, format="PNG")
            original_image_base64 = base64.b64encode(buffered_original.getvalue()).decode('utf-8')
            original_image_data = f"data:image/png;base64,{original_image_base64}"

            # CHUYỂN ẢNH ĐÃ PREPROCESSING THÀNH BASE64
            img_processed_uint8 = (img_array * 255).astype(np.uint8)
            img_processed_pil = Image.fromarray(img_processed_uint8)
            
            buffered_processed = io.BytesIO()
            img_processed_pil.save(buffered_processed, format="PNG")
            processed_image_base64 = base64.b64encode(buffered_processed.getvalue()).decode('utf-8')
            processed_image_data = f"data:image/png;base64,{processed_image_base64}"

            # LẤY LỊCH SỬ MỚI NHẤT (15 items)
            recent_predictions = PredictionHistory.objects.all()[:15]
            history_data = [{
                'id': item.id,
                'image_url': item.image.url,
                'predicted_class': item.predicted_class,
                'confidence': item.confidence,
                'timestamp': item.timestamp.strftime('%Y-%m-%d %H:%M:%S')
            } for item in recent_predictions]

            # TRẢ VỀ JSON
            return JsonResponse({
                'original_image': original_image_data,
                'processed_image': processed_image_data,
                'prediction': predicted_class,
                'confidence': confidence,
                'history': history_data
            })

        except Exception as e:
            return JsonResponse({'error': f'Prediction failed: {str(e)}'}, status=400)

    return JsonResponse({'error': 'Invalid request'}, status=400)

@require_http_methods(["DELETE", "POST"])
def delete_history(request, history_id):
    try:
        history_item = PredictionHistory.objects.get(id=history_id)
        history_item.delete()
        
        # Trả về danh sách lịch sử mới
        recent_predictions = PredictionHistory.objects.all()[:15]
        history_data = [{
            'id': item.id,
            'image_url': item.image.url,
            'predicted_class': item.predicted_class,
            'confidence': item.confidence,
            'timestamp': item.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        } for item in recent_predictions]
        
        return JsonResponse({
            'success': True,
            'history': history_data
        })
    except PredictionHistory.DoesNotExist:
        return JsonResponse({'error': 'Item not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)