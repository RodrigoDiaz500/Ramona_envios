package cl.ramona.dashboardservice.dto.response;
import java.math.BigDecimal;
import java.util.List;
public record DashboardResponse(long totalSolicitudes, long pendientes, long aprobadas, long enPreparacion,
                                long enTransito, long entregadas, long rechazadas, long totalUsuarios,
                                long totalSucursales, long incidenciasAbiertas, BigDecimal promedioResenas,
                                List<UltimaSolicitudResponse> ultimasSolicitudes) {}
