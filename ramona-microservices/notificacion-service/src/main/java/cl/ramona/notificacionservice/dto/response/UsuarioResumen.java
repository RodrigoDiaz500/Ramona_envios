package cl.ramona.notificacionservice.dto.response;

public record UsuarioResumen(
        Long id,
        String nombre,
        String apellido,
        String correo,
        Boolean activo
) {}
