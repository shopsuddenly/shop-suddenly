import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '@/types/order';
import { GSTConfig } from '@/types/gst';
import { GSTConfigService } from './gst-config.service';

export class InvoiceService {
    /**
     * Format price to Rs. string (Standard symbol replaced with ₹ where font supports, otherwise Rs.)
     */
    static formatPrice(amount: number): string {
        return `Rs. ${Math.round(amount)}`;
    }

    /**
     * Helper to convert number to words (Indian System)
     */
    static numberToWords(num: number): string {
        const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        const inWords = (n: number): string => {
            if (n < 20) return a[n];
            if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
            if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? 'and ' + inWords(n % 100) : '');
            if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
            if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
            return '';
        };

        const result = inWords(Math.floor(num)).trim();
        return result ? result + ' Rupees Only' : 'Zero Rupees Only';
    }

    /**
     * Draw a dashed line
     */
    static dashedLine(doc: jsPDF, x1: number, y1: number, x2: number, y2: number) {
        doc.setLineDashPattern([1, 1], 0);
        doc.line(x1, y1, x2, y2);
        doc.setLineDashPattern([], 0); // reset
    }

    /**
     * Generate PDF invoice (4-inch format matching design)
     */
    static async generateInvoicePDF(order: Order): Promise<jsPDF> {
        const config = await GSTConfigService.getConfig();
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: [101.6, 280] // 4 inches width
        });

        const pageWidth = 101.6;
        const biz = config.businessAddress;
        const address = order.addressSnapshot;
        const isInclusive = config.defaultTaxType === 'inclusive';
        
        let y = 12;

        // ─── Header ───
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('shop', 8, y);
        doc.text('suddenly', 27, y);
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text('Tax Invoice', pageWidth - 8, y - 2, { align: 'right' });
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('Original for Recipient', pageWidth - 8, y + 2, { align: 'right' });
        y += 8;

        this.dashedLine(doc, 8, y, pageWidth - 8, y);
        y += 6;

        // ─── Addresses (Side by Side) ───
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Sold By :', 8, y);
        doc.text('Shipping Address :', pageWidth / 2 + 2, y);
        y += 4;

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        
        // Seller Left Col
        let sellerY = y;
        doc.setFont('helvetica', 'bold');
        doc.text(biz.companyName, 8, sellerY);
        doc.setFont('helvetica', 'normal');
        doc.text(biz.addressLine1, 8, sellerY + 4);
        doc.text(`${biz.city}, ${biz.state} - ${biz.postalCode}`, 8, sellerY + 8);
        doc.text(biz.country, 8, sellerY + 12);
        doc.text(`PAN: ${config.pan}`, 8, sellerY + 20);
        doc.text(`GST: ${config.gstin}`, 8, sellerY + 24);

        // Shipping Right Col
        doc.text(address.name, pageWidth / 2 + 2, sellerY);
        doc.text(address.addressLine1.slice(0, 30), pageWidth / 2 + 2, sellerY + 4);
        doc.text(address.city, pageWidth / 2 + 2, sellerY + 8);
        doc.text(`${address.state} ${address.postalCode}`, pageWidth / 2 + 2, sellerY + 12);
        doc.text('INDIA', pageWidth / 2 + 2, sellerY + 16);

        y = sellerY + 30;
        this.dashedLine(doc, 8, y, pageWidth - 8, y);
        y += 6;

        // ─── Order Info ───
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(`Order ID: ${order.id.slice(-12)}`, 8, y);
        y += 4;
        doc.text(`Invoice No: INV-SS-2026-${order.id.slice(-4)}`, 8, y);
        y += 4;
        doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 8, y);
        y += 4;
        doc.text(`Payment: ${order.paymentMethod?.toUpperCase() || 'PREPAID'}`, 8, y);
        y += 6;

        // ─── Items Table ───
        let totalGST = 0;
        let subtotal = 0;

        const tableBody = order.items.map((item) => {
            const gstRate = GSTConfigService.getGSTRate(config.slabs, item.unitPrice);
            const netPrice = isInclusive ? item.unitPrice / (1 + gstRate / 100) : item.unitPrice;
            const tax = (isInclusive ? (item.unitPrice - netPrice) : (item.unitPrice * gstRate / 100)) * item.quantity;
            const rowTotal = item.unitPrice * item.quantity;

            totalGST += tax;
            subtotal += (netPrice * item.quantity);

            return [
                item.name.slice(0, 25),
                config.hsnCode || '6109',
                item.quantity,
                Math.round(item.unitPrice),
                `${gstRate}%`,
                Math.round(rowTotal)
            ];
        });

        autoTable(doc, {
            startY: y,
            margin: { left: 8, right: 8 },
            head: [['Item', 'HSN', 'Qty', 'Rate', 'GST', 'Total']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 7, lineWidth: 0.1 },
            styles: { fontSize: 7, cellPadding: 1.5, textColor: [0, 0, 0], lineWidth: 0.1 },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 10 },
                2: { cellWidth: 8, halign: 'center' },
                3: { cellWidth: 12, halign: 'right' },
                4: { cellWidth: 10, halign: 'center' },
                5: { cellWidth: 15, halign: 'right' },
            }
        });

        y = (doc as any).lastAutoTable.finalY + 8;

        // ─── Summary ───
        doc.setFontSize(9);
        doc.text(`Subtotal : ${this.formatPrice(subtotal)}`, pageWidth - 8, y, { align: 'right' });
        y += 5;
        doc.text(`GST : ${this.formatPrice(totalGST)}`, pageWidth - 8, y, { align: 'right' });
        y += 8;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total : ${this.formatPrice(order.totals.total)}`, pageWidth - 8, y, { align: 'right' });
        y += 10;

        // ─── Words & Barcode ───
        doc.setFontSize(8);
        doc.text('Amount in Words:', 8, y);
        y += 4;
        doc.setFont('helvetica', 'bold');
        doc.text(this.numberToWords(order.totals.total), 8, y);
        y += 12;

        doc.setFontSize(22);
        doc.setFont('helvetica', 'normal');
        doc.text('||||| || |||||', pageWidth / 2, y, { align: 'center' });
        y += 12;

        // ─── Signature ───
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`For ${biz.companyName}`, 8, y);
        doc.line(pageWidth - 45, y + 4, pageWidth - 8, y + 4);
        doc.text('Authorized Signatory', pageWidth - 26, y + 8, { align: 'center' });
        y += 16;

        // ─── Bottom Info Box ───
        doc.setDrawColor(0, 0, 0);
        doc.rect(8, y, pageWidth - 16, 18);
        doc.setFontSize(7);
        doc.text(`Transaction ID: TXN${order.id.slice(-10).toUpperCase()}`, 10, y + 6);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 10, y + 11);
        doc.text(`Invoice Value: ${this.formatPrice(order.totals.total)}`, 10, y + 16);
        y += 26;

        // ─── Footer ───
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text('Whether tax is payable under reverse charge - No', pageWidth / 2, y, { align: 'center' });
        y += 4;
        doc.text('This is a computer generated invoice.', pageWidth / 2, y, { align: 'center' });
        y += 4;
        doc.text(`© ${biz.companyName}`, pageWidth / 2, y, { align: 'center' });

        return doc;
    }

    static async downloadInvoice(order: Order): Promise<void> {
        const doc = await this.generateInvoicePDF(order);
        doc.save(`invoice-${order.id.slice(-6)}.pdf`);
    }
}
