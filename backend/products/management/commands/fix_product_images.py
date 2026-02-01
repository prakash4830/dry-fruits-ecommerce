from django.core.management.base import BaseCommand
from products.models import Product, ProductImage

class Command(BaseCommand):
    help = 'Fixes product images by removing old records and setting correct primary flags'

    def handle(self, *args, **kwargs):
        self.stdout.write('Fixing product images...')
        
        # Delete all old ProductImage records that point to external URLs
        old_images = ProductImage.objects.filter(image__startswith='https://')
        deleted_count = old_images.count()
        old_images.delete()
        self.stdout.write(f'Deleted {deleted_count} old external URL images')
        
        # Delete old images with the long timestamp filenames
        old_timestamp_images = ProductImage.objects.filter(image__contains='1769872')
        deleted_timestamp = old_timestamp_images.count()
        old_timestamp_images.delete()
        self.stdout.write(f'Deleted {deleted_timestamp} old timestamp images')
        
        # Now ensure all remaining images are marked as primary
        fixed_count = 0
        for product in Product.objects.all():
            images = product.images.all()
            if images.exists():
                # Mark the first image as primary
                first_image = images.first()
                if not first_image.is_primary:
                    first_image.is_primary = True
                    first_image.save()
                    fixed_count += 1
                    self.stdout.write(f'Set primary image for: {product.name}')
        
        self.stdout.write(self.style.SUCCESS(f'Successfully fixed {fixed_count} product images'))
