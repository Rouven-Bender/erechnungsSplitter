package rouven.bender.erechnungssplitter;

import java.io.File;
import java.io.FileInputStream;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import rouven.bender.erechnungssplitter.models.*;

@RestController
class RestAPI {
    private Config cfg;
    private File path;
    private String basepath;
    private ArrayList<File> pdfs;
    private int selected = 0;
    private Display out;

    private Account[] accounts = Account.getAccounts();
    private HashMap<String, String> Personenkontos = Account.getPersonenkontos();

    RestAPI() {
        cfg = Config.getInstance();
        basepath = cfg.getSetting("basepath").toString();
        path = new File(basepath);

        refreshPDFSGlobal();
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

    @GetMapping("/reset")
    void reset(){
        path = new File(basepath);
    }

    @PostMapping("/book")
    void book(@RequestBody BookingRequest request) {
        if (request.fullInvoice == null && request.accounts == null 
        &&  request.fullInvoice != null && request.accounts != null)
        {
            System.out.println("empty request");
            return;
        }

        if (request.fullInvoice != null) {
            System.out.println(request.fullInvoice);
        }
        if (request.accounts != null) {
            System.out.printf("Rechnungsnumber: %s, ", out.invoice.invoiceNumber);
            for (int i = 0; i < request.accounts.length; i++) {
                AccountedPosition p = request.accounts[i];
                Position ip = out.invoice.positions[Integer.valueOf(p.listId)-1];
                System.out.printf("Produktname: %s, ", ip.productName);
                System.out.printf("Position: %s, Accountnummer: %s\n", p.listId, p.accountNumber); //TODO: save this to a database
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