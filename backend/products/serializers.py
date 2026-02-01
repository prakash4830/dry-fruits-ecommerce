"""
Product serializers for Nectar & Nut E-commerce.

Worker: Dev - API serialization for product catalog
"""

from rest_framework import serializers
from .models import Category, Product, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    """
    Worker: Dev - Product image serializer
    """
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'display_order']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if instance.image:
            request = self.context.get('request')
            if request:
                # Build absolute URL
                ret['image'] = request.build_absolute_uri(instance.image.url)
            else:
                # Fallback to relative URL
                ret['image'] = instance.image.url
        return ret


class CategorySerializer(serializers.ModelSerializer):
    """
    Worker: Dev - Category listing serializer
    """
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 
            'image', 'product_count'
        ]
    
    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if instance.image:
            request = self.context.get('request')
            if request:
                # Build absolute URL
                ret['image'] = request.build_absolute_uri(instance.image.url)
            else:
                # Fallback to relative URL
                ret['image'] = instance.image.url
        return ret


class ProductListSerializer(serializers.ModelSerializer):
    """
    Worker: Dev - Product list view (minimal data)
    Worker: BA - Optimized for catalog pages
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    primary_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'short_description',
            'price', 'compare_at_price', 'discount_percentage',
            'weight', 'is_in_stock', 'is_featured', 'is_bestseller',
            'category_name', 'primary_image'
        ]
    
    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first()
        if primary:
            request = self.context.get('request')
            if request:
                # Build absolute URL for cross-origin access
                return request.build_absolute_uri(primary.image.url)
            else:
                # Fallback to relative URL
                return primary.image.url
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    """
    Worker: Dev - Product detail view (full data)
    Worker: BA - All info for product page
    """
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = serializers.SerializerMethodField()
    related_products = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'short_description',
            'price', 'compare_at_price', 'discount_percentage',
            'stock', 'is_in_stock', 'is_low_stock', 'sku', 'weight',
            'calories', 'protein', 'carbs', 'fat', 'fiber',
            'is_featured', 'is_bestseller',
            'category', 'images', 'related_products', 'variants',
            'created_at', 'updated_at'
        ]
    
    def get_related_products(self, obj):
        # Worker: BA - Show related products from same category
        # Exclude same product variants (same name)
        related = Product.objects.filter(
            category=obj.category,
            is_active=True
        ).exclude(name=obj.name)[:4]
        
        return ProductListSerializer(
            related, 
            many=True, 
            context=self.context
        ).data

    def get_variants(self, obj):
        """
        Worker: BA - Show other weight variants of the same product
        """
        variants = Product.objects.filter(
            name=obj.name,
            is_active=True
        ).exclude(id=obj.id).order_by('weight')
        
        return ProductListSerializer(
            variants,
            many=True,
            context=self.context
        ).data


class ProductAdminSerializer(serializers.ModelSerializer):
    """
    Worker: Dev - Admin product management
    Worker: BA - Full CRUD capabilities
    """
    images = ProductImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'
