package cl.ramona.sucursalservice.dto.response;

import java.time.LocalDateTime;

public record SucursalResponse(
        Long id,
        String nombre,
        String direccion,
        String ciudad,
        String telefono,
        Boolean habilitada,
        LocalDateTime fechaCreacion
) {
}