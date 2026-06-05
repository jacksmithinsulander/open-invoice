//import { PayeeService } from "../payees/payees.service";
import { PayeeRawAddress } from "../payees/payees.types";
//import { UserService } from "../users/users.service";
import { UserRawAddress } from "../users/users.types";
import pdfMake from "pdfmake/build/pdfmake";

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

// playground requires you to assign document definition to a variable called dd

// var dd = {
//   content: [
//     {
//       columns: [
//         {
//           width: 90,
//           text: "Name:",
//           bold: true,
//         },
//         {
//           text: "John Doe",
//         },
//       ],
//     },
//     {
//       columns: [
//         {
//           width: 90,
//           text: "Email:",
//           bold: true,
//         },
//         {
//           text: "john.doe@acme.se",
//         },
//       ],
//     },
//     {
//       columns: [
//         {
//           width: 90,
//           text: "Phone Number:",
//           bold: true,
//         },
//         {
//           text: "0707133769",
//         },
//       ],
//     },
//     {
//       columns: [
//         {
//           width: 90,
//           text: "Address:",
//           bold: true,
//         },
//         {
//           text: "Goodplacestreet 4",
//         },
//       ],
//     },
//     {
//       columns: [
//         {
//           width: 90,
//           text: "Organisation:",
//           bold: true,
//         },
//         {
//           text: "Acme Inc",
//         },
//       ],
//     },
//     {
//       columns: [
//         {
//           width: 90,
//           text: "Tax Number:",
//           bold: true,
//         },
//         {
//           text: "13373838",
//         },
//       ],
//     },
//     {
//       columns: [
//         {
//           width: 90,
//           text: "Registration:",
//           bold: true,
//         },
//         {
//           text: "SE13373838",
//         },
//       ],
//     },
//   ],
// };
