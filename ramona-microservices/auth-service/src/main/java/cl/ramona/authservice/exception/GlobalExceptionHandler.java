package cl.ramona.authservice.exception;

import cl.ramona.authservice.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UsuarioDeshabilitadoException.class)
    public ResponseEntity<ApiResponse<Void>> handleDisabled(
            UsuarioDeshabilitadoException ex
    ) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(error(ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(
            IllegalArgumentException ex
    ) {
        return ResponseEntity
                .badRequest()
                .body(error(ex.getMessage()));
    }

    @ExceptionHandler(RestClientResponseException.class)
    public ResponseEntity<ApiResponse<Void>> handleUsuarioServiceResponse(
            RestClientResponseException ex
    ) {
        log.error(
                "usuario-service respondió con estado {}. Respuesta: {}",
                ex.getStatusCode(),
                ex.getResponseBodyAsString(),
                ex
        );

        return ResponseEntity
                .status(HttpStatus.BAD_GATEWAY)
                .body(error(
                        "usuario-service rechazó la sincronización del usuario. " +
                        "Revisa la consola de auth-service para ver el detalle."
                ));
    }

    @ExceptionHandler(ResourceAccessException.class)
    public ResponseEntity<ApiResponse<Void>> handleUsuarioServiceUnavailable(
            ResourceAccessException ex
    ) {
        log.error("No fue posible conectar con usuario-service", ex);

        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(error(
                        "usuario-service no está disponible en http://localhost:8081"
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneral(Exception ex) {
        log.error("Error no controlado en auth-service", ex);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(error(
                        "Error interno durante la sincronización del usuario"
                ));
    }

    private ApiResponse<Void> error(String message) {
        return new ApiResponse<>(
                false,
                message,
                null,
                java.time.LocalDateTime.now()
        );
    }
}
