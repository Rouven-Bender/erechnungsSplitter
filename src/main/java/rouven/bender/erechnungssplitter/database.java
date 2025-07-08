package rouven.bender.erechnungssplitter;

import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Optional;

import rouven.bender.erechnungssplitter.models.Account;

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
        } catch (SQLException e) {
            return Optional.empty();
        }
        return Optional.of(tmp.toArray(new Account[0]));
    }

    public Optional<HashMap<String,String>> getPersonenkonten() {
        HashMap<String, String> out = new HashMap<>();
        try (PreparedStatement stmt = con.prepareStatement("select * from personenkonto")) {
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                out.put(rs.getString("aname"), rs.getString("kontonumber"));
            }
        } catch (SQLException e) {
            return Optional.empty();
        }
        return Optional.of(out);
    }
}
