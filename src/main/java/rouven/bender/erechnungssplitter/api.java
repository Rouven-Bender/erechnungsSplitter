package rouven.bender.erechnungssplitter;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class RestAPI {
    RestAPI() {}
    
    @GetMapping("/open")
    void open(){
        System.out.println("got to open");
    }
}