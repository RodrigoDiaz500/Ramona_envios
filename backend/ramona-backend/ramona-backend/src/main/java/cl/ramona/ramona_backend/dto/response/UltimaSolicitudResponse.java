package cl.ramona.ramona_backend.dto.response;

public record UltimaSolicitudResponse(
        Long id,
        String codigoSeguimiento,
        String estado,
        String origen,
        String destino,
        String destinatario
) {
}