export type InvoiceData = {
    invoiceNumber: string | null;
    sellerVATID: string | null;
    invoiceTotal: string | null;
    invoiceNetto: string | null;
    currency: string | null;
    sellerTaxID: string | null;
    sender: SenderReciever | null;
    reciever: SenderReciever | null;
    datum: string | null;
    positions: Position[] | null;
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
    listId: string;
    productName: string;
    netto: string;
    quantity: string;
    total: string;
    //tax: string | undefined;
};

export type AccountedPosition = {
    listId: string;
    accountNumber: string;
}

export type PersonenkontoRsp = {
    personenkonto: string | null;
}