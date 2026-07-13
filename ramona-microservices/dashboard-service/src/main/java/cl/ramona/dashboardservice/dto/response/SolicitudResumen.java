package cl.ramona.dashboardservice.dto.response;
import java.time.LocalDateTime;
public record SolicitudResumen(Long id, String codigoSeguimiento, String estado, SucursalResumen sucursalOrigen,
                               SucursalResumen sucursalDestino, String destinatarioNombre, LocalDateTime fechaCreacion) {}
