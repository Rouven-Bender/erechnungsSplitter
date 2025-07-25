package rouven.bender.erechnungssplitter;

import java.io.*;
import java.nio.file.*;
import java.sql.SQLException;
import java.util.*;

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

    private String mandant = "";
    private String year = "";
    private String month = "";

    private Account[] accounts;
    private HashMap<String, String> Personenkontos;

    RestAPI() {
        cfg = Config.getInstance();
        basepath = cfg.getSetting("basepath").toString();
    }

    private void init() {
        path = new File(Paths.get(basepath, mandant, year, month).toString());

        try {
            db = database.getInstance(mandant, year, month).get();
        } catch (Exception e) {
            System.out.println(e.getMessage());
            System.exit(1);
        }
        accounts = db.getAccounts().orElse(null);
        Personenkontos = db.getPersonenkonten().orElse(null);
        if (accounts == null || Personenkontos == null) {
            System.out.println("Konten oder Personenkonten konnten nicht geladen werden");
            System.exit(1);
        }

        refreshPDFSGlobal();
    }
    
    private byte[] getindexdothtml() {
        try { 
            ClassLoader cl = Thread.currentThread().getContextClassLoader();
            InputStream is = cl.getResourceAsStream("static/index.html");
            if (is == null) {
                throw new IOException("input stream couldn' find file");
            }
            return is.readAllBytes();
        } catch (IOException e) {
            System.out.println(e.getMessage());
            return new byte[]{};
        }
    }

    @GetMapping(path= "/element/{id}", produces = "text/html")
    byte[] index(@PathVariable("id") String id) {
        return getindexdothtml();
    }
    @GetMapping(path= "/management", produces = "text/html")
    byte[] management() {
        return getindexdothtml();
    }

    @GetMapping("/api/ui/{id}/accounteddata")
    AccountedPosition[] getAccountedData(@PathVariable("id") int id) {
        if (invoiceDatas == null) {
            return new AccountedPosition[0];
        }
        if (id < invoiceDatas.size() && id >= 0) {
            InvoiceData ivd = invoiceDatas.get(id);
            if (ivd != null) {
                String personenkonto = Optional.ofNullable(Personenkontos.get(ivd.sender.name)).orElse("");
                return db.getBookedData(ivd.invoiceNumber, personenkonto).orElse(new AccountedPosition[0]);
            }
        }
        return new AccountedPosition[0];
    }
    
    @PostMapping("/api/select/mandant")
    void selectMandant(@RequestBody MandantenSelector m){
        if (m.mandant == null || m.year == null || m.month == null) {
            return;
        }
        mandant = m.mandant;
        year = m.year;
        month = m.month;
        init();
    }

    // returns empty json for invoices that don't exist
    @GetMapping("/api/ui/{id}/invoicedata")
    ResponseEntity<InvoiceData> getInvoicedata(@PathVariable("id") int id) {
        if (invoiceDatas == null) {
            return ResponseEntity.noContent().build();
        }
        if (id < invoiceDatas.size() && id >= 0){
            return ResponseEntity.ok().body(Optional.ofNullable(invoiceDatas.get(id)).orElse(new InvoiceData()));
        }
        return ResponseEntity.ok().body(new InvoiceData());
    }

    @GetMapping("/api/ui/{id}/personenkonto") 
    ResponseEntity<personenkonto> getPersonenkonto(@PathVariable("id") int id){
        if (invoiceDatas == null) {
            return ResponseEntity.noContent().build();
        }
        if (id < invoiceDatas.size()){
            InvoiceData iv = invoiceDatas.get(id);
            if (iv == null) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok().body(new personenkonto(Optional.ofNullable(Personenkontos.get(iv.sender.name)).orElse("")));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/api/ui/accounts")
    Account[] getAccounts() {
        return accounts;
    }

    @GetMapping("/api/ui/numberofPDFs")
    int getNumberOfPDFS() {
        if (pdfs == null) {
            return -1;
        }
        return pdfs.size();
    }

    @PostMapping("/api/add/personenkonto")
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

    @PostMapping("/api/{id}/book")
    void book(@RequestBody BookingRequest request, @PathVariable("id") int id) { //TODO get error to client
        if (request.accounts == null)
        {
            System.out.println("empty request");
            return;
        }

        if (invoiceDatas.get(id) == null) {
            System.out.println("can't book this invoice");
            return;
        }

        String pk = Personenkontos.get(invoiceDatas.get(id).sender.name);
        if (pk == null) {
            System.out.println("kein Personenkonto für Sender");
            return;
        }

        String ivNumber = invoiceDatas.get(id).invoiceNumber;
        if (db.invoiceBooked(ivNumber, pk)) {
            db.deleteBookedInvoice(ivNumber, pk);
        }

        if (request.accounts != null) {
            if (request.accounts[0].listId.equals("0")) {
                InvoiceData ivd = invoiceDatas.get(id);
                AccountingRow accRow = new AccountingRow();
                accRow.betrag = ivd.invoiceTotal;
                accRow.datum = ivd.datum;
                accRow.rechnungsnummer = ivNumber;
                accRow.text = ivd.sender.name;
                accRow.personenkonto = pk; 
                accRow.aufwandskonto = request.accounts[0].accountNumber;
                try {
                    db.bookAccountingRow(accRow); // TODO: check return bool and send result to client
                } catch (SQLException e){
                    System.out.println(e.getMessage());
                    return;
                }
            } else {
                for (int i = 0; i < request.accounts.length; i++) {
                    AccountedPosition p = request.accounts[i];
                    InvoiceData ivd = invoiceDatas.get(id);
                    Position ip = invoiceDatas.get(id).positions[Integer.valueOf(p.listId) - 1];
                    AccountingRow accRow = new AccountingRow();

                    accRow.betrag = ip.total;
                    accRow.datum = ivd.datum;
                    accRow.rechnungsnummer = ivNumber;
                    accRow.text = ivd.sender.name + " : " +  p.listId;
                    accRow.personenkonto = pk;
                    accRow.aufwandskonto = p.accountNumber;
                    try {
                        db.bookAccountingRow(accRow);
                    } catch (SQLException e) {
                        System.out.println(e.getMessage());
                        return;
                    }
                }
            }
        }
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
        if (pdfs == null) {
            return ResponseEntity.noContent().build();
        }
        if (id < 0 || id >= pdfs.size()) {
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