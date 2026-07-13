package cl.ramona.solicitudservice.dto.response;
import cl.ramona.solicitudservice.enums.EstadoSolicitud;
import java.math.BigDecimal;
import java.time.LocalDateTime;
public record SolicitudEnvioResponse(Long id,String codigoSeguimiento,UsuarioResponse usuario,SucursalResponse sucursalOrigen,SucursalResponse sucursalDestino,String descripcion,BigDecimal peso,BigDecimal valorDeclarado,EstadoSolicitud estado,String destinatarioNombre,String destinatarioRutDni,String destinatarioTelefono,LocalDateTime fechaCreacion,LocalDateTime fechaAprobacion,UsuarioResponse aprobadoPor) {}
