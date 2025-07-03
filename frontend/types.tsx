export type InvoiceData = {
    invoiceNumber: string;
    sellerVATID: string;
    invoiceTotal: string;
    invoiceNetto: string;
    currency: string;
    sellerTaxID: string;
    sender: SenderReciever;
    reciever: SenderReciever;
    positions: Position[];
};

export type ControlData = {
    numberOfPDFS: number;
    currentOfPDFS: number;
    invoice: InvoiceData | undefined;
    accounts: Account[] | undefined;
    msg: string | undefined;
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

export type Position = {
    productName: string;
    netto: string;
    quantity: string;
    total: string;
    //tax: string | undefined;
};