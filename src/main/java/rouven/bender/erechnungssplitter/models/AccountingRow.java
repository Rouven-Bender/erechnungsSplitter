package rouven.bender.erechnungssplitter.models;

public class AccountingRow {
    public String betrag;
    public String datum;
    public String rechnungsnummer;
    public String text;
    public String personenkonto;
    public String aufwandskonto;


    public static String[] getHeader(){
        return new String[]{
            "Betrag",
            "Rechungsdatum",
            "Text",
            "Personenkonto",
            "Aufwandskonto"
        };
    }
    public String[] toStringArray(){
        return new String[]{
            betrag,
            datum,
            rechnungsnummer,
            text,
            personenkonto,
            aufwandskonto,
        };
    }
}
