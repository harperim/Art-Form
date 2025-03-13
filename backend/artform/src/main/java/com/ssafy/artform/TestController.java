package com.ssafy.artform;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/spring")
public class TestController {
    private final TestService testService;

    @PostMapping("/test")
    public ResponseEntity<?> dbTest(){
        return null;
    }
}
