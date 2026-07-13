package cl.ramona.authservice.dto;

public record PerfilAutenticadoResponse(
        Long id,
        String nombre,
        String apellido,
        String correo,
        Boolean activo,
        String entraId,
        RolResponse rol
) {
    public static PerfilAutenticadoResponse from(UsuarioResponse usuario) {
        return new PerfilAutenticadoResponse(
                usuario.id(), usuario.nombre(), usuario.apellido(), usuario.correo(),
                usuario.activo(), usuario.entraId(), usuario.rol()
        );
    }
}
