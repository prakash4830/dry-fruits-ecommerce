"""
Main URL configuration for Nectar & Nut E-commerce.

Worker: Dev - Root URL routing
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

# Import admin URL patterns from apps
from products.urls import admin_urlpatterns as product_admin_urls
from orders.urls import admin_urlpatterns as order_admin_urls

def health(request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    # Health check
    path('api/health/', health),

    # Django Admin
    path('admin/', admin.site.urls),
    
    # API Endpoints - User Module
    path('api/auth/', include('users.urls')),
    path('api/products/', include('products.urls')),
    path('api/cart/', include('cart.urls')),
    path('api/orders/', include('orders.urls')),
    
    # API Endpoints - Business Module (Admin)
    path('api/admin/analytics/', include('analytics.urls')),
    path('api/admin/products/', include(product_admin_urls)),
    path('api/admin/orders/', include(order_admin_urls)),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
