package cl.ramona.solicitudservice.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CrearSolicitudRequest(
        @NotNull(message = "El usuario es obligatorio")
        Long usuarioId,

        @NotNull(message = "La sucursal de origen es obligatoria")
        Long sucursalOrigenId,

        @NotNull(message = "La sucursal de destino es obligatoria")
        Long sucursalDestinoId,

        @Size(max = 500, message = "La descripción no puede superar los 500 caracteres")
        String descripcion,

        @DecimalMin(value = "0.01", message = "El peso debe ser mayor a 0")
        BigDecimal peso,

        @DecimalMin(value = "0.0", message = "El valor declarado no puede ser negativo")
        BigDecimal valorDeclarado,

        @NotBlank(message = "El nombre del destinatario es obligatorio")
        @Size(max = 150, message = "El nombre del destinatario no puede superar los 150 caracteres")
        String destinatarioNombre,

        @NotBlank(message = "El RUT/DNI del destinatario es obligatorio")
        @Size(max = 20, message = "El RUT/DNI no puede superar los 20 caracteres")
        String destinatarioRutDni,

        @NotBlank(message = "El teléfono del destinatario es obligatorio")
        @Size(max = 20, message = "El teléfono no puede superar los 20 caracteres")
        String destinatarioTelefono
) {
}
