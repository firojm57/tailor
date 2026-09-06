package org.frj.saas.tailor.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.jpa.JpaSystemException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/**
 * Centralised exception handler. Translates technical exceptions into
 * client-friendly business error responses. No stack traces or internal
 * implementation details are ever exposed in the response body.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Business validation errors (e.g. duplicate email, invalid credentials).
     * Returned by service layer as {@link IllegalArgumentException}.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBusinessValidation(IllegalArgumentException ex) {
        log.warn("Business validation error: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    /**
     * Database access failures (missing table, connection timeout, constraint
     * violation). These indicate an infrastructure problem, not a user error.
     */
    @ExceptionHandler({ JpaSystemException.class, DataAccessException.class })
    public ResponseEntity<Map<String, String>> handleDatabaseError(Exception ex) {
        log.error("Database error encountered: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("error",
                        "The service is temporarily unavailable. Please wait a moment and try again. "
                        + "If the problem persists, contact your administrator."));
    }

    /**
     * Catch-all for any unexpected runtime exception not handled above.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleUnexpected(Exception ex) {
        log.error("Unexpected application error: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error",
                        "An unexpected error occurred. Please try again. "
                        + "Contact your administrator if this problem continues."));
    }
}
