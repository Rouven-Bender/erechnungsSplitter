package rouven.bender.erechnungssplitter;

import java.io.File;
import java.io.FileReader;
import java.nio.file.Paths;
import java.util.Properties;

public class Config {
    private File configFile;
    private Properties config;

    private static Config instance;

    private Config(){
        configFile = new File(Paths.get(System.getProperty("user.home"), ".config", "erechnungssplitter.cfg.properties").toString());
        if (!configFile.canRead()){
            System.out.printf("Keine Konfig gefunden am Pfad: %s", configFile.toPath().toString());
            System.exit(1);
        }
        config = new Properties();
        try {
            config.load(new FileReader(configFile));
        } catch (Exception e){
            System.out.print(e.getMessage());
            System.exit(1);
        }
    }

    public static Config getInstance() {
        if (instance == null) {
            instance = new Config();
        }
        return instance;
    }
    public Object getSetting(String key){
        return config.get(key);
    }
}
