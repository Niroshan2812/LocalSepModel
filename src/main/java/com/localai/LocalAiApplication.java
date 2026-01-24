package com.localai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class LocalAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(LocalAiApplication.class, args);
    }

}
