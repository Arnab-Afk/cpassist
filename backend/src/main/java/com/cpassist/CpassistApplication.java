package com.cpassist;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class CpassistApplication {
    public static void main(String[] args) {
        SpringApplication.run(CpassistApplication.class, args);
    }
}
