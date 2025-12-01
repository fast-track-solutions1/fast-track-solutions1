from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from api.admin_views import admin_import_page, admin_download_template

urlpatterns = [
    # ✅ IMPORT PAGE - AVANT admin.site.urls
    path('admin/import/', admin_import_page, name='admin_import_page'),
    path('admin/import/download/', admin_download_template, name='admin_download_template'),
    
    # Django Admin
    path('admin/', admin.site.urls),
    
    # API
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('api.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

admin.site.site_header = "MSI TeamHub"
admin.site.site_title = "MSI TeamHub Admin"
