package rouven.bender.erechnungssplitter;

import java.io.File;
import java.util.Optional;

import org.mustangproject.Invoice;
import org.mustangproject.ZUGFeRD.ZUGFeRDImporter;

import rouven.bender.erechnungssplitter.models.InvoiceData;

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
            out.invoiceNumber = iv.getNumber();
            out.sellerVATID = iv.getOwnVATID();
            out.invoiceTotal = zu.getAmount();
        } catch (Exception e) {
            System.err.println(e.getMessage());
            return Optional.empty();
        }
        return Optional.of(out);
    }
}
