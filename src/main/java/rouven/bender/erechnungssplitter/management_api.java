package rouven.bender.erechnungssplitter;

import java.io.*;
import java.nio.file.Paths;
import java.util.*;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.opencsv.CSVWriter;

import rouven.bender.erechnungssplitter.models.*;

@RestController
public class management_api {
    private Config cfg;
    private String basepath;

    management_api(){
        cfg = Config.getInstance();
        basepath = cfg.getSetting("basepath").toString();
    }

    @PostMapping(path="/api/management/export", produces = "text/csv")
    ResponseEntity<byte[]> export(@RequestBody MandantenSelector ms){
        try {
            if (ms.mandant == "" || ms.year == ""){
                return ResponseEntity.badRequest().build();
            }
            Optional<database> db = database.getInstance(ms.mandant, ms.year);
            if (db.isPresent()) {
                AccountingRow[] rows = db.get().getBookedData();
                CharArrayWriter cw = new CharArrayWriter();
                CSVWriter csv = new CSVWriter(cw);
                csv.writeNext(AccountingRow.getHeader());
                for (int i = 0; i<rows.length; i++) {
                    csv.writeNext(rows[i].toStringArray());
                }
                csv.flush();
                csv.close();
                return ResponseEntity.ok().body(cw.toString().getBytes());
            } else {
                return ResponseEntity.noContent().build();
            }
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/api/management/initdb")
    ResponseEntity<Integer> initDatabase(@RequestBody MandantenSelector ms){
        if (ms.mandant == "" || ms.year == ""){
            return ResponseEntity.badRequest().build();
        }
        DbExistence dbe = database.checkWithDBExists(ms.mandant, ms.year);
        if (!dbe.customerwiseDatabase) {
            database.createCustomer(ms.mandant);
        }
        if (!dbe.yearlyDatabase){
            database.createYearly(ms.mandant, ms.year);
        } else {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(0);
    }

    @GetMapping("/api/management/ui/mandanten")
    String[] getMandantenListe() {
        File[] dirs = new File(basepath).listFiles(File::isDirectory);
        ArrayList<String> t = new ArrayList<>();
        for (int i = 0; i<dirs.length; i++) {
            String[] p = dirs[i].toString().split(File.separator);
            t.add(p[p.length-1]);
        }
        return t.toArray(new String[0]);
    }

    @PostMapping("/api/management/ui/year")
    String[] getYears(@RequestBody String name){
        File[] dirs = Paths.get(basepath, name).toFile().listFiles(File::isDirectory);
        ArrayList<String> t = new ArrayList<>();
        for (int i = 0; i<dirs.length; i++) {
            String[] p = dirs[i].toString().split(File.separator);
            t.add(p[p.length-1]);
        }
        return t.toArray(new String[0]);
    }
}
