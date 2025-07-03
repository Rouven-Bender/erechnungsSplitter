package rouven.bender.erechnungssplitter;

import java.io.File;
import java.io.FileInputStream;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import rouven.bender.erechnungssplitter.models.Account;
import rouven.bender.erechnungssplitter.models.BookingRequest;
import rouven.bender.erechnungssplitter.models.Display;

@RestController
class RestAPI {
    private Config cfg;
    private File path;
    private String basepath;
    private ArrayList<File> pdfs;
    private int selected = 0;

    private Account[] accounts = Account.getAccounts();

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
        Display out = new Display();
        out.currentOfPDFS = selected + 1;
        out.numberOfPDFS = pdfs.size();
        out.invoice = Zugferd.getInvoiceData(pdfs.get(selected)).orElse(null);
        out.accounts = accounts;
        return out;
    }

    @GetMapping("/reset")
    void reset(){
        path = new File(basepath);
    }

    @PostMapping("/book")
    int book(@RequestBody BookingRequest request) {
        System.out.println(request.account); //TODO: save this to a database
        if (selected + 1 < pdfs.size()) {
            selected++;
        } else {
            selected = -1;
        }
        return 200;
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

    @GetMapping(path = "/pdf", produces = "application/pdf")
    ResponseEntity<byte[]> pdf() {
        File filename = pdfs.get(0);
        try (FileInputStream fis = new FileInputStream(filename)){ 
            byte[] out = fis.readAllBytes();
            return ResponseEntity.ok().cacheControl(CacheControl.noCache()).body(out);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.internalServerError().body(new byte[]{});
        }
    }
}