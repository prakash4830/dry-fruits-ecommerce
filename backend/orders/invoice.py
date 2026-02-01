"""
Invoice generation utility for orders.

Worker: Dev - PDF invoice generation using ReportLab
"""

from io import BytesIO
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from django.conf import settings
from datetime import datetime


def generate_invoice_pdf(order):
    """
    Generate PDF invoice for an order.
    
    Args:
        order: Order instance
        
    Returns:
        BytesIO: PDF file buffer
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72,
                           topMargin=72, bottomMargin=18)
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Define styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#d97706'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=12,
    )
    
    # Company Header
    elements.append(Paragraph("Nutty Bites", title_style))
    elements.append(Paragraph("Premium Dry Fruits & Nuts", styles['Normal']))
    elements.append(Spacer(1, 0.3*inch))
    
    # Invoice Title
    elements.append(Paragraph(f"INVOICE", heading_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Order Information
    order_info_data = [
        ['Order Number:', order.order_number],
        ['Order Date:', order.created_at.strftime('%d %B %Y')],
        ['Payment Status:', order.payment_status.upper()],
        ['Order Status:', order.status.upper()],
    ]
    
    if order.delivered_at:
        order_info_data.append(['Delivered Date:', order.delivered_at.strftime('%d %B %Y')])
    
    order_info_table = Table(order_info_data, colWidths=[2*inch, 3*inch])
    order_info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#64748b')),
        ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#1e293b')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    elements.append(order_info_table)
    elements.append(Spacer(1, 0.4*inch))
    
    # Shipping Address
    elements.append(Paragraph("Shipping Address", heading_style))
    address_text = f"""
    {order.shipping_name}<br/>
    {order.shipping_address_line1}<br/>
    {order.shipping_address_line2 + '<br/>' if order.shipping_address_line2 else ''}
    {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}<br/>
    Phone: {order.shipping_phone}
    """
    elements.append(Paragraph(address_text, styles['Normal']))
    elements.append(Spacer(1, 0.4*inch))
    
    # Order Items
    elements.append(Paragraph("Order Items", heading_style))
    elements.append(Spacer(1, 0.1*inch))
    
    # Items table
    items_data = [['Product', 'Weight', 'Quantity', 'Price', 'Total']]
    
    for item in order.items.all():
        items_data.append([
            item.product_name,
            item.product_weight,
            str(item.quantity),
            f'₹{item.price}',
            f'₹{item.total}'
        ])
    
    items_table = Table(items_data, colWidths=[2.5*inch, 1*inch, 0.8*inch, 0.8*inch, 0.9*inch])
    items_table.setStyle(TableStyle([
        # Header row
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f59e0b')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        
        # Data rows
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#1e293b')),
        ('ALIGN', (2, 1), (-1, -1), 'RIGHT'),
        ('ALIGN', (0, 0), (1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        
        # Grid
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
    ]))
    
    elements.append(items_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Totals
    totals_data = [
        ['Subtotal:', f'₹{order.subtotal}'],
        ['Tax (GST):', f'₹{order.tax}'],
        ['Shipping:', f'₹{order.shipping_cost}' if order.shipping_cost > 0 else 'FREE'],
        ['', ''],
        ['Total Amount:', f'₹{order.total_amount}'],
    ]
    
    totals_table = Table(totals_data, colWidths=[4.5*inch, 1.5*inch])
    totals_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, 2), 'Helvetica'),
        ('FONTNAME', (1, 0), (1, 2), 'Helvetica'),
        ('FONTNAME', (0, 4), (-1, 4), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 2), 10),
        ('FONTSIZE', (0, 4), (-1, 4), 14),
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('TEXTCOLOR', (0, 0), (-1, 2), colors.HexColor('#64748b')),
        ('TEXTCOLOR', (0, 4), (-1, 4), colors.HexColor('#d97706')),
        ('LINEABOVE', (0, 4), (-1, 4), 2, colors.HexColor('#d97706')),
        ('BOTTOMPADDING', (0, 0), (-1, 2), 6),
        ('TOPPADDING', (0, 4), (-1, 4), 12),
        ('BOTTOMPADDING', (0, 4), (-1, 4), 12),
    ]))
    
    elements.append(totals_table)
    elements.append(Spacer(1, 0.5*inch))
    
    # Footer
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#94a3b8'),
        alignment=TA_CENTER
    )
    elements.append(Paragraph("Thank you for your order!", footer_style))
    elements.append(Paragraph("For any queries, contact us at support@nuttybites.com", footer_style))
    
    # Build PDF
    doc.build(elements)
    
    # Get the value of the BytesIO buffer and return it
    pdf = buffer.getvalue()
    buffer.close()
    
    return pdf
