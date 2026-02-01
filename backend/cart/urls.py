"""
Cart URL configuration.

Worker: Dev - Shopping cart routes
"""

from django.urls import path
from . import views

urlpatterns = [
    path('', views.CartView.as_view(), name='cart'),
    path('add/', views.AddToCartView.as_view(), name='add_to_cart'),
    path('items/<int:item_id>/', views.CartItemView.as_view(), name='cart_item'),
    path('merge/', views.MergeCartView.as_view(), name='merge_cart'),
]
