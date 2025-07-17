package rouven.bender.erechnungssplitter;

import java.nio.file.Paths;
import java.sql.*;
import java.util.*;

import rouven.bender.erechnungssplitter.models.*;

public class database {
    private static database instance;
    
    private Connection con;

    private database() throws SQLException, ClassNotFoundException{
        String path = (String) Config.getInstance().getSetting("basepath"); // TODO: Per Customer DB für einfaches Einspielen von daten und einfachem Löschen
        Class.forName("org.sqlite.JDBC");
        con = DriverManager.getConnection("jdbc:sqlite:"+Paths.get(path, "db.sqlite").toString());
    }

    public static database getInstance(){
        if (instance == null) {
            try {
                instance = new database();
            } catch(Exception e) {
                System.out.println(e.getMessage());
                System.exit(1);
            }
        }
        return instance;
    }

    public Optional<AccountedPosition[]> getBookedData(String rechnungsnummer, String personenkonto){
        ArrayList<AccountedPosition> rows = new ArrayList<>();
        try (PreparedStatement stmt = con.prepareStatement(
            "select * from bookings where personenkonto=? and rechnungsnummer=?"
        )) {
            stmt.setString(1, personenkonto);
            stmt.setString(2, rechnungsnummer);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                AccountedPosition row = new AccountedPosition();
                String text = rs.getString("werundwas");
                String[] shard = text.split(" : ");
                if (shard.length == 2) {
                    row.listId = shard[1];
                } else {
                    row.listId = "0";
                }
                row.accountNumber = rs.getString("aufwandskonto");
                rows.add(row);
            }
            return Optional.of(rows.toArray(new AccountedPosition[0]));
        } catch(SQLException e) {
            System.out.println(e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * 
     * @param row
     * @return true if success, false for failure
     * @throws SQLException
     */
    public boolean bookAccountingRow(AccountingRow row) throws SQLException {
        try (PreparedStatement stmt = con.prepareStatement(
            "insert into bookings (betrag, datum, rechnungsnummer, werundwas, personenkonto, aufwandskonto) values (?,?,?,?,?,?)"
        )) {
            stmt.setString(1, row.betrag);
            stmt.setString(2, row.datum);
            stmt.setString(3, row.rechnungsnummer);
            stmt.setString(4, row.text);
            stmt.setString(5, row.personenkonto);
            stmt.setString(6, row.aufwandskonto);
            return (stmt.executeUpdate() == 1);
        } catch(SQLException e) {
            throw e;
        }
    }

    public void addPersonenkonto(Account a) throws SQLException {
        try (PreparedStatement stmt = con.prepareStatement(
            "insert into personenkonto (kontonumber, aname) values (?, ?)"
        )) {
            stmt.setString(1, a.accountNumber);
            stmt.setString(2, a.name);
            stmt.executeUpdate();
        } catch(SQLException e){
            throw e;
        }
    }

    public Optional<Account[]> getAccounts() {
        ArrayList<Account> tmp = new ArrayList<>();
        try (PreparedStatement stmt = con.prepareStatement("select * from account")) {
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                tmp.add(new Account(
                    rs.getString("aname"),
                    rs.getString("accountnumber")
                ));
            }
            return Optional.of(tmp.toArray(new Account[0]));
        } catch (SQLException e) {
            return Optional.empty();
        }
    }

    public Optional<HashMap<String,String>> getPersonenkonten() {
        HashMap<String, String> out = new HashMap<>();
        try (PreparedStatement stmt = con.prepareStatement("select * from personenkonto")) {
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                out.put(rs.getString("aname"), rs.getString("kontonumber"));
            }
            return Optional.of(out);
        } catch (SQLException e) {
            return Optional.empty();
        }
    }
}
