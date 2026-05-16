import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '@/types/order';
import { GSTConfig, DEFAULT_GST_CONFIG } from '@/types/gst';
import { GSTConfigService } from './gst-config.service';

export class InvoiceService {
    /**
     * Format price to Rs. string (safe for standard PDF fonts)
     */
    static formatRs(amount: number): string {
        return `Rs. ${amount.toFixed(2)}`;
    }

    /**
     * Generate PDF invoice for an order using dynamic GST config
     */
    static async generateInvoicePDF(order: Order): Promise<jsPDF> {
        // Load config from Firestore (falls back to defaults)
        const config = await GSTConfigService.getConfig();
        return this.buildPDF(order, config);
    }

    /**
     * Build the actual PDF document
     */
    static buildPDF(order: Order, config: GSTConfig): jsPDF {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.width;
        const biz = config.businessAddress;
        const isInclusive = config.defaultTaxType === 'inclusive';

        // ─── Company Header ───
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('shop', 14, 20);
        doc.setTextColor(255, 153, 0);
        doc.text('suddenly', 33, 20);
        doc.setTextColor(0, 0, 0);

        doc.setFontSize(14);
        doc.text('Tax Invoice/Bill of Supply', pageWidth - 14, 20, { align: 'right' });
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('(Original for Recipient)', pageWidth - 14, 25, { align: 'right' });

        // ─── Seller Details ───
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Sold By:', 14, 35);
        doc.setFont('helvetica', 'normal');
        doc.text(biz.companyName, 14, 40);
        doc.text(biz.addressLine1, 14, 45);
        if (biz.addressLine2) doc.text(biz.addressLine2, 14, 50);
        const sellerCityY = biz.addressLine2 ? 55 : 50;
        doc.text(`${biz.city}, ${biz.state} - ${biz.postalCode}`, 14, sellerCityY);
        doc.text(`GSTIN: ${config.gstin}`, 14, sellerCityY + 5);
        doc.text(`PAN: ${config.pan}`, 14, sellerCityY + 10);

        // ─── Billing Details ───
        const address = order.addressSnapshot;
        const isSameState = address.state.toLowerCase() === biz.state.toLowerCase();

        doc.setFont('helvetica', 'bold');
        doc.text('Billing/Shipping Address:', pageWidth - 80, 35);
        doc.setFont('helvetica', 'normal');
        doc.text(address.name, pageWidth - 80, 40);
        doc.text(address.addressLine1, pageWidth - 80, 45);
        if (address.addressLine2) doc.text(address.addressLine2, pageWidth - 80, 50);
        const buyerCityY = address.addressLine2 ? 55 : 50;
        doc.text(`${address.city}, ${address.state} ${address.postalCode}`, pageWidth - 80, buyerCityY);
        doc.text(`Phone: ${address.phone}`, pageWidth - 80, buyerCityY + 5);

        // ─── Divider ───
        doc.setDrawColor(200, 200, 200);
        doc.line(14, 70, pageWidth - 14, 70);

        // ─── Order Metadata ───
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Order No: ${order.id}`, 14, 78);
        doc.text(`Invoice Date: ${new Date(order.createdAt).toLocaleDateString()}`, pageWidth - 14, 78, { align: 'right' });

        // ─── Items Table ───
        const tableBody = order.items.map((item, index) => {
            const gstRate = GSTConfigService.getGSTRate(config.slabs, item.unitPrice);

            let basePrice: number;
            let taxPerUnit: number;

            if (isInclusive) {
                // Extract tax from inclusive price
                basePrice = item.unitPrice / (1 + gstRate / 100);
                taxPerUnit = item.unitPrice - basePrice;
            } else {
                // Add tax on top
                basePrice = item.unitPrice;
                taxPerUnit = item.unitPrice * (gstRate / 100);
            }

            const netAmount = basePrice * item.quantity;
            const taxAmount = taxPerUnit * item.quantity;
            const totalAmount = (basePrice + taxPerUnit) * item.quantity;

            const taxType = isSameState
                ? `CGST+SGST (${gstRate}%)`
                : `IGST (${gstRate}%)`;

            return [
                index + 1,
                item.name,
                this.formatRs(basePrice),
                item.quantity,
                this.formatRs(netAmount),
                `${gstRate}%`,
                taxType,
                this.formatRs(taxAmount),
                this.formatRs(totalAmount),
            ];
        });

        autoTable(doc, {
            startY: 85,
            head: [['#', 'Description', 'Base Price', 'Qty', 'Net Amt', 'Rate', 'Tax Type', 'Tax Amt', 'Total']],
            body: tableBody,
            theme: 'grid',
            headStyles: {
                fillColor: [240, 240, 240],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                fontSize: 8,
            },
            styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
            columnStyles: {
                0: { cellWidth: 8 },
                1: { cellWidth: 38 },
                2: { cellWidth: 22, halign: 'right' },
                3: { cellWidth: 10, halign: 'center' },
                4: { cellWidth: 22, halign: 'right' },
                5: { cellWidth: 12, halign: 'center' },
                6: { cellWidth: 30, halign: 'center' },
                7: { cellWidth: 20, halign: 'right' },
                8: { cellWidth: 22, halign: 'right' },
            },
        });

        // ─── Grand Total ───
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Grand Total (Incl. Tax):', pageWidth - 80, finalY);
        doc.text(this.formatRs(order.totals.total), pageWidth - 14, finalY, { align: 'right' });

        // ─── Footer ───
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('Whether tax is payable under reverse charge: No', 14, finalY + 20);
        doc.text('This is a computer generated invoice and does not require a signature.', 14, finalY + 25);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(`For ${biz.companyName}`, pageWidth - 14, finalY + 40, { align: 'right' });
        doc.text('Authorized Signatory', pageWidth - 14, finalY + 55, { align: 'right' });

        return doc;
    }

    /**
     * Download invoice as PDF
     */
    static async downloadInvoice(order: Order): Promise<void> {
        const doc = await this.generateInvoicePDF(order);
        doc.save(`invoice-${order.id}.pdf`);
    }
}
