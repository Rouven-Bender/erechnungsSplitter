package rouven.bender.erechnungssplitter.models;

import java.io.File;
import java.io.FileReader;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;

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
    
    // TODO: this method will crash the programm if the file doesn't exist, propably
    public static HashMap<String, String> getPersonenkontos(){
        HashMap<String, String> out = new HashMap<>();
        // TODO: This should move with the open folder and not be bound to the basepath
        File f = Paths.get((String) Config.getInstance().getSetting("basepath"), "personenkonto.csv").toFile();
        try {
            FileReader fr = new FileReader(f);
            CSVReader cr = new CSVReader(fr);
            String[] nextRecord;

            while ((nextRecord = cr.readNext()) != null) {
                out.put(nextRecord[1], nextRecord[0]);
            }
            cr.close();
            return out;
        } catch (Exception e) {
            System.out.print(e.getMessage());
            System.exit(1);
        }
        return new HashMap<>(); //should never be hit
    }
}
