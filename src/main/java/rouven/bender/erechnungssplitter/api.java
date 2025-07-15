package rouven.bender.erechnungssplitter;

import java.io.File;
import java.io.FileInputStream;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Optional;

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
    private ArrayList<InvoiceData> invoiceDatas;

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

    // returns empty json for invoices that don't exist
    @GetMapping("/ui/invoicedata/{id}")
    InvoiceData getInvoicedata(@PathVariable("id") int id) {
        if (id < invoiceDatas.size() && id >= 0){
            return Optional.ofNullable(invoiceDatas.get(id)).orElse(new InvoiceData());
        }
        return new InvoiceData();
    }

    @GetMapping("/ui/personenkonto/{id}") 
    personenkonto getPersonenkonto(@PathVariable("id") int id){
        if (id < invoiceDatas.size()){
            InvoiceData iv = invoiceDatas.get(id);
            if (iv == null) {
                return new personenkonto("");
            }
            return new personenkonto(Optional.ofNullable(Personenkontos.get(iv.sender.name)).orElse(""));
        }
        return new personenkonto("");
    }

    @GetMapping("/ui/accounts")
    Account[] getAccounts() {
        return accounts;
    }

    //TODO: turn into json endpoint
    @GetMapping("/ui/numberofPDFs")
    int getNumberOfPDFS() {
        return pdfs.size();
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

    @PostMapping("/book/{id}")
    void book(@RequestBody BookingRequest request, @PathVariable("id") int id) {
        if (request.accounts == null)
        {
            System.out.println("empty request");
            return;
        }

        if (invoiceDatas.get(id) == null) {
            System.out.println("can't book this invoice");
            return;
        }

        if (request.accounts != null) {
            if (request.accounts[0].listId.equals("0")) {
                System.out.printf("Ganze Rechnung: %s", request.accounts[0].accountNumber);
            } else {
                System.out.printf("Rechnungsnumber: %s, ", invoiceDatas.get(id).invoiceNumber);
                for (int i = 0; i < request.accounts.length; i++) {
                    AccountedPosition p = request.accounts[i];
                    Position ip = invoiceDatas.get(id).positions[Integer.valueOf(p.listId) - 1];
                    System.out.printf("Produktname: %s, ", ip.productName);
                    System.out.printf("Position: %s, Accountnummer: %s\n", p.listId, p.accountNumber); // TODO: save this to a database
                }
            }
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
        invoiceDatas = new ArrayList<>();
        for (int i=0; i<pdfs.size(); i++) {
            invoiceDatas.add(i, Zugferd.getInvoiceData(pdfs.get(i)).orElse(null));
        }
    }

    // ID is 1 indexed so the frontend can use currentPDF as the pdf id
    @GetMapping(path = "/pdf/{id}", produces = "application/pdf")
    ResponseEntity<byte[]> pdf(@PathVariable("id") int id) {
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