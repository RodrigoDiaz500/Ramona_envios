package cl.ramona.authservice.dto;

public record UsuarioRequest(
        String nombre,
        String apellido,
        String correo,
        String telefono,
        String direccion,
        String entraId,
        Long roleId
) {}
