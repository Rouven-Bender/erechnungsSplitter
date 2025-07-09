package rouven.bender.erechnungssplitter.models;

public class InvoiceData {
    public String invoiceNumber;
    public String sellerVATID;
    public String invoiceNetto;
    public String invoiceTotal;
    public String currency;
    public String sellerTaxID;
    public String datum;
    public SenderReciever sender;
    public SenderReciever reciever;
    public Position[] positions;

    public InvoiceData() {
        this.sender = new SenderReciever();
        this.reciever = new SenderReciever();
    }
}