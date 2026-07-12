package cl.ramona.ramona_backend.controller;

import cl.ramona.ramona_backend.dto.response.ApiResponse;
import cl.ramona.ramona_backend.dto.response.RolResponse;
import cl.ramona.ramona_backend.service.RolService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RolControllerTest {

    @Mock
    private RolService rolService;

    private RolController rolController;

    @BeforeEach
    void setUp() {
        rolController = new RolController(rolService);
    }

    @Test
    @DisplayName("Debe listar correctamente todos los roles")
    void debeListarRoles() {
        List<RolResponse> roles = List.of(
                new RolResponse(1L, "CLIENTE"),
                new RolResponse(2L, "OPERADOR"),
                new RolResponse(3L, "ADMIN")
        );

        when(rolService.listarRoles())
                .thenReturn(roles);

        ApiResponse<List<RolResponse>> response =
                rolController.listarRoles();

        assertThat(response).isNotNull();
        assertThat(response.success()).isTrue();

        assertThat(response.message())
                .isEqualTo("Roles obtenidos correctamente");

        assertThat(response.data())
                .hasSize(3);

        assertThat(response.data())
                .extracting(RolResponse::nombre)
                .containsExactly(
                        "CLIENTE",
                        "OPERADOR",
                        "ADMIN"
                );

        assertThat(response.timestamp())
                .isNotNull();

        verify(rolService)
                .listarRoles();
    }

    @Test
    @DisplayName("Debe retornar lista vacía cuando no existen roles")
    void debeRetornarListaVacia() {
        when(rolService.listarRoles())
                .thenReturn(List.of());

        ApiResponse<List<RolResponse>> response =
                rolController.listarRoles();

        assertThat(response).isNotNull();
        assertThat(response.success()).isTrue();

        assertThat(response.message())
                .isEqualTo("Roles obtenidos correctamente");

        assertThat(response.data())
                .isEmpty();

        assertThat(response.timestamp())
                .isNotNull();

        verify(rolService)
                .listarRoles();
    }
}