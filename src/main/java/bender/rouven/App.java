package bender.rouven;

import java.text.DecimalFormat;

import org.mustangproject.Invoice;
import org.mustangproject.ZUGFeRD.IZUGFeRDExportableItem;
import org.mustangproject.ZUGFeRD.ZUGFeRDImporter;

public class App 
{
    public static void main( String[] args )
    {
        //ZUGFeRDImporter zu = new ZUGFeRDImporter("zugferd_basic.pdf");
        ZUGFeRDImporter zu = new ZUGFeRDImporter("mustang.pdf");
        if (zu.canParse()) {
            try {
                Invoice iv = zu.extractInvoice();
                System.out.println(iv.getNumber()); // Rechnungsnummer
                System.out.println(iv.getOwnVATID()); // VAT ID of seller
                System.out.println(iv.getSender().getTaxID());
                System.out.println(iv.getSender().getVATID());
                System.out.println(zu.getAmount()); // Rechnungstotal
                System.out.println(zu.getTaxBasisTotalAmount()); // Rechnungsnetto
                IZUGFeRDExportableItem[] items = iv.getZFItems();
                DecimalFormat df = new DecimalFormat("#,##0.000");
                for (int i=0; i< items.length; i++) {
                    System.out.printf("Position: %s\n", items[i].getId());
                    System.out.printf("Netto: %s\n", df.format(items[i].getPrice()));
                    System.out.printf("Menge: %s\n", df.format(items[i].getQuantity()));
                    System.out.printf("Total: %s\n", df.format((items[i].getPrice().multiply(items[i].getQuantity()))));
                    System.out.printf("Beschreibung: %s\n", items[i].getProduct().getName());
                    System.out.printf("Referenzen: %s\n", items[i].getProduct().getGlobalID());
                    System.out.printf("Referenzen: %s\n", items[i].getProduct().getSellerAssignedID());
                    System.out.printf("Referenzen: %s\n", items[i].getProduct().getBuyerAssignedID());
                    System.out.println("next item");
                }
            } catch (Exception e) {
                System.err.println(e.getMessage());
                System.exit(1);
            }
        }
    }
}
