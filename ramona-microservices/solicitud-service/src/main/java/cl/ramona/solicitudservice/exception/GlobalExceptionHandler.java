package cl.ramona.solicitudservice.exception;
import cl.ramona.solicitudservice.dto.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.stream.Collectors;
@RestControllerAdvice
public class GlobalExceptionHandler {
 @ExceptionHandler(ResourceNotFoundException.class) @ResponseStatus(HttpStatus.NOT_FOUND)
 ApiResponse<Void> notFound(ResourceNotFoundException ex){ return new ApiResponse<>(false,ex.getMessage(),null,LocalDateTime.now()); }
 @ExceptionHandler(IllegalArgumentException.class) @ResponseStatus(HttpStatus.BAD_REQUEST)
 ApiResponse<Void> badRequest(IllegalArgumentException ex){ return new ApiResponse<>(false,ex.getMessage(),null,LocalDateTime.now()); }
 @ExceptionHandler(MethodArgumentNotValidException.class) @ResponseStatus(HttpStatus.BAD_REQUEST)
 ApiResponse<Void> validation(MethodArgumentNotValidException ex){ String message=ex.getBindingResult().getFieldErrors().stream().map(e->e.getField()+": "+e.getDefaultMessage()).collect(Collectors.joining(", ")); return new ApiResponse<>(false,message,null,LocalDateTime.now()); }
}
