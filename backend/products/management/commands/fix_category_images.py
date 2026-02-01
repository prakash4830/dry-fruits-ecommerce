from django.core.management.base import BaseCommand
from products.models import Category

class Command(BaseCommand):
    help = 'Fixes category images by pointing them to local files'

    def handle(self, *args, **kwargs):
        self.stdout.write('Fixing category images...')
        
        updates = {
            'Essential Nuts': 'products/cat_essential_nuts_1769856679714.png',
            'Dried Fruits & Figs': 'products/cat_dried_fruits_1769856697117.png',
            'Exotic Nuts & Specialty Items': 'products/cat_exotic_nuts_1769856712080.png',
            'Berries & Dehydrated Fruits': 'products/cat_berries_1769856730868.png',
            'Seeds & Health Mixes': 'products/cat_seeds_1769856747147.png',
            'Value-Added Products': 'products/cat-value.png',
        }
        
        for name, image_path in updates.items():
            try:
                cat = Category.objects.get(name=name)
                cat.image = image_path
                cat.save()
                self.stdout.write(f"Updated category: {name}")
            except Category.DoesNotExist:
                self.stdout.write(self.style.WARNING(f"Category not found: {name}"))
                
        self.stdout.write(self.style.SUCCESS('Successfully fixed category images'))
