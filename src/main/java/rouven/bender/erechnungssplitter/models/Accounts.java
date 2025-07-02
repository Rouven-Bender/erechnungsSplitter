package rouven.bender.erechnungssplitter.models;

import java.io.File;
import java.io.FileReader;
import java.nio.file.Paths;
import java.util.ArrayList;

import com.opencsv.CSVReader;

import rouven.bender.erechnungssplitter.Config;

public class Accounts {
    public String accountNumber;
    public String name;

    public Accounts(String name, String accountNumber) {
        this.accountNumber = accountNumber;
        this.name = name;
    }

    public static Accounts[] getAccounts(){
        ArrayList<Accounts> list = new ArrayList<>();
        // TODO: Maybe accounts needs to be in the same folder in the same path of the config
        File f = Paths.get((String) Config.getInstance().getSetting("basepath"), "accounts.csv").toFile();
        try {
            FileReader fr = new FileReader(f);
            CSVReader cr = new CSVReader(fr);
            String[] nextRecord;

            while ((nextRecord = cr.readNext()) != null) {
                list.add(new Accounts(nextRecord[1], nextRecord[0]));
            }
            cr.close();
            return list.toArray(new Accounts[0]);
        } catch (Exception e) {
            System.out.print(e.getMessage());
            System.exit(1);
        }
        return new Accounts[0]; // should never be hit
    }
}
