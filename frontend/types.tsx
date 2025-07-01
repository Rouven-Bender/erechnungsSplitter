export type InvoiceData = {
    invoiceNumber: string;
    sellerVATID: string;
    invoiceTotal: string;
    currency: string;
    sellerTaxID: string;
    sender: SenderReciever;
    reciever: SenderReciever;
};

export type ControlData = {
    numberOfPDFS: number;
    currentOfPDFS: number;
    invoice: InvoiceData | undefined;
    accounts: Account[] | undefined;
};

export type SenderReciever = {
    name: string;
    street: string;
    zip: string;
    location: string;
    country: string;
};

export type Account = {
    accountNumber: string;
    name: string;
};