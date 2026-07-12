package cl.ramona.ramona_backend.controller;

import cl.ramona.ramona_backend.dto.request.ActualizarEstadoIncidenciaRequest;
import cl.ramona.ramona_backend.dto.request.IncidenciaRequest;
import cl.ramona.ramona_backend.dto.response.IncidenciaResponse;
import cl.ramona.ramona_backend.dto.response.RolResponse;
import cl.ramona.ramona_backend.dto.response.UsuarioResponse;
import cl.ramona.ramona_backend.enums.EstadoIncidencia;
import cl.ramona.ramona_backend.service.IncidenciaService;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class IncidenciaControllerTest {

    @Mock
    private IncidenciaService incidenciaService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private UsuarioResponse clienteResponse;
    private UsuarioResponse operadorResponse;
    private IncidenciaResponse incidenciaResponse;

    @BeforeEach
    void setUp() {
        IncidenciaController controller =
                new IncidenciaController(incidenciaService);

        LocalValidatorFactoryBean validator =
                new LocalValidatorFactoryBean();

        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders
                .standaloneSetup(controller)
                .setValidator(validator)
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();

        clienteResponse = new UsuarioResponse(
                10L,
                "Carlos",
                "Díaz",
                "cliente@ramona.cl",
                "+569 1111 2222",
                "San Antonio",
                true,
                "entra-cliente",
                new RolResponse(1L, "CLIENTE"),
                LocalDateTime.of(2026, 7, 1, 10, 0),
                LocalDateTime.of(2026, 7, 10, 12, 0)
        );

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

        incidenciaResponse = new IncidenciaResponse(
                1000L,
                500L,
                "RAM-20260712-0001",
                "Envío dañado",
                "La caja presenta daños durante el transporte",
                EstadoIncidencia.ABIERTA,
                clienteResponse,
                operadorResponse,
                LocalDateTime.of(2026, 7, 12, 10, 0),
                LocalDateTime.of(2026, 7, 12, 10, 0)
        );
    }

    @Test
    @DisplayName("POST /api/incidencias debe crear una incidencia con usuario asignado")
    void debeCrearIncidenciaConAsignado() throws Exception {
        IncidenciaRequest request = new IncidenciaRequest(
                500L,
                "Envío dañado",
                "La caja presenta daños durante el transporte",
                10L,
                20L
        );

        when(incidenciaService.crearIncidencia(
                any(IncidenciaRequest.class)
        )).thenReturn(incidenciaResponse);

        mockMvc.perform(
                        post("/api/incidencias")
                                .contentType(MediaType.APPLICATION_JSON)
                                .accept(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpect(content()
                        .contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Incidencia creada correctamente"))
                .andExpect(jsonPath("$.data.id").value(1000))
                .andExpect(jsonPath("$.data.solicitudEnvioId").value(500))
                .andExpect(jsonPath("$.data.codigoSeguimiento")
                        .value("RAM-20260712-0001"))
                .andExpect(jsonPath("$.data.titulo")
                        .value("Envío dañado"))
                .andExpect(jsonPath("$.data.descripcion")
                        .value("La caja presenta daños durante el transporte"))
                .andExpect(jsonPath("$.data.estado")
                        .value("ABIERTA"))
                .andExpect(jsonPath("$.data.creadaPor.id").value(10))
                .andExpect(jsonPath("$.data.creadaPor.rol.nombre")
                        .value("CLIENTE"))
                .andExpect(jsonPath("$.data.asignadaA.id").value(20))
                .andExpect(jsonPath("$.data.asignadaA.rol.nombre")
                        .value("OPERADOR"))
                .andExpect(jsonPath("$.data.fechaCreacion").exists())
                .andExpect(jsonPath("$.data.fechaActualizacion").exists())
                .andExpect(jsonPath("$.timestamp").exists());

        ArgumentCaptor<IncidenciaRequest> captor =
                ArgumentCaptor.forClass(IncidenciaRequest.class);

        verify(incidenciaService)
                .crearIncidencia(captor.capture());

        IncidenciaRequest recibido = captor.getValue();

        assertThat(recibido.solicitudEnvioId()).isEqualTo(500L);
        assertThat(recibido.titulo()).isEqualTo("Envío dañado");
        assertThat(recibido.descripcion())
                .isEqualTo("La caja presenta daños durante el transporte");
        assertThat(recibido.creadaPorId()).isEqualTo(10L);
        assertThat(recibido.asignadaAId()).isEqualTo(20L);
    }

    @Test
    @DisplayName("POST /api/incidencias debe permitir crear sin usuario asignado")
    void debeCrearIncidenciaSinAsignado() throws Exception {
        IncidenciaRequest request = new IncidenciaRequest(
                500L,
                "Retraso en entrega",
                "El envío aún no llega a destino",
                10L,
                null
        );

        IncidenciaResponse sinAsignado = new IncidenciaResponse(
                1001L,
                500L,
                "RAM-20260712-0001",
                "Retraso en entrega",
                "El envío aún no llega a destino",
                EstadoIncidencia.ABIERTA,
                clienteResponse,
                null,
                LocalDateTime.now(),
                LocalDateTime.now()
        );

        when(incidenciaService.crearIncidencia(
                any(IncidenciaRequest.class)
        )).thenReturn(sinAsignado);

        mockMvc.perform(
                        post("/api/incidencias")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1001))
                .andExpect(jsonPath("$.data.estado").value("ABIERTA"))
                .andExpect(jsonPath("$.data.asignadaA")
                        .value(nullValue()));

        verify(incidenciaService)
                .crearIncidencia(any(IncidenciaRequest.class));
    }

    @Test
    @DisplayName("POST debe rechazar solicitud nula")
    void debeRechazarSolicitudNula() throws Exception {
        String json = """
                {
                  "solicitudEnvioId": null,
                  "titulo": "Envío dañado",
                  "descripcion": "Descripción del problema",
                  "creadaPorId": 10,
                  "asignadaAId": 20
                }
                """;

        mockMvc.perform(
                        post("/api/incidencias")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(incidenciaService, never())
                .crearIncidencia(any(IncidenciaRequest.class));
    }

    @Test
    @DisplayName("POST debe rechazar título vacío")
    void debeRechazarTituloVacio() throws Exception {
        String json = """
                {
                  "solicitudEnvioId": 500,
                  "titulo": "",
                  "descripcion": "Descripción del problema",
                  "creadaPorId": 10
                }
                """;

        mockMvc.perform(
                        post("/api/incidencias")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(incidenciaService, never())
                .crearIncidencia(any(IncidenciaRequest.class));
    }

    @Test
    @DisplayName("POST debe rechazar título mayor a 150 caracteres")
    void debeRechazarTituloDemasiadoLargo() throws Exception {
        String tituloLargo = "A".repeat(151);

        String json = """
                {
                  "solicitudEnvioId": 500,
                  "titulo": "%s",
                  "descripcion": "Descripción del problema",
                  "creadaPorId": 10
                }
                """.formatted(tituloLargo);

        mockMvc.perform(
                        post("/api/incidencias")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(incidenciaService, never())
                .crearIncidencia(any(IncidenciaRequest.class));
    }

    @Test
    @DisplayName("POST debe rechazar descripción vacía")
    void debeRechazarDescripcionVacia() throws Exception {
        String json = """
                {
                  "solicitudEnvioId": 500,
                  "titulo": "Envío dañado",
                  "descripcion": "",
                  "creadaPorId": 10
                }
                """;

        mockMvc.perform(
                        post("/api/incidencias")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(incidenciaService, never())
                .crearIncidencia(any(IncidenciaRequest.class));
    }

    @Test
    @DisplayName("POST debe rechazar usuario creador nulo")
    void debeRechazarCreadorNulo() throws Exception {
        String json = """
                {
                  "solicitudEnvioId": 500,
                  "titulo": "Envío dañado",
                  "descripcion": "Descripción del problema",
                  "creadaPorId": null
                }
                """;

        mockMvc.perform(
                        post("/api/incidencias")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(incidenciaService, never())
                .crearIncidencia(any(IncidenciaRequest.class));
    }

    @Test
    @DisplayName("POST debe rechazar JSON inválido")
    void debeRechazarJsonInvalido() throws Exception {
        String json = """
                {
                  "solicitudEnvioId": 500,
                  "titulo":
                }
                """;

        mockMvc.perform(
                        post("/api/incidencias")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(incidenciaService, never())
                .crearIncidencia(any(IncidenciaRequest.class));
    }

    @Test
    @DisplayName("GET /api/incidencias debe listar todas las incidencias")
    void debeListarIncidencias() throws Exception {
        IncidenciaResponse segunda = new IncidenciaResponse(
                1001L,
                501L,
                "RAM-20260712-0002",
                "Retraso",
                "El envío se encuentra retrasado",
                EstadoIncidencia.EN_PROCESO,
                clienteResponse,
                operadorResponse,
                LocalDateTime.of(2026, 7, 12, 11, 0),
                LocalDateTime.of(2026, 7, 12, 12, 0)
        );

        when(incidenciaService.listarIncidencias())
                .thenReturn(List.of(
                        incidenciaResponse,
                        segunda
                ));

        mockMvc.perform(
                        get("/api/incidencias")
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(content()
                        .contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Incidencias obtenidas correctamente"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].id").value(1000))
                .andExpect(jsonPath("$.data[0].estado")
                        .value("ABIERTA"))
                .andExpect(jsonPath("$.data[1].id").value(1001))
                .andExpect(jsonPath("$.data[1].estado")
                        .value("EN_PROCESO"))
                .andExpect(jsonPath("$.timestamp").exists());

        verify(incidenciaService).listarIncidencias();
    }

    @Test
    @DisplayName("GET /api/incidencias debe retornar lista vacía")
    void debeRetornarListaVacia() throws Exception {
        when(incidenciaService.listarIncidencias())
                .thenReturn(List.of());

        mockMvc.perform(
                        get("/api/incidencias")
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data").isEmpty());

        verify(incidenciaService).listarIncidencias();
    }

    @Test
    @DisplayName("GET /api/incidencias/{id} debe obtener una incidencia")
    void debeObtenerPorId() throws Exception {
        when(incidenciaService.obtenerPorId(1000L))
                .thenReturn(incidenciaResponse);

        mockMvc.perform(
                        get("/api/incidencias/{id}", 1000L)
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Incidencia obtenida correctamente"))
                .andExpect(jsonPath("$.data.id").value(1000))
                .andExpect(jsonPath("$.data.solicitudEnvioId")
                        .value(500))
                .andExpect(jsonPath("$.data.codigoSeguimiento")
                        .value("RAM-20260712-0001"))
                .andExpect(jsonPath("$.data.titulo")
                        .value("Envío dañado"));

        verify(incidenciaService).obtenerPorId(1000L);
    }

    @Test
    @DisplayName("GET por ID debe rechazar ID inválido")
    void debeRechazarIdInvalido() throws Exception {
        mockMvc.perform(
                        get("/api/incidencias/{id}", "abc")
                )
                .andExpect(status().isBadRequest());

        verify(incidenciaService, never())
                .obtenerPorId(anyLong());
    }

    @Test
    @DisplayName("GET /solicitud/{id} debe listar incidencias por solicitud")
    void debeListarPorSolicitud() throws Exception {
        when(incidenciaService.listarPorSolicitud(500L))
                .thenReturn(List.of(incidenciaResponse));

        mockMvc.perform(
                        get(
                                "/api/incidencias/solicitud/{solicitudEnvioId}",
                                500L
                        )
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Incidencias de la solicitud obtenidas correctamente"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].solicitudEnvioId")
                        .value(500));

        verify(incidenciaService)
                .listarPorSolicitud(500L);
    }

    @Test
    @DisplayName("GET por solicitud debe rechazar ID inválido")
    void debeRechazarSolicitudIdInvalido() throws Exception {
        mockMvc.perform(
                        get(
                                "/api/incidencias/solicitud/{solicitudEnvioId}",
                                "abc"
                        )
                )
                .andExpect(status().isBadRequest());

        verify(incidenciaService, never())
                .listarPorSolicitud(anyLong());
    }

    @Test
    @DisplayName("GET /estado/{estado} debe listar incidencias por estado")
    void debeListarPorEstado() throws Exception {
        when(incidenciaService.listarPorEstado(
                EstadoIncidencia.ABIERTA
        )).thenReturn(List.of(incidenciaResponse));

        mockMvc.perform(
                        get(
                                "/api/incidencias/estado/{estado}",
                                EstadoIncidencia.ABIERTA
                        )
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Incidencias por estado obtenidas correctamente"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].estado")
                        .value("ABIERTA"));

        verify(incidenciaService)
                .listarPorEstado(EstadoIncidencia.ABIERTA);
    }

    @Test
    @DisplayName("GET por estado debe aceptar todos los estados definidos")
    void debeAceptarEstadoCerrada() throws Exception {
        IncidenciaResponse cerrada = new IncidenciaResponse(
                1000L,
                500L,
                "RAM-20260712-0001",
                "Envío dañado",
                "La caja presenta daños durante el transporte",
                EstadoIncidencia.CERRADA,
                clienteResponse,
                operadorResponse,
                incidenciaResponse.fechaCreacion(),
                LocalDateTime.now()
        );

        when(incidenciaService.listarPorEstado(
                EstadoIncidencia.CERRADA
        )).thenReturn(List.of(cerrada));

        mockMvc.perform(
                        get(
                                "/api/incidencias/estado/{estado}",
                                EstadoIncidencia.CERRADA
                        )
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].estado")
                        .value("CERRADA"));

        verify(incidenciaService)
                .listarPorEstado(EstadoIncidencia.CERRADA);
    }

    @Test
    @DisplayName("GET por estado debe rechazar un estado inexistente")
    void debeRechazarEstadoInvalido() throws Exception {
        mockMvc.perform(
                        get(
                                "/api/incidencias/estado/{estado}",
                                "ESTADO_INEXISTENTE"
                        )
                )
                .andExpect(status().isBadRequest());

        verify(incidenciaService, never())
                .listarPorEstado(any(EstadoIncidencia.class));
    }

    @Test
    @DisplayName("PATCH /{id}/estado debe actualizar estado y responsable")
    void debeActualizarEstadoYResponsable() throws Exception {
        ActualizarEstadoIncidenciaRequest request =
                new ActualizarEstadoIncidenciaRequest(
                        EstadoIncidencia.EN_PROCESO,
                        20L
                );

        IncidenciaResponse actualizada = new IncidenciaResponse(
                1000L,
                500L,
                "RAM-20260712-0001",
                "Envío dañado",
                "La caja presenta daños durante el transporte",
                EstadoIncidencia.EN_PROCESO,
                clienteResponse,
                operadorResponse,
                incidenciaResponse.fechaCreacion(),
                LocalDateTime.of(2026, 7, 12, 12, 0)
        );

        when(incidenciaService.actualizarEstado(
                eq(1000L),
                any(ActualizarEstadoIncidenciaRequest.class)
        )).thenReturn(actualizada);

        mockMvc.perform(
                        patch("/api/incidencias/{id}/estado", 1000L)
                                .contentType(MediaType.APPLICATION_JSON)
                                .accept(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Estado de incidencia actualizado correctamente"))
                .andExpect(jsonPath("$.data.id").value(1000))
                .andExpect(jsonPath("$.data.estado")
                        .value("EN_PROCESO"))
                .andExpect(jsonPath("$.data.asignadaA.id")
                        .value(20))
                .andExpect(jsonPath("$.data.fechaActualizacion").exists());

        ArgumentCaptor<ActualizarEstadoIncidenciaRequest> captor =
                ArgumentCaptor.forClass(
                        ActualizarEstadoIncidenciaRequest.class
                );

        verify(incidenciaService)
                .actualizarEstado(eq(1000L), captor.capture());

        assertThat(captor.getValue().estado())
                .isEqualTo(EstadoIncidencia.EN_PROCESO);

        assertThat(captor.getValue().asignadaAId())
                .isEqualTo(20L);
    }

    @Test
    @DisplayName("PATCH debe permitir actualizar sin modificar responsable")
    void debeActualizarEstadoSinAsignado() throws Exception {
        ActualizarEstadoIncidenciaRequest request =
                new ActualizarEstadoIncidenciaRequest(
                        EstadoIncidencia.RESUELTA,
                        null
                );

        IncidenciaResponse resuelta = new IncidenciaResponse(
                1000L,
                500L,
                incidenciaResponse.codigoSeguimiento(),
                incidenciaResponse.titulo(),
                incidenciaResponse.descripcion(),
                EstadoIncidencia.RESUELTA,
                clienteResponse,
                operadorResponse,
                incidenciaResponse.fechaCreacion(),
                LocalDateTime.now()
        );

        when(incidenciaService.actualizarEstado(
                eq(1000L),
                any(ActualizarEstadoIncidenciaRequest.class)
        )).thenReturn(resuelta);

        mockMvc.perform(
                        patch("/api/incidencias/{id}/estado", 1000L)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.estado")
                        .value("RESUELTA"))
                .andExpect(jsonPath("$.data.asignadaA.id")
                        .value(20));

        verify(incidenciaService)
                .actualizarEstado(
                        eq(1000L),
                        any(ActualizarEstadoIncidenciaRequest.class)
                );
    }

    @Test
    @DisplayName("PATCH debe rechazar estado nulo")
    void debeRechazarEstadoNuloAlActualizar() throws Exception {
        String json = """
                {
                  "estado": null,
                  "asignadaAId": 20
                }
                """;

        mockMvc.perform(
                        patch("/api/incidencias/{id}/estado", 1000L)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(incidenciaService, never())
                .actualizarEstado(
                        anyLong(),
                        any(ActualizarEstadoIncidenciaRequest.class)
                );
    }

    @Test
    @DisplayName("PATCH debe rechazar estado inexistente")
    void debeRechazarEstadoInexistenteAlActualizar() throws Exception {
        String json = """
                {
                  "estado": "ESTADO_INEXISTENTE",
                  "asignadaAId": 20
                }
                """;

        mockMvc.perform(
                        patch("/api/incidencias/{id}/estado", 1000L)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(incidenciaService, never())
                .actualizarEstado(
                        anyLong(),
                        any(ActualizarEstadoIncidenciaRequest.class)
                );
    }

    @Test
    @DisplayName("PATCH debe rechazar ID inválido")
    void debeRechazarIdInvalidoAlActualizar() throws Exception {
        ActualizarEstadoIncidenciaRequest request =
                new ActualizarEstadoIncidenciaRequest(
                        EstadoIncidencia.CERRADA,
                        20L
                );

        mockMvc.perform(
                        patch("/api/incidencias/{id}/estado", "abc")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isBadRequest());

        verify(incidenciaService, never())
                .actualizarEstado(
                        anyLong(),
                        any(ActualizarEstadoIncidenciaRequest.class)
                );
    }

    @Test
    @DisplayName("PATCH debe rechazar JSON inválido")
    void debeRechazarJsonInvalidoAlActualizar() throws Exception {
        String json = """
                {
                  "estado":
                }
                """;

        mockMvc.perform(
                        patch("/api/incidencias/{id}/estado", 1000L)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(incidenciaService, never())
                .actualizarEstado(
                        anyLong(),
                        any(ActualizarEstadoIncidenciaRequest.class)
                );
    }
}