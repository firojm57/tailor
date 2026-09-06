package org.frj.saas.tailor;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

/**
 * Smoke test: verifies the full Spring application context loads without errors.
 * The jwt.secret is supplied via TestPropertySource so the test is self-contained
 * and does not depend on any environment variable.
 */
@SpringBootTest
@TestPropertySource(properties = {
        "jwt.secret=test-jwt-secret-key-for-unit-tests-minimum-32-characters!",
        "spring.datasource.url=jdbc:sqlite:file::memory:?cache=shared",
        "spring.sql.init.mode=always"
})
class TailorServiceApplicationTests {

    @Test
    void contextLoads() {
        // Passes if the Spring ApplicationContext starts without errors.
    }
}
