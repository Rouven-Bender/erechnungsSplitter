package rouven.bender.erechnungssplitter.models;

import java.io.File;
import java.io.FileReader;
import java.nio.file.Paths;
import java.util.ArrayList;

import com.opencsv.CSVReader;

import rouven.bender.erechnungssplitter.Config;

public class Account {
    public String accountNumber;
    public String name;

    public Account(String name, String accountNumber) {
        this.accountNumber = accountNumber;
        this.name = name;
    }

    public static Account[] getAccounts(){
        ArrayList<Account> list = new ArrayList<>();
        // TODO: Maybe accounts needs to be in the same folder as the config
        File f = Paths.get((String) Config.getInstance().getSetting("basepath"), "accounts.csv").toFile();
        try {
            FileReader fr = new FileReader(f);
            CSVReader cr = new CSVReader(fr);
            String[] nextRecord;

            while ((nextRecord = cr.readNext()) != null) {
                list.add(new Account(nextRecord[1], nextRecord[0]));
            }
            cr.close();
            return list.toArray(new Account[0]);
        } catch (Exception e) {
            System.out.print(e.getMessage());
            System.exit(1);
        }
        return new Account[0]; // should never be hit
    }
}
