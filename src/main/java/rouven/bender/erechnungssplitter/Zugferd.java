package rouven.bender.erechnungssplitter;

import java.io.File;
import java.text.DecimalFormat;
import java.util.Optional;

import org.mustangproject.Invoice;
import org.mustangproject.Item;
import org.mustangproject.TradeParty;
import org.mustangproject.ZUGFeRD.IZUGFeRDExportableItem;
import org.mustangproject.ZUGFeRD.ZUGFeRDImporter;

import rouven.bender.erechnungssplitter.models.InvoiceData;
import rouven.bender.erechnungssplitter.models.Position;

public class Zugferd {
    private static final DecimalFormat df = new DecimalFormat("#,##0.00#");

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
            out.sender.name = sender.getName();
            out.sender.street = sender.getStreet();
            out.sender.zip = sender.getZIP();
            out.sender.location = sender.getLocation();
            out.sender.country = sender.getCountry();

            TradeParty reciever = iv.getRecipient();
            out.reciever.name = reciever.getName();
            out.reciever.street = reciever.getStreet();
            out.reciever.zip = reciever.getZIP();
            out.reciever.location = reciever.getLocation();
            out.reciever.country = reciever.getCountry();

            out.invoiceNumber = iv.getNumber();
            out.sellerVATID = iv.getOwnVATID();
            out.invoiceTotal = zu.getAmount();
            out.currency = iv.getCurrency();
            out.invoiceNetto = zu.getTaxBasisTotalAmount();

            IZUGFeRDExportableItem[] items = iv.getZFItems();
            out.positions = new Position[items.length];
            for (int i=0; i < items.length; i++) {
                out.positions[i] = new Position();
                Position pos = out.positions[i];
                Item item = (Item) items[i];
                pos.netto = df.format(item.getPrice());
                pos.quantity = df.format(item.getQuantity());
                pos.total = df.format((item.getPrice().multiply(item.getQuantity())));
                //pos.tax = df.format(item.getTax()); // for some reason tax isn't set but its present in the file
                pos.productName = item.getProduct().getName();
            }
        } catch (Exception e) {
            System.err.println(e.getMessage());
            return Optional.empty();
        }
        return Optional.of(out);
    }
}
