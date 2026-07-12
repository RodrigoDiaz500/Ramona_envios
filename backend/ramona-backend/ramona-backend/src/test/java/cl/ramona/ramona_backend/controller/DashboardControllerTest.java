package cl.ramona.ramona_backend.controller;

import cl.ramona.ramona_backend.dto.response.ApiResponse;
import cl.ramona.ramona_backend.dto.response.DashboardResponse;
import cl.ramona.ramona_backend.service.DashboardService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardControllerTest {

    @Mock
    private DashboardService dashboardService;

    @Mock
    private DashboardResponse dashboardResponse;

    private DashboardController dashboardController;

    @BeforeEach
    void setUp() {
        dashboardController =
                new DashboardController(dashboardService);
    }

    @Test
    @DisplayName("Debe obtener correctamente el resumen del dashboard")
    void debeObtenerResumenDashboard() {
        when(dashboardService.obtenerResumen())
                .thenReturn(dashboardResponse);

        ApiResponse<DashboardResponse> response =
                dashboardController.obtenerResumen();

        assertThat(response).isNotNull();
        assertThat(response.success()).isTrue();

        assertThat(response.message())
                .isEqualTo(
                        "Resumen del dashboard obtenido correctamente"
                );

        assertThat(response.data())
                .isSameAs(dashboardResponse);

        assertThat(response.timestamp())
                .isNotNull();

        verify(dashboardService)
                .obtenerResumen();
    }
}