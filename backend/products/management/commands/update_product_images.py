from django.core.management.base import BaseCommand
from products.models import Product, ProductImage

class Command(BaseCommand):
    help = 'Updates product images with new premium AI-generated images'

    def handle(self, *args, **kwargs):
        self.stdout.write('Updating product images...')
        
        # Mapping of product slugs to new image filenames in media/products/
        image_updates = {
            'california-almonds-badam-premium-1kg': 'products/california-almonds.png',
            'mamra-almonds-royal-reserve-500g': 'products/mamra-almonds.png',
            'cashews-kaju-w180-jumbo-500g': 'products/cashews-w180.png',
            'cashews-kaju-w320-standard-500g': 'products/cashews-w320.png',
            'salted-pistachios-pista-roasted-500g': 'products/pistachios.png',
            'walnut-kernels-akhrot-giri-500g': 'products/walnuts.png',
            'golden-raisins-kismis-500g': 'products/raisins.png',
            'anjeer-figs-premium-500g': 'products/figs.png',
            'medjool-dates-khajoor-500g': 'products/dates.png',
            'turkish-apricots-250g': 'products/apricots.png',
            
            # Exotic Nuts (Fallback to Category Image)
            'macadamia-nuts-250g': 'products/cat-exotic.png',
            'hazelnuts-filberts-250g': 'products/cat-exotic.png',
            'brazil-nuts-250g': 'products/cat-exotic.png',
            'pecan-nuts-250g': 'products/cat-exotic.png',
            'pine-nuts-chilgoza-100g': 'products/cat-exotic.png',

            # Berries (Fallback to Category Image)
            'cranberries-dried-250g': 'products/cat-berries.png',
            'dried-blueberries-250g': 'products/cat-berries.png',
            'dehydrated-mango-200g': 'products/cat-berries.png',
            'dried-kiwi-slices-200g': 'products/cat-berries.png',

            # Seeds (Fallback to Category Image)
            'pumpkin-seeds-250g': 'products/cat-seeds.png',
            'chia-seeds-250g': 'products/cat-seeds.png',
            'sunflower-seeds-250g': 'products/cat-seeds.png',
            '7-seeds-super-mix-250g': 'products/cat-seeds.png',

            # Dried Fruits (Fallback)
            'pitted-prunes-250g': 'products/cat-dried.png',

            # Value Added (Fallback)
            'luxury-gift-hamper-1 box': 'products/cat-value.png',
            'chocolate-coated-almonds-300g': 'products/cat-value.png',
            'peri-peri-cashews-200g': 'products/cat-value.png',
        }
        
        updated_count = 0
        for slug, image_filename in image_updates.items():
            try:
                product = Product.objects.get(slug=slug)
                # Update or create the primary product image
                product_image, created = ProductImage.objects.update_or_create(
                    product=product,
                    is_primary=True,
                    defaults={
                        'image': image_filename,  # Django ImageField expects path relative to MEDIA_ROOT
                        'alt_text': product.name
                    }
                )
                action = 'Created' if created else 'Updated'
                self.stdout.write(f"{action} image for: {product.name}")
                updated_count += 1
            except Product.DoesNotExist:
                self.stdout.write(self.style.WARNING(f"Product not found: {slug}"))
        
        self.stdout.write(self.style.SUCCESS(f'Successfully updated {updated_count} product images'))
