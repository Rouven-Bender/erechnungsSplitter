package rouven.bender.erechnungssplitter;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
class RestAPI {
    private File f;
    private String basepath;
    RestAPI() {
        basepath = System.getProperty("user.home");
        f = new File(basepath);
    }

    @GetMapping("/reset")
    void reset(){
        f = new File(basepath);
    }
    
    @GetMapping("/pwd")
    String pwd(){
        return f.toString();
    }

    @GetMapping("/ls")
    String[] ls(){
        File[] fs = f.listFiles(File::isDirectory);
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
        Path p = Paths.get(f.toString(), directoryname).normalize();
        f = new File(p.toUri());
    }
}