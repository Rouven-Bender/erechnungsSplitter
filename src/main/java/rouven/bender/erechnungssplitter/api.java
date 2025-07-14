package rouven.bender.erechnungssplitter;

import java.io.File;
import java.io.FileInputStream;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import rouven.bender.erechnungssplitter.models.*;

@RestController
class RestAPI {
    private Config cfg;
    private database db;

    private File path;
    private String basepath;
    private ArrayList<File> pdfs;
    private int selected = 0;
    private Display out;

    private Account[] accounts;
    private HashMap<String, String> Personenkontos;

    RestAPI() {
        cfg = Config.getInstance();
        basepath = cfg.getSetting("basepath").toString();
        path = new File(basepath);

        db = database.getInstance();
        accounts = db.getAccounts().orElse(null);
        Personenkontos = db.getPersonenkonten().orElse(null);
        if (accounts == null || Personenkontos == null) {
            System.out.println("Konten oder Personenkonten konnten nicht geladen werden");
            System.exit(1);
        }

        refreshPDFSGlobal();
    }

    @GetMapping("/back")
    void back(){
        if (selected > 0) {
            selected--;
        }
    }

    @GetMapping("/skip")
    void skip(){
        selected++;
    }

    @GetMapping("/ui/personenkonto") 
    ResponseEntity<personenkonto> getPersonenkonto(){
        if (out != null ) {
            if (out.invoice != null) {
            String p = Personenkontos.get(out.invoice.sender.name);
            if (p == null) {
                p = "";
            }
            return ResponseEntity.ok().body(new personenkonto(p));
        }}
        return new ResponseEntity<>(HttpStatus.TOO_EARLY);
    }

    @GetMapping("/ui")
    Display getDataForUI(){
        if (selected == -1) {
            Display d = new Display();
            d.msg = "Alle Rechnungen gebucht";
            return d;
        }
        out = new Display();
        out.currentOfPDFS = selected + 1;
        out.numberOfPDFS = pdfs.size();
        out.invoice = Zugferd.getInvoiceData(pdfs.get(selected)).orElse(null);
        out.accounts = accounts;
        if (out.invoice != null) {
            out.personenkonto = Personenkontos.get(out.invoice.sender.name);
        }
        return out;
    }

    @PostMapping("/add/personenkonto")
    ResponseEntity<?> addPersonenkonto(@RequestBody Account toAdd) {
        if (toAdd.name == "" 
            || toAdd.accountNumber == ""
            || !toAdd.accountNumber.matches("[0-9]*")
         ) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        try {
            db.addPersonenkonto(toAdd);
            Personenkontos.put(toAdd.name, toAdd.accountNumber);
        } catch (SQLException e) {
            System.out.println(e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/reset")
    void reset(){
        path = new File(basepath);
    }

    @PostMapping("/book")
    void book(@RequestBody BookingRequest request) {
        if (request.accounts == null)
        {
            System.out.println("empty request");
            return;
        }

        if (out == null || out.invoice == null) {
            System.out.println("can't book this invoice");
        } else {
            if (request.accounts != null) {
                if (request.accounts[0].listId.equals("0")) {
                    System.out.printf("Ganze Rechnung: %s", request.accounts[0].accountNumber);
                } else {
                    System.out.printf("Rechnungsnumber: %s, ", out.invoice.invoiceNumber);
                    for (int i = 0; i < request.accounts.length; i++) {
                        AccountedPosition p = request.accounts[i];
                        Position ip = out.invoice.positions[Integer.valueOf(p.listId) - 1];
                        System.out.printf("Produktname: %s, ", ip.productName);
                        System.out.printf("Position: %s, Accountnummer: %s\n", p.listId, p.accountNumber); // TODO: save this to a database
                    }
                }
            }
        }

         // Increment after save
        if (selected + 1 < pdfs.size()) {
            selected++;
        } else {
            selected = -1;
        }
    }
    
    @GetMapping("/pwd")
    String pwd(){
        return path.toString();
    }

    @GetMapping("/ls")
    String[] ls(){
        File[] fs = path.listFiles(File::isDirectory);
        if (fs == null) {
            return null;
        }
        String[] p = new String[fs.length];
        for (int i=0; i<fs.length; i++) {
            String[] dirs = fs[i].toString().split(File.separator);
            p[i] = dirs[dirs.length-1];
        }
        return p;
    }

    @PostMapping("/open") //Opening a folder
    void open(@RequestBody String directoryname){
        Path p = Paths.get(path.toString(), directoryname).normalize();
        path = new File(p.toUri());

        refreshPDFSGlobal();
    }

    private void refreshPDFSGlobal(){
        pdfs = new ArrayList<File>();
        File[] fs = path.listFiles(File::isFile);
        for (int i=0; i<fs.length; i++) {
            if (fs[i].getName().endsWith(".pdf")){
                pdfs.add(fs[i]);
            }
        }
    }

    // ID is 1 indexed so the frontend can use currentPDF as the pdf id
    @GetMapping(path = "/pdf/{id}", produces = "application/pdf")
    ResponseEntity<byte[]> pdf(@PathVariable("id") int id) {
        id = id-1;
        if (id < 0 || id > pdfs.size()) {
            return ResponseEntity.badRequest().body(new byte[]{});
        }
        File filename = pdfs.get(id);
        try (FileInputStream fis = new FileInputStream(filename)){ 
            byte[] out = fis.readAllBytes();
            return ResponseEntity.ok().cacheControl(CacheControl.noCache()).body(out);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.internalServerError().body(new byte[]{});
        }
    }
}