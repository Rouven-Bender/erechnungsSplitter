package bender.rouven;

import org.mustangproject.ZUGFeRD.ZUGFeRDImporter;

public class App 
{
    public static void main( String[] args )
    {
        ZUGFeRDImporter zu = new ZUGFeRDImporter("zugferd_basic.pdf");
        if (zu.canParse()) {
            String amount = zu.getAmount();
            System.out.println(amount);
        }
        System.out.println( "Hello World!" );
    }
}
