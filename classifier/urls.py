# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('predict/', views.predict_image, name='predict'),
    path('delete/<int:history_id>/', views.delete_history, name='delete_history'),
]