package rouven.bender.erechnungssplitter;

import java.io.File;
import java.nio.file.Paths;
import java.util.ArrayList;

import org.springframework.web.bind.annotation.*;

import rouven.bender.erechnungssplitter.models.MandantenSelector;

@RestController
public class management_api {
    private Config cfg;
    private String basepath;

    management_api(){
        cfg = Config.getInstance();
        basepath = cfg.getSetting("basepath").toString();
    }
    
    @PostMapping("/api/management/export")
    void export(@RequestBody MandantenSelector ms){}
    
    @PostMapping("/api/management/initdb")
    void initDatabase(@RequestBody MandantenSelector ms){}

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
