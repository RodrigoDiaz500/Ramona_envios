package cl.ramona.ramona_backend.controller;

import cl.ramona.ramona_backend.dto.request.ResenaRequest;
import cl.ramona.ramona_backend.dto.response.ApiResponse;
import cl.ramona.ramona_backend.dto.response.ResenaResponse;
import cl.ramona.ramona_backend.service.ResenaService;
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
class ResenaControllerTest {

    @Mock
    private ResenaService resenaService;

    @Mock
    private ResenaRequest resenaRequest;

    @Mock
    private ResenaResponse primeraResena;

    @Mock
    private ResenaResponse segundaResena;

    private ResenaController resenaController;

    @BeforeEach
    void setUp() {
        resenaController = new ResenaController(resenaService);
    }

    @Test
    @DisplayName("Debe crear una reseña correctamente")
    void debeCrearResena() {
        when(resenaService.crearResena(resenaRequest))
                .thenReturn(primeraResena);

        ApiResponse<ResenaResponse> response =
                resenaController.crearResena(resenaRequest);

        assertThat(response).isNotNull();
        assertThat(response.success()).isTrue();

        assertThat(response.message())
                .isEqualTo("Reseña creada correctamente");

        assertThat(response.data())
                .isSameAs(primeraResena);

        assertThat(response.timestamp())
                .isNotNull();

        verify(resenaService)
                .crearResena(resenaRequest);
    }

    @Test
    @DisplayName("Debe listar todas las reseñas")
    void debeListarResenas() {
        List<ResenaResponse> resenas = List.of(
                primeraResena,
                segundaResena
        );

        when(resenaService.listarResenas())
                .thenReturn(resenas);

        ApiResponse<List<ResenaResponse>> response =
                resenaController.listarResenas();

        assertThat(response).isNotNull();
        assertThat(response.success()).isTrue();

        assertThat(response.message())
                .isEqualTo("Reseñas obtenidas correctamente");

        assertThat(response.data())
                .hasSize(2)
                .containsExactly(
                        primeraResena,
                        segundaResena
                );

        assertThat(response.timestamp())
                .isNotNull();

        verify(resenaService)
                .listarResenas();
    }

    @Test
    @DisplayName("Debe retornar una lista vacía cuando no existen reseñas")
    void debeRetornarListaVacia() {
        when(resenaService.listarResenas())
                .thenReturn(List.of());

        ApiResponse<List<ResenaResponse>> response =
                resenaController.listarResenas();

        assertThat(response).isNotNull();
        assertThat(response.success()).isTrue();

        assertThat(response.message())
                .isEqualTo("Reseñas obtenidas correctamente");

        assertThat(response.data())
                .isEmpty();

        verify(resenaService)
                .listarResenas();
    }

    @Test
    @DisplayName("Debe listar las reseñas asociadas a un usuario")
    void debeListarResenasPorUsuario() {
        Long usuarioId = 10L;

        when(resenaService.listarPorUsuario(usuarioId))
                .thenReturn(List.of(
                        primeraResena,
                        segundaResena
                ));

        ApiResponse<List<ResenaResponse>> response =
                resenaController.listarPorUsuario(usuarioId);

        assertThat(response).isNotNull();
        assertThat(response.success()).isTrue();

        assertThat(response.message())
                .isEqualTo(
                        "Reseñas del usuario obtenidas correctamente"
                );

        assertThat(response.data())
                .hasSize(2)
                .containsExactly(
                        primeraResena,
                        segundaResena
                );

        assertThat(response.timestamp())
                .isNotNull();

        verify(resenaService)
                .listarPorUsuario(usuarioId);
    }

    @Test
    @DisplayName("Debe retornar lista vacía cuando el usuario no tiene reseñas")
    void debeRetornarListaVaciaPorUsuario() {
        Long usuarioId = 10L;

        when(resenaService.listarPorUsuario(usuarioId))
                .thenReturn(List.of());

        ApiResponse<List<ResenaResponse>> response =
                resenaController.listarPorUsuario(usuarioId);

        assertThat(response).isNotNull();
        assertThat(response.success()).isTrue();

        assertThat(response.data())
                .isEmpty();

        verify(resenaService)
                .listarPorUsuario(usuarioId);
    }

    @Test
    @DisplayName("Debe obtener la reseña asociada a una solicitud")
    void debeObtenerResenaPorSolicitud() {
        Long solicitudEnvioId = 500L;

        when(resenaService.obtenerPorSolicitud(solicitudEnvioId))
                .thenReturn(primeraResena);

        ApiResponse<ResenaResponse> response =
                resenaController.obtenerPorSolicitud(
                        solicitudEnvioId
                );

        assertThat(response).isNotNull();
        assertThat(response.success()).isTrue();

        assertThat(response.message())
                .isEqualTo("Reseña obtenida correctamente");

        assertThat(response.data())
                .isSameAs(primeraResena);

        assertThat(response.timestamp())
                .isNotNull();

        verify(resenaService)
                .obtenerPorSolicitud(solicitudEnvioId);
    }
}