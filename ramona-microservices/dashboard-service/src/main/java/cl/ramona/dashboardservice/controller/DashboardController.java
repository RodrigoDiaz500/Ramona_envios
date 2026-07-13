package cl.ramona.dashboardservice.controller;
import cl.ramona.dashboardservice.dto.response.ApiResponse;
import cl.ramona.dashboardservice.dto.response.DashboardResponse;
import cl.ramona.dashboardservice.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService service;
    @GetMapping public ApiResponse<DashboardResponse> obtenerResumen() {
        return ApiResponse.ok("Resumen del dashboard obtenido correctamente", service.obtenerResumen());
    }
}
