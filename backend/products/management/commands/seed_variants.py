from django.core.management.base import BaseCommand
from products.models import Product, ProductImage
from django.utils.text import slugify
from decimal import Decimal

class Command(BaseCommand):
    help = 'Create missing weight variants (50g, 100g, 200g, 300g, 500g) for existing products'

    def handle(self, *args, **options):
        # Get all unique product names
        product_names = Product.objects.values_list('name', flat=True).distinct()
        
        target_weights = ['50g', '100g', '200g', '300g', '500g']
        
        # Price multipliers relative to 200g (assuming 200g is a common base, or just arbitrary scaling)
        # 50g = 0.25, 100g = 0.5, 200g = 1, 300g = 1.5, 500g = 2.5
        # We'll try to find a "base" product to copy from for each name.
        
        multipliers = {
            '50g': 0.25,
            '100g': 0.5,
            '200g': 1.0,
            '300g': 1.5,
            '500g': 2.5
        }

        for name in product_names:
            self.stdout.write(f"Processing {name}...")
            
            # Find a reference product (preferably 200g, or just the first one we find)
            base_product = Product.objects.filter(name=name, weight='200g').first()
            if not base_product:
                base_product = Product.objects.filter(name=name).first()
            
            if not base_product:
                continue

            # Calculate base price per gram (roughly) using the base product's weight
            # If base is 200g and price is 200, then 1g = 1.
            # If base weight string is weird, we'll default to using the multipliers against the base_product price directly, 
            # assumming base_product is 200g for simplicity, or we try to parse it.
            
            base_weight_val = 200
            if 'g' in base_product.weight.lower():
                try:
                    base_weight_val = float(base_product.weight.lower().replace('g', '').strip())
                    if 'k' in base_product.weight.lower(): # kg
                         base_weight_val *= 1000
                except:
                    pass
            
            for weight in target_weights:
                # Check if it exists
                if Product.objects.filter(name=name, weight=weight).exists():
                    self.stdout.write(f"  - {weight} exists.")
                    continue
                
                # Create it
                self.stdout.write(f"  - Creating {weight}...")
                
                # Calculate price
                target_weight_val = float(weight.replace('g', ''))
                ratio = target_weight_val / base_weight_val if base_weight_val else 1
                new_price = float(base_product.price) * ratio
                
                # Round to nice number
                new_price = round(new_price, 0)
                
                new_slug = slugify(f"{name}-{weight}")
                
                new_p = Product.objects.create(
                    category=base_product.category,
                    name=name,
                    slug=new_slug,
                    description=base_product.description,
                    short_description=base_product.short_description,
                    price=Decimal(new_price),
                    stock=base_product.stock, # Share stock count or copy? Let's copy.
                    sku=f"{base_product.sku}-{weight}" if base_product.sku else f"SKU-{new_slug}",
                    weight=weight,
                    calories=base_product.calories, # Should technically scale, but keeping simple
                    is_active=base_product.is_active,
                    is_featured=base_product.is_featured,
                    is_bestseller=base_product.is_bestseller
                )
                
                # Copy images
                for img in base_product.images.all():
                    ProductImage.objects.create(
                        product=new_p,
                        image=img.image,
                        alt_text=img.alt_text,
                        is_primary=img.is_primary,
                        display_order=img.display_order
                    )
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded missing variants'))
