package rouven.bender.erechnungssplitter;

import java.io.File;
import java.util.Optional;

import org.mustangproject.Invoice;
import org.mustangproject.TradeParty;
import org.mustangproject.ZUGFeRD.ZUGFeRDImporter;

import rouven.bender.erechnungssplitter.models.InvoiceData;
import rouven.bender.erechnungssplitter.models.SenderReciever;

public class Zugferd {
    public static boolean isZugferdInvoice(File file) {
        ZUGFeRDImporter zu = new ZUGFeRDImporter(file.getPath());
        return zu.canParse();
    }

    public static Optional<InvoiceData> getInvoiceData(File file) {
        ZUGFeRDImporter zu = new ZUGFeRDImporter(file.getPath());
        InvoiceData out = new InvoiceData();
        if (!zu.canParse()) {
            return Optional.empty();
        }
        try {
            Invoice iv = zu.extractInvoice();
            
            TradeParty sender = iv.getSender();
            out.sender = new SenderReciever();
            out.sender.name = sender.getName();
            out.sender.street = sender.getStreet();
            out.sender.zip = sender.getZIP();
            out.sender.location = sender.getLocation();
            out.sender.country = sender.getCountry();

            TradeParty reciever = iv.getRecipient();
            out.reciever = new SenderReciever();
            out.reciever.name = reciever.getName();
            out.reciever.street = reciever.getStreet();
            out.reciever.zip = reciever.getZIP();
            out.reciever.location = reciever.getLocation();
            out.reciever.country = reciever.getCountry();

            out.invoiceNumber = iv.getNumber();
            out.sellerVATID = iv.getOwnVATID();
            out.invoiceTotal = zu.getAmount();
            out.currency = iv.getCurrency();
        } catch (Exception e) {
            System.err.println(e.getMessage());
            return Optional.empty();
        }
        return Optional.of(out);
    }
}
