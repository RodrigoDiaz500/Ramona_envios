package cl.ramona.seguimientoservice.dto.response;

import java.time.LocalDateTime;

public record UsuarioResponse(
        Long id,
        String nombre,
        String apellido,
        String correo,
        String telefono,
        String direccion,
        Boolean activo,
        String entraId,
        RolResponse rol,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaActualizacion
) {}
