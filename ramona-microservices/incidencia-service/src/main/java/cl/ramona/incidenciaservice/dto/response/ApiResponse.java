package cl.ramona.incidenciaservice.dto.response;
import java.time.LocalDateTime;
public record ApiResponse<T>(boolean success,String message,T data,LocalDateTime timestamp){ public static <T> ApiResponse<T> ok(String m,T d){ return new ApiResponse<>(true,m,d,LocalDateTime.now()); } }
