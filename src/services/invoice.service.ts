import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '@/types/order';
import { formatPrice } from "@/lib/utils";

export class InvoiceService {
    /**
     * Generate invoice number from order ID
     */
    static getInvoiceNumber(orderId: string): string {
        return `INV-${orderId}`;
    }

    /**
     * Generate PDF invoice for an order
     */
    static generateInvoicePDF(order: Order): jsPDF {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;

        // Company Header
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('INVOICE', pageWidth / 2, 20, { align: 'center' });

        // Invoice Details
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Invoice #: ${this.getInvoiceNumber(order.id)}`, 14, 35);
        doc.text(`Order ID: ${order.id}`, 14, 41);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 47);
        doc.text(`Payment Method: ${order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}`, 14, 53);

        // Billing & Shipping Address
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Ship To:', 14, 65);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const address = order.addressSnapshot;
        doc.text(address.name, 14, 71);
        doc.text(address.addressLine1, 14, 77);
        if (address.addressLine2) {
            doc.text(address.addressLine2, 14, 83);
        }
        doc.text(`${address.city}, ${address.state} ${address.postalCode}`, 14, address.addressLine2 ? 89 : 83);
        doc.text(`${address.country}`, 14, address.addressLine2 ? 95 : 89);
        doc.text(`Phone: ${address.phone}`, 14, address.addressLine2 ? 101 : 95);

        // Order Items Table
        const tableStartY = address.addressLine2 ? 110 : 104;
        const items = order.items.map(item => [
            item.name,
            item.size || '-',
            item.quantity.toString(),
            `$${item.unitPrice.toFixed(2)}`,
            `$${(item.quantity * item.unitPrice).toFixed(2)}`
        ]);

        autoTable(doc, {
            startY: tableStartY,
            head: [['Item', 'Size', 'Qty', 'Unit Price', 'Total']],
            body: items,
            theme: 'striped',
            headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
            styles: { fontSize: 9 },
            columnStyles: {
                0: { cellWidth: 70 },
                1: { cellWidth: 20, halign: 'center' },
                2: { cellWidth: 15, halign: 'center' },
                3: { cellWidth: 35, halign: 'right' },
                4: { cellWidth: 35, halign: 'right' }
            }
        });

        // Get final Y position after table
        const finalY = (doc as any).lastAutoTable.finalY + 10;

        // Totals
        const totalsX = pageWidth - 70;
        doc.setFontSize(10);
        doc.text('Subtotal:', totalsX, finalY);
        doc.text(formatPrice(order.totals.subtotal), pageWidth - 15, finalY, { align: 'right' });

        if (order.totals.discountTotal > 0) {
            doc.text('Discount:', totalsX, finalY + 6);
            doc.setTextColor(0, 128, 0);
            doc.text(`-${formatPrice(order.totals.discountTotal)}`, pageWidth - 15, finalY + 6, { align: 'right' });
            doc.setTextColor(0, 0, 0);
        }

        let currentY = order.totals.discountTotal > 0 ? finalY + 12 : finalY + 6;
        doc.text("Shipping:", pageWidth - 50, currentY, { align: 'right' });
        doc.text(formatPrice(order.totals.shipping), pageWidth - 15, currentY, { align: 'right' });

        if (order.totals.tax > 0) {
            doc.text("Tax:", pageWidth - 50, currentY + 6, { align: 'right' });
            doc.text(formatPrice(order.totals.tax), pageWidth - 15, currentY + 6, { align: 'right' });
            currentY += 6;
        }

        // Draw line above total
        doc.setLineWidth(0.5);
        doc.line(totalsX, currentY + 8, pageWidth - 15, currentY + 8);

        // Total
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("Total:", pageWidth - 50, currentY + 15, { align: 'right' });
        doc.text(formatPrice(order.totals.total), pageWidth - 15, currentY + 15, { align: 'right' });

        // Footer
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(128, 128, 128);
        doc.text('Thank you for your business!', pageWidth / 2, doc.internal.pageSize.height - 20, { align: 'center' });

        return doc;
    }

    /**
     * Download invoice as PDF
     */
    static downloadInvoice(order: Order): void {
        const doc = this.generateInvoicePDF(order);
        const filename = `invoice-${order.id}.pdf`;
        doc.save(filename);
    }

    /**
     * Get invoice as blob for email or other purposes
     */
    static getInvoiceBlob(order: Order): Blob {
        const doc = this.generateInvoicePDF(order);
        return doc.output('blob');
    }
}
