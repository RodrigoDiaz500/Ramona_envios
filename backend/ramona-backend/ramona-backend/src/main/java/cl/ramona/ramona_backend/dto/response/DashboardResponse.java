package cl.ramona.ramona_backend.dto.response;

public record DashboardResponse(
        long totalSolicitudes,
        long pendientes,
        long aprobadas,
        long enPreparacion,
        long enTransito,
        long entregadas,
        long rechazadas,
        long totalUsuarios,
        long totalSucursales
) {
}