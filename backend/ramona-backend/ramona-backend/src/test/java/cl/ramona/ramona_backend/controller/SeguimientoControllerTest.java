package cl.ramona.ramona_backend.controller;

import cl.ramona.ramona_backend.dto.request.SeguimientoRequest;
import cl.ramona.ramona_backend.dto.response.RolResponse;
import cl.ramona.ramona_backend.dto.response.SeguimientoResponse;
import cl.ramona.ramona_backend.dto.response.UsuarioResponse;
import cl.ramona.ramona_backend.enums.EstadoSolicitud;
import cl.ramona.ramona_backend.service.SeguimientoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.nullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class SeguimientoControllerTest {

    @Mock
    private SeguimientoService seguimientoService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private UsuarioResponse operadorResponse;
    private SeguimientoResponse seguimientoResponse;

    @BeforeEach
    void setUp() {
        SeguimientoController controller =
                new SeguimientoController(seguimientoService);

        LocalValidatorFactoryBean validator =
                new LocalValidatorFactoryBean();

        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders
                .standaloneSetup(controller)
                .setValidator(validator)
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();

        operadorResponse = new UsuarioResponse(
                20L,
                "Operador",
                "Ramona",
                "operador@ramona.cl",
                "+569 3333 4444",
                "Valparaíso",
                true,
                "entra-operador",
                new RolResponse(2L, "OPERADOR"),
                LocalDateTime.of(2026, 7, 1, 11, 0),
                LocalDateTime.of(2026, 7, 10, 13, 0)
        );

        seguimientoResponse = new SeguimientoResponse(
                1000L,
                500L,
                "RAM-20260712-0001",
                EstadoSolicitud.EN_TRANSITO,
                "El envío salió hacia la sucursal de destino",
                LocalDateTime.of(2026, 7, 12, 14, 30),
                operadorResponse
        );
    }

    @Test
    @DisplayName("POST /api/seguimientos debe crear un seguimiento válido")
    void debeCrearSeguimiento() throws Exception {
        SeguimientoRequest request = new SeguimientoRequest(
                500L,
                EstadoSolicitud.EN_TRANSITO,
                "El envío salió hacia la sucursal de destino",
                20L
        );

        when(seguimientoService.crearSeguimiento(
                any(SeguimientoRequest.class)
        )).thenReturn(seguimientoResponse);

        mockMvc.perform(
                        post("/api/seguimientos")
                                .contentType(MediaType.APPLICATION_JSON)
                                .accept(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpect(content()
                        .contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Seguimiento creado correctamente"))
                .andExpect(jsonPath("$.data.id").value(1000))
                .andExpect(jsonPath("$.data.solicitudEnvioId")
                        .value(500))
                .andExpect(jsonPath("$.data.codigoSeguimiento")
                        .value("RAM-20260712-0001"))
                .andExpect(jsonPath("$.data.estado")
                        .value("EN_TRANSITO"))
                .andExpect(jsonPath("$.data.descripcion")
                        .value("El envío salió hacia la sucursal de destino"))
                .andExpect(jsonPath("$.data.fechaEvento")
                        .exists())
                .andExpect(jsonPath("$.data.usuario.id")
                        .value(20))
                .andExpect(jsonPath("$.data.usuario.nombre")
                        .value("Operador"))
                .andExpect(jsonPath("$.data.usuario.rol.nombre")
                        .value("OPERADOR"))
                .andExpect(jsonPath("$.timestamp")
                        .exists());

        ArgumentCaptor<SeguimientoRequest> captor =
                ArgumentCaptor.forClass(SeguimientoRequest.class);

        verify(seguimientoService)
                .crearSeguimiento(captor.capture());

        SeguimientoRequest recibido = captor.getValue();

        assertThat(recibido.solicitudEnvioId())
                .isEqualTo(500L);

        assertThat(recibido.estado())
                .isEqualTo(EstadoSolicitud.EN_TRANSITO);

        assertThat(recibido.descripcion())
                .isEqualTo(
                        "El envío salió hacia la sucursal de destino"
                );

        assertThat(recibido.usuarioId())
                .isEqualTo(20L);
    }

    @Test
    @DisplayName("POST debe permitir descripción nula")
    void debeCrearSeguimientoSinDescripcion() throws Exception {
        SeguimientoRequest request = new SeguimientoRequest(
                500L,
                EstadoSolicitud.ENTREGADO,
                null,
                20L
        );

        SeguimientoResponse responseSinDescripcion =
                new SeguimientoResponse(
                        1001L,
                        500L,
                        "RAM-20260712-0001",
                        EstadoSolicitud.ENTREGADO,
                        null,
                        LocalDateTime.now(),
                        operadorResponse
                );

        when(seguimientoService.crearSeguimiento(
                any(SeguimientoRequest.class)
        )).thenReturn(responseSinDescripcion);

        mockMvc.perform(
                        post("/api/seguimientos")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1001))
                .andExpect(jsonPath("$.data.estado")
                        .value("ENTREGADO"))
                .andExpect(jsonPath("$.data.descripcion")
                        .value(nullValue()));

        verify(seguimientoService)
                .crearSeguimiento(any(SeguimientoRequest.class));
    }

    @Test
    @DisplayName("POST debe rechazar solicitud nula")
    void debeRechazarSolicitudNula() throws Exception {
        String json = """
                {
                  "solicitudEnvioId": null,
                  "estado": "EN_TRANSITO",
                  "descripcion": "En ruta",
                  "usuarioId": 20
                }
                """;

        mockMvc.perform(
                        post("/api/seguimientos")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(seguimientoService, never())
                .crearSeguimiento(any(SeguimientoRequest.class));
    }

    @Test
    @DisplayName("POST debe rechazar estado nulo")
    void debeRechazarEstadoNulo() throws Exception {
        String json = """
                {
                  "solicitudEnvioId": 500,
                  "estado": null,
                  "descripcion": "En ruta",
                  "usuarioId": 20
                }
                """;

        mockMvc.perform(
                        post("/api/seguimientos")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(seguimientoService, never())
                .crearSeguimiento(any(SeguimientoRequest.class));
    }

    @Test
    @DisplayName("POST debe rechazar un estado inexistente")
    void debeRechazarEstadoInvalido() throws Exception {
        String json = """
                {
                  "solicitudEnvioId": 500,
                  "estado": "ESTADO_INEXISTENTE",
                  "descripcion": "En ruta",
                  "usuarioId": 20
                }
                """;

        mockMvc.perform(
                        post("/api/seguimientos")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(seguimientoService, never())
                .crearSeguimiento(any(SeguimientoRequest.class));
    }

    @Test
    @DisplayName("POST debe rechazar usuario nulo")
    void debeRechazarUsuarioNulo() throws Exception {
        String json = """
                {
                  "solicitudEnvioId": 500,
                  "estado": "EN_TRANSITO",
                  "descripcion": "En ruta",
                  "usuarioId": null
                }
                """;

        mockMvc.perform(
                        post("/api/seguimientos")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(seguimientoService, never())
                .crearSeguimiento(any(SeguimientoRequest.class));
    }

    @Test
    @DisplayName("POST debe rechazar descripción mayor a 255 caracteres")
    void debeRechazarDescripcionDemasiadoLarga() throws Exception {
        String descripcionLarga = "A".repeat(256);

        String json = """
                {
                  "solicitudEnvioId": 500,
                  "estado": "EN_TRANSITO",
                  "descripcion": "%s",
                  "usuarioId": 20
                }
                """.formatted(descripcionLarga);

        mockMvc.perform(
                        post("/api/seguimientos")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(seguimientoService, never())
                .crearSeguimiento(any(SeguimientoRequest.class));
    }

    @Test
    @DisplayName("POST debe aceptar descripción de exactamente 255 caracteres")
    void debeAceptarDescripcionConLongitudMaxima() throws Exception {
        String descripcionMaxima = "A".repeat(255);

        SeguimientoRequest request = new SeguimientoRequest(
                500L,
                EstadoSolicitud.EN_TRANSITO,
                descripcionMaxima,
                20L
        );

        SeguimientoResponse response = new SeguimientoResponse(
                1002L,
                500L,
                "RAM-20260712-0001",
                EstadoSolicitud.EN_TRANSITO,
                descripcionMaxima,
                LocalDateTime.now(),
                operadorResponse
        );

        when(seguimientoService.crearSeguimiento(
                any(SeguimientoRequest.class)
        )).thenReturn(response);

        mockMvc.perform(
                        post("/api/seguimientos")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1002))
                .andExpect(jsonPath("$.data.descripcion")
                        .value(descripcionMaxima));

        verify(seguimientoService)
                .crearSeguimiento(any(SeguimientoRequest.class));
    }

    @Test
    @DisplayName("POST debe rechazar JSON inválido")
    void debeRechazarJsonInvalido() throws Exception {
        String json = """
                {
                  "solicitudEnvioId": 500,
                  "estado":
                }
                """;

        mockMvc.perform(
                        post("/api/seguimientos")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(seguimientoService, never())
                .crearSeguimiento(any(SeguimientoRequest.class));
    }

    @Test
    @DisplayName("GET /api/seguimientos/solicitud/{id} debe listar seguimientos")
    void debeListarSeguimientosPorSolicitud() throws Exception {
        SeguimientoResponse primerSeguimiento =
                new SeguimientoResponse(
                        900L,
                        500L,
                        "RAM-20260712-0001",
                        EstadoSolicitud.PENDIENTE_APROBACION,
                        "Solicitud creada y pendiente de aprobación",
                        LocalDateTime.of(2026, 7, 12, 10, 0),
                        operadorResponse
                );

        SeguimientoResponse segundoSeguimiento =
                new SeguimientoResponse(
                        901L,
                        500L,
                        "RAM-20260712-0001",
                        EstadoSolicitud.APROBADO,
                        "Solicitud aprobada",
                        LocalDateTime.of(2026, 7, 12, 11, 0),
                        operadorResponse
                );

        when(seguimientoService.listarPorSolicitud(500L))
                .thenReturn(List.of(
                        primerSeguimiento,
                        segundoSeguimiento,
                        seguimientoResponse
                ));

        mockMvc.perform(
                        get(
                                "/api/seguimientos/solicitud/{solicitudEnvioId}",
                                500L
                        )
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(content()
                        .contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Seguimientos obtenidos correctamente"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()")
                        .value(3))
                .andExpect(jsonPath("$.data[0].id")
                        .value(900))
                .andExpect(jsonPath("$.data[0].estado")
                        .value("PENDIENTE_APROBACION"))
                .andExpect(jsonPath("$.data[1].id")
                        .value(901))
                .andExpect(jsonPath("$.data[1].estado")
                        .value("APROBADO"))
                .andExpect(jsonPath("$.data[2].id")
                        .value(1000))
                .andExpect(jsonPath("$.data[2].estado")
                        .value("EN_TRANSITO"))
                .andExpect(jsonPath("$.data[2].solicitudEnvioId")
                        .value(500))
                .andExpect(jsonPath("$.timestamp")
                        .exists());

        verify(seguimientoService)
                .listarPorSolicitud(500L);
    }

    @Test
    @DisplayName("GET por solicitud debe devolver lista vacía")
    void debeRetornarListaVacia() throws Exception {
        when(seguimientoService.listarPorSolicitud(500L))
                .thenReturn(List.of());

        mockMvc.perform(
                        get(
                                "/api/seguimientos/solicitud/{solicitudEnvioId}",
                                500L
                        )
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data").isEmpty());

        verify(seguimientoService)
                .listarPorSolicitud(500L);
    }

    @Test
    @DisplayName("GET por solicitud debe rechazar ID inválido")
    void debeRechazarSolicitudIdInvalido() throws Exception {
        mockMvc.perform(
                        get(
                                "/api/seguimientos/solicitud/{solicitudEnvioId}",
                                "abc"
                        )
                )
                .andExpect(status().isBadRequest());

        verify(seguimientoService, never())
                .listarPorSolicitud(anyLong());
    }
}