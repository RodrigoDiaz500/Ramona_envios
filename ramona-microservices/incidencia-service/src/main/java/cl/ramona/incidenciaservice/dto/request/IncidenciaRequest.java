package cl.ramona.incidenciaservice.dto.request;
import jakarta.validation.constraints.*;
public record IncidenciaRequest(@NotNull(message="La solicitud es obligatoria") Long solicitudEnvioId,@NotBlank(message="El título es obligatorio") @Size(max=150,message="El título no puede superar los 150 caracteres") String titulo,@NotBlank(message="La descripción es obligatoria") String descripcion,@NotNull(message="El usuario creador es obligatorio") Long creadaPorId,Long asignadaAId) {}
