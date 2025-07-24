package rouven.bender.erechnungssplitter;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Paths;
import java.sql.*;
import java.util.*;

import rouven.bender.erechnungssplitter.models.*;

public class database {
    private static HashMap<String, database> instances = new HashMap<>();
    private Connection customerwide;
    private Connection monthly;

    public static Optional<database> getInstance(String mandant, String year, String month) {
        database p = instances.get(mandant+year);
        if (p != null) {
            return Optional.of(p);
        } else {
            try {
                p = new database(mandant, year, month);
                instances.put(mandant+year+month, p);
                return Optional.of(p);
            } catch (NoSuchElementException e) {
                return Optional.empty();
            } catch (Exception e){
                e.printStackTrace();
                return Optional.empty();
            }
        }
    }

    public static DbExistence checkWithDBExists(String mandant, String year, String month) {
        String path = (String) Config.getInstance().getSetting("basepath");
        boolean monthly = Paths.get(path, mandant, year, month, "db.sqlite").toFile().exists();
        boolean customer = Paths.get(path, mandant, "db.sqlite").toFile().exists();

        DbExistence dbe = new DbExistence();
        dbe.customerwiseDatabase = customer;
        dbe.monthlyDatabase = monthly;
        return dbe;
    }

    private database(String mandant, String year, String month) throws SQLException, ClassNotFoundException, NoSuchElementException{
        String path = (String) Config.getInstance().getSetting("basepath");
        String monthlypath = Paths.get(path, mandant, year, month, "db.sqlite").toString();
        String customerpath = Paths.get(path, mandant, "db.sqlite").toString();
        if (!new File(path).exists()) {
            throw new NoSuchElementException("there is not a database for this mandant year combination");
        }
        Class.forName("org.sqlite.JDBC");
        customerwide = DriverManager.getConnection("jdbc:sqlite:"+customerpath);
        monthly = DriverManager.getConnection("jdbc:sqlite:"+monthlypath);
    }

    public static void createCustomer(String mandant) {
        String path = (String) Config.getInstance().getSetting("basepath");
        String customerpath = Paths.get(path, mandant, "db.sqlite").toString();
        try {
            Class.forName("org.sqlite.JDBC");
            Connection c = DriverManager.getConnection("jdbc:sqlite:"+customerpath);
            ClassLoader cl = Thread.currentThread().getContextClassLoader();
            InputStream is = cl.getResourceAsStream("customer-schema.sql");
            if (is == null) {
                throw new IOException("customer-schema.sql could not be read");
            }
            String schema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            String [] stmts = schema.split(";");
            Statement s = c.createStatement();
            for (int i = 0; i < stmts.length; i++) {
                s.addBatch(stmts[i]);
            }
            s.executeBatch();
            c.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public boolean AccountExists(Account acc) {
        try (PreparedStatement stmt = customerwide.prepareStatement(
            "select * from account where accountnumber=?"
        )) {
            stmt.setString(1, acc.accountNumber);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return true;
            }
        } catch (SQLException e) {
            return false;
        }
        return false;
    }

    public void deleteAccount(Account acc) {
        try (PreparedStatement stmt = customerwide.prepareStatement(
            "delete from account where accountnumber=? and aname=?"
        )) {
           stmt.setString(1, acc.accountNumber); 
           stmt.setString(2, acc.name);
           stmt.execute();
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
    }

    public void addAccount(Account acc) {
        try (PreparedStatement stmt = customerwide.prepareStatement(
            "insert into account (accountnumber, aname) values (?,?)"
        )){
            stmt.setString(1, acc.accountNumber);
            stmt.setString(2, acc.name);
            stmt.execute();
        } catch (SQLException e) {
            return;
        }
    }

    public static void createMonthly(String mandant, String year, String month) {
        String path = (String) Config.getInstance().getSetting("basepath");
        String monthlypath = Paths.get(path, mandant, year, month, "db.sqlite").toString();
        try {
            Class.forName("org.sqlite.JDBC");
            Connection c = DriverManager.getConnection("jdbc:sqlite:"+monthlypath);
            ClassLoader cl = Thread.currentThread().getContextClassLoader();
            InputStream is = cl.getResourceAsStream("monthly-schema.sql");
            if (is == null) {
                throw new IOException("monthly-schema.sql could not be read");
            }
            String schema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            String [] stmts = schema.split(";");
            Statement s = c.createStatement();
            for (int i = 0; i < stmts.length; i++) {
                s.addBatch(stmts[i]);;
            }
            s.executeBatch();
            c.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public boolean invoiceBooked(String invoiceNumber, String personenkonto) {
        try (PreparedStatement stmt = monthly.prepareStatement(
            "select count(*) from bookings where rechnungsnummer=? and personenkonto=?"
        )){
            stmt.setString(1, invoiceNumber); 
            stmt.setString(2, personenkonto);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()){
                return rs.getInt(1) > 0;
            }
            return false;
        } catch(Exception e){
            System.out.println(e.getMessage());
        }
        return false;
    }

    public void deleteBookedInvoice(String invoiceNumber, String personenkonto) {
        try (PreparedStatement stmt = monthly.prepareStatement(
            "delete from bookings where rechnungsnummer=? and personenkonto=?"
        )) {
            stmt.setString(1, invoiceNumber);
            stmt.setString(2, personenkonto);
            stmt.executeUpdate();
        } catch(Exception e) {
            System.out.println(e.getMessage());
        }
    }

    public AccountingRow[] getBookedData(){
        ArrayList<AccountingRow> rows = new ArrayList<>();
        try (PreparedStatement stmt = monthly.prepareStatement(
            "select * from bookings"
        )) {
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                AccountingRow r = new AccountingRow();
                r.aufwandskonto = rs.getString("aufwandskonto");
                r.betrag = rs.getString("betrag");
                r.datum = rs.getString("datum");
                r.personenkonto = rs.getString("personenkonto");
                r.rechnungsnummer = rs.getString("rechnungsnummer");
                r.text = rs.getString("werundwas");
                rows.add(r);
            }
            return rows.toArray(new AccountingRow[0]);
        } catch(Exception e) {
            return new AccountingRow[0];
        }
    }

    public Optional<AccountedPosition[]> getBookedData(String rechnungsnummer, String personenkonto){
        ArrayList<AccountedPosition> rows = new ArrayList<>();
        try (PreparedStatement stmt = monthly.prepareStatement(
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
        try (PreparedStatement stmt = monthly.prepareStatement(
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
        try (PreparedStatement stmt = customerwide.prepareStatement(
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
        try (PreparedStatement stmt = customerwide.prepareStatement("select * from account")) {
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
        try (PreparedStatement stmt = customerwide.prepareStatement("select * from personenkonto")) {
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
