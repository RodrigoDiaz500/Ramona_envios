package cl.ramona.ramona_backend.controller;

import cl.ramona.ramona_backend.dto.response.ApiResponse;
import cl.ramona.ramona_backend.dto.response.DashboardResponse;
import cl.ramona.ramona_backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ApiResponse<DashboardResponse> obtenerResumen() {
        return ApiResponse.ok(
                "Resumen del dashboard obtenido correctamente",
                dashboardService.obtenerResumen()
        );
    }
}