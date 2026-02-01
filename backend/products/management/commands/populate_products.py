from django.core.management.base import BaseCommand
from products.models import Category, Product, ProductImage
import random
import os

class Command(BaseCommand):
    help = 'Populates the database with Nutty Bites products'

    def handle(self, *args, **kwargs):
        self.stdout.write('Populating database...')
        
        # Clear existing data
        ProductImage.objects.all().delete()
        Product.objects.all().delete()
        Category.objects.all().delete()
        
        categories_data = [
            {'name': 'Essential Nuts', 'image': 'https://images.unsplash.com/photo-1549590143-d5855148a9d5?w=800&q=80'},
            {'name': 'Dried Fruits & Figs', 'image': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80'},
            {'name': 'Exotic Nuts & Specialty Items', 'image': 'https://images.unsplash.com/photo-1554999965-0a7019943647?w=800&q=80'},
            {'name': 'Berries & Dehydrated Fruits', 'image': 'https://images.unsplash.com/photo-1615486511484-92e172cc416d?w=800&q=80'},
            {'name': 'Seeds & Health Mixes', 'image': 'https://images.unsplash.com/photo-1623812242173-1961445bf7a0?w=800&q=80'},
            {'name': 'Value-Added Products', 'image': 'https://images.unsplash.com/photo-1599599810694-b5b3730aa032?w=800&q=80'},
        ]
        
        cats = {}
        for c_data in categories_data:
            slug = c_data['name'].lower().replace(' & ', '-').replace(' ', '-').replace('&', 'and')
            cat = Category.objects.create(name=c_data['name'], slug=slug)
            
            # Using URL string in ImageField for demo purposes (frontend handles it)
            cat.image.name = c_data['image'] 
            cat.save()
            cats[c_data['name']] = cat
            self.stdout.write(f"Created category: {c_data['name']}")

        products_data = [
            # 1. Essential Nuts
            {
                'name': 'California Almonds (Badam) - Premium',
                'cat': 'Essential Nuts',
                'price': 850.00,
                'weight': '1kg',
                'desc': 'Premium California almonds, perfect for snacking and soaking. Rich in Vitamin E.',
                'image': 'https://images.unsplash.com/photo-1615485240214-12958431c498?w=800'
            },
            {
                'name': 'Mamra Almonds - Royal Reserve',
                'cat': 'Essential Nuts',
                'price': 2200.00,
                'weight': '500g',
                'desc': 'Exclusive Mamra almonds with high oil content and superior crunch.',
                'image': 'https://images.unsplash.com/photo-1508815121350-40c1e098338d?w=800'
            },
            {
                'name': 'Cashews (Kaju) - W180 Jumbo',
                'cat': 'Essential Nuts',
                'price': 1200.00,
                'weight': '500g',
                'desc': 'King size W180 cashews. Creamy, sweet, and crunchy.',
                'image': 'https://images.unsplash.com/photo-1626605057639-651c6c0b31e1?w=800'
            },
            {
                 'name': 'Cashews (Kaju) - W320 Standard',
                 'cat': 'Essential Nuts',
                 'price': 850.00,
                 'weight': '500g',
                 'desc': 'Standard W320 grade cashews, ideal for cooking and daily use.',
                 'image': 'https://images.unsplash.com/photo-1509376483569-45607b22a613?w=800'
            },
            {
                'name': 'Salted Pistachios (Pista) - Roasted',
                'cat': 'Essential Nuts',
                'price': 1400.00,
                'weight': '500g',
                'desc': 'Roasted and lightly salted pistachios in shell.',
                'image': 'https://images.unsplash.com/photo-1595123550441-df54c728325a?w=800'
            },
            {
                'name': 'Walnut Kernels (Akhrot Giri)',
                'cat': 'Essential Nuts',
                'price': 1100.00,
                'weight': '500g',
                'desc': 'Snow white walnut kernels, rich in Omega-3.',
                'image': 'https://images.unsplash.com/photo-1554999965-0a7019943647?w=800'
            },
            {
                'name': 'Golden Raisins (Kismis)',
                'cat': 'Essential Nuts',
                'price': 450.00,
                'weight': '500g',
                'desc': 'Sweet and tangy golden raisins.',
                'image': 'https://images.unsplash.com/photo-1615486259068-d6f780838967?w=800'
            },

            # 2. Dried Fruits & Figs
            {
                'name': 'Anjeer (Figs) - Premium',
                'cat': 'Dried Fruits & Figs',
                'price': 1300.00,
                'weight': '500g',
                'desc': 'Large, juicy dried figs. Excellent for digestion.',
                'image': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800'
            },
            {
                'name': 'Medjool Dates (Khajoor)',
                'cat': 'Dried Fruits & Figs',
                'price': 900.00,
                'weight': '500g',
                'desc': 'Soft, caramel-like Medjool dates from Jordan.',
                'image': 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800'
            },
            {
                'name': 'Turkish Apricots',
                'cat': 'Dried Fruits & Figs',
                'price': 700.00,
                'weight': '250g',
                'desc': 'Bright orange dried apricots, sweet and tart.',
                'image': 'https://images.unsplash.com/photo-1501250980486-50e50f38d44e?w=800'
            },
            {
                'name': 'Pitted Prunes',
                'cat': 'Dried Fruits & Figs',
                'price': 650.00,
                'weight': '250g',
                'desc': 'Moist and sweet pitted prunes, high in antioxidants.',
                'image': 'https://images.unsplash.com/photo-1622694553258-45e0503f848f?w=800'
            },

            # 3. Exotic Nuts
            {
                'name': 'Macadamia Nuts',
                'cat': 'Exotic Nuts & Specialty Items',
                'price': 2800.00,
                'weight': '250g',
                'desc': 'The finest Macadamia nuts with a buttery flavor.',
                'image': 'https://images.unsplash.com/photo-1584306611872-596316af742d?w=800'
            },
            {
                'name': 'Hazelnuts (Filberts)',
                'cat': 'Exotic Nuts & Specialty Items',
                'price': 1100.00,
                'weight': '250g',
                'desc': 'Crunchy raw hazelnuts, perfect for baking.',
                'image': 'https://images.unsplash.com/photo-1623961988350-66b064cb2977?w=800'
            },
            {
                'name': 'Brazil Nuts',
                'cat': 'Exotic Nuts & Specialty Items',
                'price': 1600.00,
                'weight': '250g',
                'desc': 'Large, creamy Brazil nuts, the best source of Selenium.',
                'image': 'https://images.unsplash.com/photo-1533221975283-f54460d37012?w=800'
            },
             {
                'name': 'Pecan Nuts',
                'cat': 'Exotic Nuts & Specialty Items',
                'price': 1800.00,
                'weight': '250g',
                'desc': 'Rich and buttery Pecan halves.',
                'image': 'https://images.unsplash.com/photo-1620916053303-34e4024c084e?w=800'
            },
            {
                'name': 'Pine Nuts (Chilgoza)',
                'cat': 'Exotic Nuts & Specialty Items',
                'price': 4500.00,
                'weight': '100g',
                'desc': 'Premium Pine Nuts with shell. A rare delicacy.',
                'image': 'https://images.unsplash.com/photo-1490924037597-2a07f0bb0a76?w=800'
            },

            # 4. Berries
            {
                'name': 'Cranberries (Dried)',
                'cat': 'Berries & Dehydrated Fruits',
                'price': 450.00,
                'weight': '250g',
                'desc': 'Sliced dried cranberries, sweet and tangy.',
                'image': 'https://images.unsplash.com/photo-1615486511484-92e172cc416d?w=800'
            },
             {
                'name': 'Dried Blueberries',
                'cat': 'Berries & Dehydrated Fruits',
                'price': 900.00,
                'weight': '250g',
                'desc': 'Whole dried blueberries. Bursting with flavor.',
                'image': 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?w=800'
            },
            {
                'name': 'Dehydrated Mango',
                'cat': 'Berries & Dehydrated Fruits',
                'price': 400.00,
                'weight': '200g',
                'desc': 'Chewy slices of Alphonso mango.',
                'image': 'https://images.unsplash.com/photo-1596324278772-23c26027fe19?w=800'
            },
             {
                'name': 'Dried Kiwi Slices',
                'cat': 'Berries & Dehydrated Fruits',
                'price': 350.00,
                'weight': '200g',
                'desc': 'Vibrant green dried kiwi slices.',
                'image': 'https://images.unsplash.com/photo-1627521798369-1c750b691079?w=800'
            },

            # 5. Seeds
            {
                'name': 'Pumpkin Seeds',
                'cat': 'Seeds & Health Mixes',
                'price': 400.00,
                'weight': '250g',
                'desc': 'Raw green pumpkin seeds (AA Grade).',
                'image': 'https://images.unsplash.com/photo-1623432856426-3829035e3818?w=800'
            },
             {
                'name': 'Chia Seeds',
                'cat': 'Seeds & Health Mixes',
                'price': 350.00,
                'weight': '250g',
                'desc': 'Premium black chia seeds.',
                'image': 'https://images.unsplash.com/photo-1589927951105-06788889412e?w=800'
            },
             {
                'name': 'Sunflower Seeds',
                'cat': 'Seeds & Health Mixes',
                'price': 250.00,
                'weight': '250g',
                'desc': 'Raw sunflower seeds, perfect for salads.',
                'image': 'https://images.unsplash.com/photo-1508611843232-159e13d1000b?w=800'
            },
             {
                'name': '7-Seeds Super Mix',
                'cat': 'Seeds & Health Mixes',
                'price': 450.00,
                'weight': '250g',
                'desc': 'A healthy blend of Pumpkin, Chia, Flax, Sunflower, and Melon seeds.',
                'image': 'https://images.unsplash.com/photo-1595855709973-5144b6777649?w=800'
            },

            # 6. Value Added
            {
                'name': 'Luxury Gift Hamper',
                'cat': 'Value-Added Products',
                'price': 2500.00,
                'weight': '1 Box',
                'desc': 'Assorted premium nuts and berries in a festive box.',
                'image': 'https://images.unsplash.com/photo-1506806732259-39c2d7168bfa?w=800'
            },
            {
                'name': 'Chocolate Coated Almonds',
                'cat': 'Value-Added Products',
                'price': 800.00,
                'weight': '300g',
                'desc': 'Roasted almonds dipped in dark chocolate.',
                'image': 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800'
            },
            {
                'name': 'Peri Peri Cashews',
                'cat': 'Value-Added Products',
                'price': 550.00,
                'weight': '200g',
                'desc': 'Spicy roasted cashews with peri peri seasoning.',
                'image': 'https://images.unsplash.com/photo-1509376483569-45607b22a613?w=800'
            }
        ]

        for p_data in products_data:
            cat = cats[p_data['cat']]
            slug = p_data['name'].lower().replace(' - ', '-').replace(' ', '-').replace('(', '').replace(')', '').replace('&', 'and') + '-' + p_data['weight'].lower()
            
            product = Product.objects.create(
                category=cat,
                name=p_data['name'],
                slug=slug,
                description=p_data['desc'],
                price=p_data['price'],
                stock=random.randint(50, 200),
                is_active=True,
                weight=p_data['weight']
            )
            
            ProductImage.objects.create(
                product=product,
                image=p_data['image'],
                is_primary=True,
                alt_text=p_data['name']
            )
            
            self.stdout.write(f"Created product: {p_data['name']}")

        self.stdout.write(self.style.SUCCESS('Successfully populated database with 30 items'))
