package cl.ramona.dashboardservice.service.impl;
import cl.ramona.dashboardservice.client.*;
import cl.ramona.dashboardservice.dto.response.*;
import cl.ramona.dashboardservice.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {
    private final SolicitudClient solicitudClient;
    private final UsuarioClient usuarioClient;
    private final SucursalClient sucursalClient;
    private final IncidenciaClient incidenciaClient;
    private final ResenaClient resenaClient;
    @Override public DashboardResponse obtenerResumen() {
        List<SolicitudResumen> solicitudes = solicitudClient.listar();
        List<IncidenciaResumen> incidencias = incidenciaClient.listar();
        List<UltimaSolicitudResponse> ultimas = solicitudes.stream()
                .sorted(Comparator.comparing(s -> s.fechaCreacion() == null ? LocalDateTime.MIN : s.fechaCreacion(), Comparator.reverseOrder()))
                .limit(5).map(this::mapear).toList();
        return new DashboardResponse(
                solicitudes.size(), contarEstado(solicitudes,"PENDIENTE_APROBACION"), contarEstado(solicitudes,"APROBADO"),
                contarEstado(solicitudes,"EN_PREPARACION"), contarEstado(solicitudes,"EN_TRANSITO"),
                contarEstado(solicitudes,"ENTREGADO"), contarEstado(solicitudes,"RECHAZADO"),
                usuarioClient.contar(), sucursalClient.contar(),
                incidencias.stream().filter(i -> "ABIERTA".equalsIgnoreCase(i.estado())).count(),
                resenaClient.promedio(), ultimas);
    }
    private long contarEstado(List<SolicitudResumen> solicitudes, String estado) {
        return solicitudes.stream().filter(s -> estado.equalsIgnoreCase(s.estado())).count();
    }
    private UltimaSolicitudResponse mapear(SolicitudResumen s) {
        return new UltimaSolicitudResponse(s.id(), s.codigoSeguimiento(), s.estado(),
                s.sucursalOrigen() == null ? null : s.sucursalOrigen().ciudad(),
                s.sucursalDestino() == null ? null : s.sucursalDestino().ciudad(), s.destinatarioNombre());
    }
}
