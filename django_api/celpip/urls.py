from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),          # Django Admin — free CRUD UI
    path('api/', include('scoring.urls')),    # mirrors /api/* in your Vercel functions
]
