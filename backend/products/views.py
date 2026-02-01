"""
Product views for Nectar & Nut E-commerce.

Worker: Dev - Product catalog APIs
"""

from rest_framework import generics, filters
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, Product
from .serializers import (
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductAdminSerializer,
)


class CategoryListView(generics.ListAPIView):
    """
    List all active categories.
    
    Worker: Dev - Category endpoint for navigation
    """
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    pagination_class = None  # No pagination for categories


class ProductListView(generics.ListAPIView):
    """
    List products with filtering and search.
    
    Worker: Dev - Main catalog endpoint
    Worker: BA - Maps to FR-P01 through FR-P05
    """
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = {
        'category__slug': ['exact'],
        'price': ['gte', 'lte'],
        'is_featured': ['exact'],
        'is_bestseller': ['exact'],
    }
    search_fields = ['name', 'description', 'short_description']
    ordering_fields = ['price', 'name', 'created_at']
    ordering = ['-created_at']
    
    def list(self, request, *args, **kwargs):
        # Worker: BA - Show unique products only (one variant per product name)
        queryset = self.filter_queryset(self.get_queryset())
        
        # Group by name, preferring '200g' or fallback to first found
        unique_products = {}
        for p in queryset:
            if p.name not in unique_products:
                unique_products[p.name] = p
            else:
                # If we have a 200g version, prefer it
                if p.weight == '200g' and unique_products[p.name].weight != '200g':
                    unique_products[p.name] = p
                    
        # Sort by created_at (or whatever ordering was requested)
        # Note: Pagination will be applied to the deduped list
        
        # Convert back to list
        final_list = list(unique_products.values())
        
        # Apply pagination manually if needed, or just return response
        page = self.paginate_queryset(final_list)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(final_list, many=True)
        return Response(serializer.data)

    def get_queryset(self):
        return Product.objects.filter(is_active=True).select_related('category')


class ProductDetailView(generics.RetrieveAPIView):
    """
    Get product details by slug.
    
    Worker: Dev - Product detail page endpoint
    Worker: BA - Maps to FR-P06, FR-P07
    """
    serializer_class = ProductDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    
    def get_queryset(self):
        return Product.objects.filter(is_active=True).prefetch_related('images')


class FeaturedProductsView(generics.ListAPIView):
    """
    List featured products for homepage.
    
    Worker: Dev - Featured products carousel
    """
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    pagination_class = None
    
    def get_queryset(self):
        return Product.objects.filter(
            is_active=True,
            is_featured=True
        )[:8]


class BestsellerProductsView(generics.ListAPIView):
    """
    List bestseller products.
    
    Worker: Dev - Bestsellers section
    """
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    pagination_class = None
    
    def get_queryset(self):
        return Product.objects.filter(
            is_active=True,
            is_bestseller=True
        )[:8]


# Admin Views
# Worker: Dev - Admin-only product management


class AdminProductListView(generics.ListCreateAPIView):
    """
    Admin: List all products and create new ones.
    
    Worker: Dev - Admin product management
    Worker: BA - Maps to FR-I01, FR-I02
    """
    queryset = Product.objects.all()
    serializer_class = ProductAdminSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'sku']
    ordering = ['-created_at']


class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Admin: Get, update, delete products.
    
    Worker: Dev - Admin product CRUD
    Worker: BA - Maps to FR-I03, FR-I04
    """
    queryset = Product.objects.all()
    serializer_class = ProductAdminSerializer
    permission_classes = [IsAdminUser]
