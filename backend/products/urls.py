"""
Product URL configuration.

Worker: Dev - Product catalog routes
"""

from django.urls import path
from . import views

urlpatterns = [
    # Public Endpoints
    path('categories/', views.CategoryListView.as_view(), name='category_list'),
    path('', views.ProductListView.as_view(), name='product_list'),
    path('featured/', views.FeaturedProductsView.as_view(), name='featured_products'),
    path('bestsellers/', views.BestsellerProductsView.as_view(), name='bestseller_products'),
    path('<slug:slug>/', views.ProductDetailView.as_view(), name='product_detail'),
]

# Admin URLs (to be included under /api/admin/products/)
admin_urlpatterns = [
    path('', views.AdminProductListView.as_view(), name='admin_product_list'),
    path('<int:pk>/', views.AdminProductDetailView.as_view(), name='admin_product_detail'),
]
