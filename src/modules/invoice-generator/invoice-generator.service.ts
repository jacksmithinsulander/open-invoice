//import { PayeeService } from "../payees/payees.service";
import { PayeeRawAddress } from "../payees/payees.types";
//import { UserService } from "../users/users.service";
import { UserRawAddress } from "../users/users.types";
import pdfmake from "pdfmake";
import { join } from "path";

const baseApi = "https://api.frankfurter.dev/v2/rate/";

export interface Invoice {
  currency: string;
  price: number;
  workedHours?: number;
  nameOfInvoice?: string;
  payee: PayeeRawAddress;
  user: UserRawAddress;
}

export interface Price {
  basePrice: number;
  baseCurrency: string;
  invoicePrice: number;
  invoiceCurrency: string;
  rate: number;
}

export interface ExchangeRateResponse {
  date: string;
  base: string;
  quote: string;
  rate: number;
}

class InvoiceService {
  invoice: Invoice;

  constructor(invoice_: Invoice) {
    this.invoice = invoice_;
  }

  generate() {
    const today = new Date().toISOString().split("T")[0];
    const price: Price = this.getFullPriceDetails();
  }

  getFullPriceDetails(): Price {
    if (!this.invoice.user.baseCurrency) {
      throw new Error("No base currency set for user");
    }

    if (this.invoice.currency === this.invoice.user.baseCurrency) {
      return {
        basePrice: this.invoice.price,
        baseCurrency: this.invoice.user.baseCurrency,
        invoicePrice: this.invoice.price,
        invoiceCurrency: this.invoice.user.baseCurrency,
        rate: 1,
      };
    }

    const url = new URL(
      `${baseApi}/${this.invoice.currency}/${this.invoice.user.baseCurrency}`,
    );
    const response = await fetch(url, {
      headers: {
        "User-Agent": "invoice-generator/1.0",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${String(response.status)}`);
    }

    const exchangeRate = (await response.json()) as ExchangeRateResponse;

    const basePrice = this.invoice.price * exchangeRate.rate;

    return {
      basePrice: basePrice,
      baseCurrency: this.invoice.user.baseCurrency,
      invoicePrice: this.invoice.price,
      invoiceCurrency: this.invoice.currency,
      rate: exchangeRate.rate,
    };
  }
}

pdfmake.addFonts({
  Roboto: {
    normal: join(
      process.cwd(),
      "node_modules/pdfmake/build/fonts/Roboto/Roboto-Regular.ttf",
    ),
    bold: join(
      process.cwd(),
      "node_modules/pdfmake/build/fonts/Roboto/Roboto-Medium.ttf",
    ),
    italics: join(
      process.cwd(),
      "node_modules/pdfmake/build/fonts/Roboto/Roboto-Italic.ttf",
    ),
    bolditalics: join(
      process.cwd(),
      "node_modules/pdfmake/build/fonts/Roboto/Roboto-MediumItalic.ttf",
    ),
  },
  OCRB: {
    normal: "/usr/share/fonts/opentype/ocr-b/OCRB.otf",
    bold: "/usr/share/fonts/opentype/ocr-b/OCRB.otf",
  },
  Symbola: {
    normal: "/usr/share/fonts/truetype/ancient-scripts/Symbola_hint.ttf",
    bold: "/usr/share/fonts/truetype/ancient-scripts/Symbola_hint.ttf",
  },
});

var dd = {
  pageMargins: [40, 40, 40, 50],

  content: [
    // ── Header ────────────────────────────────────────────────────────────────
    {
      columns: [
        {
          width: "*",
          stack: [
            { text: "Acme Inc", style: "companyName" },
            { text: "John Doe", style: "meta" },
            { text: "john.doe@acme.se", style: "meta" },
            { text: "0707133769", style: "meta" },
            { text: "Goodplacestreet 4", style: "meta" },
          ],
        },
        {
          width: "auto",
          stack: [
            { text: "INVOICE", style: "invoiceTitle", alignment: "right" },
            {
              text: "Invoice No: INV-2026-001",
              style: "meta",
              alignment: "right",
            },
            {
              text: "Issue Date: 2026-06-06",
              style: "meta",
              alignment: "right",
            },
            { text: "Due Date: 2026-06-20", style: "meta", alignment: "right" },
            {
              text: "Currency: EUR (billed) / SEK (received)",
              style: "meta",
              alignment: "right",
            },
          ],
        },
      ],
      columnGap: 20,
      margin: [0, 0, 0, 18],
    },

    // ── Bill From / Bill To ───────────────────────────────────────────────────
    {
      columns: [
        {
          width: "*",
          stack: [
            { text: "Bill from", style: "sectionHeader", margin: [0, 0, 0, 6] },
            {
              columns: [
                { width: 90, text: "Organisation:", bold: true },
                { text: "Acme Inc" },
              ],
              style: "addressLine",
              margin: [0, 0, 0, 2],
            },
            {
              columns: [
                { width: 90, text: "Tax Number:", bold: true },
                { text: "13373838" },
              ],
              style: "addressLine",
              margin: [0, 0, 0, 2],
            },
            {
              columns: [
                { width: 90, text: "Registration:", bold: true },
                { text: "SE13373838" },
              ],
              style: "addressLine",
              margin: [0, 0, 0, 2],
            },
            {
              columns: [
                { width: 90, text: "Bank Account:", bold: true },
                { text: "1234 56 78901" },
              ],
              style: "addressLine",
              margin: [0, 4, 0, 2],
            },
            {
              columns: [
                { width: 90, text: "IBAN:", bold: true },
                { text: "SE35 5000 0000 0549 1000 0003" },
              ],
              style: "addressLine",
              margin: [0, 0, 0, 2],
            },
            {
              columns: [
                { width: 90, text: "BIC/SWIFT:", bold: true },
                { text: "ESSESESS" },
              ],
              style: "addressLine",
              margin: [0, 0, 0, 2],
            },
          ],
        },
        {
          width: "*",
          stack: [
            { text: "Bill to", style: "sectionHeader", margin: [0, 0, 0, 6] },
            {
              columns: [
                { width: 90, text: "Organisation:", bold: true },
                { text: "Example Client AB" },
              ],
              style: "addressLine",
              margin: [0, 0, 0, 2],
            },
            {
              columns: [
                { width: 90, text: "Email:", bold: true },
                { text: "billing@example-client.se" },
              ],
              style: "addressLine",
              margin: [0, 0, 0, 2],
            },
            {
              columns: [
                { width: 90, text: "Address:", bold: true },
                { text: "Clientstreet 10, 111 22 Stockholm" },
              ],
              style: "addressLine",
              margin: [0, 0, 0, 2],
            },
            {
              columns: [
                { width: 90, text: "Tax Number:", bold: true },
                { text: "5566778899" },
              ],
              style: "addressLine",
              margin: [0, 0, 0, 2],
            },
          ],
        },
      ],
      columnGap: 24,
      margin: [0, 0, 0, 18],
    },

    // ── Line items ────────────────────────────────────────────────────────────
    {
      table: {
        headerRows: 1,
        widths: ["*", 38, 90, 72, 90],
        body: [
          [
            { text: "Description", style: "tableHeader" },
            { text: "Qty", style: "tableHeader", alignment: "right" },
            { text: "Unit Price", style: "tableHeader", alignment: "right" },
            { text: "VAT", style: "tableHeader", alignment: "right" },
            { text: "Amount", style: "tableHeader", alignment: "right" },
          ],
          [
            {
              text: "Consulting services for monthly advisory work",
              style: "itemCell",
            },
            { text: "1", style: "itemCell", alignment: "right" },
            { text: "EUR 100,00", style: "itemCell", alignment: "right" },
            { text: "EUR 25,00", style: "itemCell", alignment: "right" },
            { text: "EUR 125,00", style: "itemCell", alignment: "right" },
          ],
          [
            {
              text: "Subtotal",
              colSpan: 4,
              style: "summaryLabel",
              alignment: "right",
              margin: [0, 0, 8, 0],
            },
            {},
            {},
            {},
            { text: "EUR 100,00", style: "summaryValue", alignment: "right" },
          ],
          [
            {
              text: "VAT (25%)",
              colSpan: 4,
              style: "summaryLabel",
              alignment: "right",
              margin: [0, 0, 8, 0],
            },
            {},
            {},
            {},
            { text: "EUR 25,00", style: "summaryValue", alignment: "right" },
          ],
          [
            {
              text: "Total (EUR)",
              colSpan: 4,
              style: "totalLabel",
              alignment: "right",
              margin: [0, 2, 8, 2],
            },
            {},
            {},
            {},
            {
              text: "EUR 125,00",
              style: "totalValue",
              alignment: "right",
              margin: [0, 2, 0, 2],
            },
          ],
        ],
      },
      layout: {
        hLineWidth: (i, node) =>
          i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5,
        vLineWidth: () => 0,
        hLineColor: (i, node) =>
          i === 0 || i === 1 || i === node.table.body.length
            ? "#111827"
            : "#D1D5DB",
        paddingLeft: () => 6,
        paddingRight: () => 6,
        paddingTop: () => 5,
        paddingBottom: () => 5,
      },
      margin: [0, 0, 0, 16],
    },

    // ── Currency conversion ───────────────────────────────────────────────────
    {
      table: {
        widths: ["*"],
        body: [
          [
            {
              stack: [
                {
                  text: "Currency Conversion",
                  style: "sectionHeader",
                  margin: [0, 0, 0, 6],
                },
                {
                  columns: [
                    {
                      width: 190,
                      text: "Amount due from you (EUR):",
                      bold: true,
                    },
                    { text: "EUR 125,00" },
                  ],
                  style: "addressLine",
                  margin: [0, 0, 0, 3],
                },
                {
                  columns: [
                    {
                      width: 190,
                      text: "Conversion rate (EUR to SEK):",
                      bold: true,
                    },
                    { text: "1 EUR = 11,35 SEK  (rate date: 2026-06-06)" },
                  ],
                  style: "addressLine",
                  margin: [0, 0, 0, 3],
                },
                {
                  columns: [
                    {
                      width: 190,
                      text: "Equivalent amount in SEK:",
                      bold: true,
                    },
                    { text: "1 418,75 SEK", bold: true },
                  ],
                  style: "addressLine",
                  margin: [0, 0, 0, 4],
                },
                {
                  text: "Please pay in EUR. The SEK equivalent is shown for your reference only. Your bank may apply a different rate at settlement.",
                  style: "muted",
                },
              ],
              margin: [10, 10, 10, 10],
              fillColor: "#F9FAFB",
            },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => "#D1D5DB",
        vLineColor: () => "#D1D5DB",
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0,
      },
      margin: [0, 0, 0, 24],
    },

    // ── Payment slip ──────────────────────────────────────────────────────────
    {
      canvas: [
        {
          type: "line",
          x1: 0,
          y1: 0,
          x2: 515,
          y2: 0,
          lineWidth: 1,
          lineColor: "#111827",
        },
      ],
    },
    {
      columns: [
        {
          width: "55%",
          stack: [
            {
              columns: [
                {
                  width: "auto",
                  text: "Bankgiro",
                  style: "slipBankLabel",
                  margin: [0, 6, 0, 0],
                },
                {
                  width: "*",
                  text: "PAYMENT SLIP",
                  style: "slipHeaderRight",
                  alignment: "right",
                  margin: [0, 6, 0, 0],
                },
              ],
            },
            {
              canvas: [
                {
                  type: "line",
                  x1: 0,
                  y1: 0,
                  x2: 283,
                  y2: 0,
                  lineWidth: 0.5,
                  lineColor: "#111827",
                },
              ],
              margin: [0, 3, 0, 6],
            },
            {
              columns: [
                { width: 110, text: "OCR Reference:", style: "slipFieldLabel" },
                { text: "202600193", style: "slipFieldValue" },
              ],
              margin: [0, 0, 0, 6],
            },
            {
              columns: [
                { width: 110, text: "Due date:", style: "slipFieldLabel" },
                { text: "2026-06-20", style: "slipFieldValue" },
              ],
              margin: [0, 0, 0, 6],
            },
            {
              columns: [
                { width: 110, text: "Amount:", style: "slipFieldLabel" },
                { text: "1 418,75 SEK", style: "slipFieldValue" },
              ],
              margin: [0, 0, 0, 6],
            },
          ],
        },
        {
          width: "*",
          margin: [12, 0, 0, 0],
          table: {
            widths: ["*"],
            body: [
              [
                {
                  stack: [
                    { text: "Pay to Bankgiro", style: "slipBoxLabel" },
                    {
                      text: "1234-5678",
                      style: "slipBoxAccount",
                      margin: [0, 2, 0, 4],
                    },
                    {
                      canvas: [
                        {
                          type: "line",
                          x1: 0,
                          y1: 0,
                          x2: 200,
                          y2: 0,
                          lineWidth: 0.3,
                          lineColor: "#6B7280",
                        },
                      ],
                    },
                    {
                      text: "Payee",
                      style: "slipBoxLabel",
                      margin: [0, 4, 0, 2],
                    },
                    { text: "Acme Inc", style: "slipBoxRecipient" },
                    {
                      canvas: [
                        {
                          type: "line",
                          x1: 0,
                          y1: 0,
                          x2: 200,
                          y2: 0,
                          lineWidth: 0.3,
                          lineColor: "#6B7280",
                        },
                      ],
                      margin: [0, 6, 0, 0],
                    },
                    {
                      text: "Payer",
                      style: "slipBoxLabel",
                      margin: [0, 4, 0, 2],
                    },
                    { text: "Example Client AB", style: "slipBoxSender" },
                  ],
                  margin: [6, 6, 6, 6],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => "#111827",
            vLineColor: () => "#111827",
            paddingLeft: () => 0,
            paddingRight: () => 0,
            paddingTop: () => 0,
            paddingBottom: () => 0,
          },
        },
      ],
      columnGap: 0,
      margin: [0, 0, 0, 0],
    },
    {
      canvas: [
        {
          type: "line",
          x1: 0,
          y1: 0,
          x2: 515,
          y2: 0,
          lineWidth: 0.5,
          lineColor: "#9CA3AF",
        },
      ],
      margin: [0, 8, 0, 4],
    },
    {
      text: "#   202600193   #   1418   75   4   >   12345678#6#",
      style: "slipMachineLine",
      margin: [0, 0, 0, 4],
    },
    {
      text: "Scan this line with your bank app to fill in Bankgiro number, OCR reference and amount automatically.",
      style: "muted",
      alignment: "center",
      margin: [0, 4, 0, 0],
    },
  ],

  styles: {
    companyName: { fontSize: 16, bold: true },
    invoiceTitle: { fontSize: 20, bold: true },
    meta: { fontSize: 9, color: "#6B7280" },
    muted: { fontSize: 8, color: "#6B7280" },
    sectionHeader: { fontSize: 11, bold: true },
    addressLine: { fontSize: 9, lineHeight: 1 },
    tableHeader: {
      fontSize: 9,
      bold: true,
      fillColor: "#F3F4F6",
      color: "#111827",
    },
    itemCell: { fontSize: 9 },
    summaryLabel: { fontSize: 9, bold: true, color: "#374151" },
    summaryValue: { fontSize: 9, bold: true },
    totalLabel: { fontSize: 10, bold: true, fillColor: "#F3F4F6" },
    totalValue: { fontSize: 10, bold: true, fillColor: "#F3F4F6" },
    slipBankLabel: { fontSize: 10, bold: true, color: "#111827" },
    slipHeaderRight: {
      fontSize: 8,
      bold: true,
      color: "#374151",
      characterSpacing: 0.3,
    },
    slipFieldLabel: { fontSize: 9, bold: true, color: "#374151" },
    slipFieldValue: { fontSize: 9, color: "#111827" },
    slipBoxLabel: { fontSize: 7, color: "#6B7280" },
    slipBoxAccount: { fontSize: 14, bold: true, color: "#111827" },
    slipBoxRecipient: { fontSize: 10, bold: true, color: "#111827" },
    slipBoxSender: { fontSize: 9, color: "#374151" },
    slipMachineLine: {
      fontSize: 11,
      font: "OCRB",
      color: "#111827",
      characterSpacing: 2,
    },
  },

  defaultStyle: {
    fontSize: 10,
    lineHeight: 1.1,
    color: "#111827",
    font: "Roboto",
  },

  footer: {
    text: [
      { text: "generated with ", fontSize: 7, color: "#9CA3AF" },
      { text: "❤", fontSize: 8, color: "#9CA3AF", font: "Symbola" },
      { text: " by Open-Invoice", fontSize: 7, color: "#9CA3AF" },
    ],
    alignment: "center",
    margin: [0, 0, 0, 16],
  },
};

await pdfmake.createPdf(dd).write("invoice.pdf");
console.log("invoice.pdf written");
