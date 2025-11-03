package com.cpassist;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.data.mongodb.uri=mongodb://localhost:27017/cpassist_test"
})
class CpassistApplicationTests {

    @Test
    void contextLoads() {
    }
}
