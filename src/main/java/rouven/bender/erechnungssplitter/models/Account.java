package rouven.bender.erechnungssplitter.models;

public class Account {
    public String accountNumber;
    public String name;

    public Account(String name, String accountNumber) {
        this.accountNumber = accountNumber;
        this.name = name;
    }
}
