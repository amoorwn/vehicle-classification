from django.db import models
from django.utils import timezone

class PredictionHistory(models.Model):
    image = models.ImageField(upload_to='predictions/')
    predicted_class = models.CharField(max_length=50)
    confidence = models.FloatField()
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-timestamp']  # Sắp xếp theo thời gian mới nhất
        verbose_name_plural = "Prediction Histories"

    def __str__(self):
        return f"{self.predicted_class} - {self.confidence}% - {self.timestamp}"