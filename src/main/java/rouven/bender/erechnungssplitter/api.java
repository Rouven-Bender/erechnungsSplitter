package rouven.bender.erechnungssplitter;

import java.io.File;
import java.io.FileInputStream;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
class RestAPI {
    private File path;
    private String basepath;
    RestAPI() {
        //TODO: Make this configurable
        basepath = Paths.get(System.getProperty("user.home"), "src", "erechnungsSplitter").toString();
        path = new File(basepath);
    }

    @GetMapping("/reset")
    void reset(){
        path = new File(basepath);
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
    @PostMapping("/open")
    void open(@RequestBody String directoryname){
        Path p = Paths.get(path.toString(), directoryname).normalize();
        path = new File(p.toUri());
    }

    @GetMapping(path = "/pdf", produces = "application/pdf")
    ResponseEntity<byte[]> pdf() {
        File filename = new File(Paths.get(path.toString(), "mustang.pdf").toString());
        try (FileInputStream fis = new FileInputStream(filename)){ 
            byte[] out = fis.readAllBytes();
            return ResponseEntity.ok().cacheControl(CacheControl.noCache()).body(out);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.internalServerError().body(new byte[]{});
        }
    }
}