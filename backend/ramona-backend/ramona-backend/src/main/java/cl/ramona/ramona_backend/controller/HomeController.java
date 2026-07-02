package cl.ramona.ramona_backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class HomeController {

    @GetMapping
    public String test() {
        return "Backend funcionando";
    }
}