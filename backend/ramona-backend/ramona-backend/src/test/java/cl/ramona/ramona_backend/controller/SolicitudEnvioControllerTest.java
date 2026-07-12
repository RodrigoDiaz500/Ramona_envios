package cl.ramona.ramona_backend.controller;

import cl.ramona.ramona_backend.dto.request.CambiarEstadoSolicitudRequest;
import cl.ramona.ramona_backend.dto.request.CrearSolicitudRequest;
import cl.ramona.ramona_backend.dto.response.RolResponse;
import cl.ramona.ramona_backend.dto.response.SolicitudEnvioResponse;
import cl.ramona.ramona_backend.dto.response.SucursalResponse;
import cl.ramona.ramona_backend.dto.response.UsuarioResponse;
import cl.ramona.ramona_backend.enums.EstadoSolicitud;
import cl.ramona.ramona_backend.service.SolicitudEnvioService;
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

import java.math.BigDecimal;
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
class SolicitudEnvioControllerTest {

    @Mock
    private SolicitudEnvioService solicitudEnvioService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private UsuarioResponse clienteResponse;
    private UsuarioResponse operadorResponse;
    private SucursalResponse sucursalOrigenResponse;
    private SucursalResponse sucursalDestinoResponse;
    private SolicitudEnvioResponse solicitudResponse;

    @BeforeEach
    void setUp() {
        SolicitudEnvioController controller =
                new SolicitudEnvioController(solicitudEnvioService);

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

        sucursalOrigenResponse = new SucursalResponse(
                100L,
                "Sucursal San Antonio",
                "Barros Luco 100",
                "San Antonio",
                "+5635 2000000",
                true,
                LocalDateTime.of(2026, 6, 1, 9, 0)
        );

        sucursalDestinoResponse = new SucursalResponse(
                200L,
                "Sucursal Santiago",
                "Alameda 200",
                "Santiago",
                "+562 2000000",
                true,
                LocalDateTime.of(2026, 6, 1, 10, 0)
        );

        solicitudResponse = new SolicitudEnvioResponse(
                500L,
                "RAM-20260712-0001",
                clienteResponse,
                sucursalOrigenResponse,
                sucursalDestinoResponse,
                "Caja con productos",
                new BigDecimal("2.50"),
                new BigDecimal("45000.00"),
                EstadoSolicitud.PENDIENTE_APROBACION,
                "María González",
                "12345678-9",
                "+569 5555 6666",
                LocalDateTime.of(2026, 7, 12, 10, 0),
                null,
                null
        );
    }

    @Test
    @DisplayName("POST /api/solicitudes debe crear una solicitud válida")
    void debeCrearSolicitud() throws Exception {
        CrearSolicitudRequest request = new CrearSolicitudRequest(
                10L,
                100L,
                200L,
                "Caja con productos",
                new BigDecimal("2.50"),
                new BigDecimal("45000.00"),
                "María González",
                "12345678-9",
                "+569 5555 6666"
        );

        when(solicitudEnvioService.crearSolicitud(
                any(CrearSolicitudRequest.class)
        )).thenReturn(solicitudResponse);

        mockMvc.perform(
                        post("/api/solicitudes")
                                .contentType(MediaType.APPLICATION_JSON)
                                .accept(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpect(content()
                        .contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Solicitud creada correctamente"))
                .andExpect(jsonPath("$.data.id").value(500))
                .andExpect(jsonPath("$.data.codigoSeguimiento")
                        .value("RAM-20260712-0001"))
                .andExpect(jsonPath("$.data.usuario.id").value(10))
                .andExpect(jsonPath("$.data.sucursalOrigen.id").value(100))
                .andExpect(jsonPath("$.data.sucursalDestino.id").value(200))
                .andExpect(jsonPath("$.data.descripcion")
                        .value("Caja con productos"))
                .andExpect(jsonPath("$.data.peso").value(2.50))
                .andExpect(jsonPath("$.data.valorDeclarado").value(45000.00))
                .andExpect(jsonPath("$.data.estado")
                        .value("PENDIENTE_APROBACION"))
                .andExpect(jsonPath("$.data.destinatarioNombre")
                        .value("María González"))
                .andExpect(jsonPath("$.data.destinatarioRutDni")
                        .value("12345678-9"))
                .andExpect(jsonPath("$.data.destinatarioTelefono")
                        .value("+569 5555 6666"))
                .andExpect(jsonPath("$.data.fechaAprobacion")
                        .value(nullValue()))
                .andExpect(jsonPath("$.data.aprobadoPor")
                        .value(nullValue()))
                .andExpect(jsonPath("$.timestamp").exists());

        ArgumentCaptor<CrearSolicitudRequest> captor =
                ArgumentCaptor.forClass(CrearSolicitudRequest.class);

        verify(solicitudEnvioService)
                .crearSolicitud(captor.capture());

        CrearSolicitudRequest recibido = captor.getValue();

        assertThat(recibido.usuarioId()).isEqualTo(10L);
        assertThat(recibido.sucursalOrigenId()).isEqualTo(100L);
        assertThat(recibido.sucursalDestinoId()).isEqualTo(200L);
        assertThat(recibido.descripcion()).isEqualTo("Caja con productos");
        assertThat(recibido.peso()).isEqualByComparingTo("2.50");
        assertThat(recibido.valorDeclarado())
                .isEqualByComparingTo("45000.00");
        assertThat(recibido.destinatarioNombre())
                .isEqualTo("María González");
        assertThat(recibido.destinatarioRutDni())
                .isEqualTo("12345678-9");
        assertThat(recibido.destinatarioTelefono())
                .isEqualTo("+569 5555 6666");
    }

    @Test
    @DisplayName("POST debe permitir descripción nula")
    void debeCrearSolicitudSinDescripcion() throws Exception {
        CrearSolicitudRequest request = new CrearSolicitudRequest(
                10L,
                100L,
                200L,
                null,
                new BigDecimal("1.00"),
                new BigDecimal("0.00"),
                "Pedro Soto",
                "98765432-1",
                "+569 1111 9999"
        );

        SolicitudEnvioResponse responseSinDescripcion =
                new SolicitudEnvioResponse(
                        501L,
                        "RAM-20260712-0002",
                        clienteResponse,
                        sucursalOrigenResponse,
                        sucursalDestinoResponse,
                        null,
                        new BigDecimal("1.00"),
                        new BigDecimal("0.00"),
                        EstadoSolicitud.PENDIENTE_APROBACION,
                        "Pedro Soto",
                        "98765432-1",
                        "+569 1111 9999",
                        LocalDateTime.now(),
                        null,
                        null
                );

        when(solicitudEnvioService.crearSolicitud(
                any(CrearSolicitudRequest.class)
        )).thenReturn(responseSinDescripcion);

        mockMvc.perform(
                        post("/api/solicitudes")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(501))
                .andExpect(jsonPath("$.data.descripcion")
                        .value(nullValue()));

        verify(solicitudEnvioService)
                .crearSolicitud(any(CrearSolicitudRequest.class));
    }

    @Test
    @DisplayName("POST debe rechazar usuario nulo")
    void debeRechazarUsuarioNulo() throws Exception {
        String json = """
                {
                  "usuarioId": null,
                  "sucursalOrigenId": 100,
                  "sucursalDestinoId": 200,
                  "peso": 2.5,
                  "valorDeclarado": 45000,
                  "destinatarioNombre": "María González",
                  "destinatarioRutDni": "12345678-9",
                  "destinatarioTelefono": "+569 5555 6666"
                }
                """;

        mockMvc.perform(
                        post("/api/solicitudes")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(solicitudEnvioService, never())
                .crearSolicitud(any(CrearSolicitudRequest.class));
    }

    @Test
    @DisplayName("POST debe rechazar sucursal de origen nula")
    void debeRechazarSucursalOrigenNula() throws Exception {
        String json = """
                {
                  "usuarioId": 10,
                  "sucursalOrigenId": null,
                  "sucursalDestinoId": 200,
                  "peso": 2.5,
                  "valorDeclarado": 45000,
                  "destinatarioNombre": "María González",
                  "destinatarioRutDni": "12345678-9",
                  "destinatarioTelefono": "+569 5555 6666"
                }
                """;

        mockMvc.perform(
                        post("/api/solicitudes")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(solicitudEnvioService, never())
                .crearSolicitud(any(CrearSolicitudRequest.class));
    }

    @Test
    @DisplayName("POST debe rechazar sucursal de destino nula")
    void debeRechazarSucursalDestinoNula() throws Exception {
        String json = """
                {
                  "usuarioId": 10,
                  "sucursalOrigenId": 100,
                  "sucursalDestinoId": null,
                  "peso": 2.5,
                  "valorDeclarado": 45000,
                  "destinatarioNombre": "María González",
                  "destinatarioRutDni": "12345678-9",
                  "destinatarioTelefono": "+569 5555 6666"
                }
                """;

        mockMvc.perform(
                        post("/api/solicitudes")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(solicitudEnvioService, never())
                .crearSolicitud(any(CrearSolicitudRequest.class));
    }

    @Test
    @DisplayName("POST debe rechazar peso igual a cero")
    void debeRechazarPesoCero() throws Exception {
        String json = """
                {
                  "usuarioId": 10,
                  "sucursalOrigenId": 100,
                  "sucursalDestinoId": 200,
                  "peso": 0,
                  "valorDeclarado": 45000,
                  "destinatarioNombre": "María González",
                  "destinatarioRutDni": "12345678-9",
                  "destinatarioTelefono": "+569 5555 6666"
                }
                """;

        mockMvc.perform(
                        post("/api/solicitudes")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(solicitudEnvioService, never())
                .crearSolicitud(any(CrearSolicitudRequest.class));
    }

    @Test
    @DisplayName("POST debe rechazar peso negativo")
    void debeRechazarPesoNegativo() throws Exception {
        String json = """
                {
                  "usuarioId": 10,
                  "sucursalOrigenId": 100,
                  "sucursalDestinoId": 200,
                  "peso": -1,
                  "valorDeclarado": 45000,
                  "destinatarioNombre": "María González",
                  "destinatarioRutDni": "12345678-9",
                  "destinatarioTelefono": "+569 5555 6666"
                }
                """;

        mockMvc.perform(
                        post("/api/solicitudes")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(solicitudEnvioService, never())
                .crearSolicitud(any(CrearSolicitudRequest.class));
    }

    @Test
    @DisplayName("POST debe rechazar valor declarado negativo")
    void debeRechazarValorDeclaradoNegativo() throws Exception {
        String json = """
                {
                  "usuarioId": 10,
                  "sucursalOrigenId": 100,
                  "sucursalDestinoId": 200,
                  "peso": 2.5,
                  "valorDeclarado": -1,
                  "destinatarioNombre": "María González",
                  "destinatarioRutDni": "12345678-9",
                  "destinatarioTelefono": "+569 5555 6666"
                }
                """;

        mockMvc.perform(
                        post("/api/solicitudes")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(solicitudEnvioService, never())
                .crearSolicitud(any(CrearSolicitudRequest.class));
    }

    @Test
    @DisplayName("POST debe rechazar nombre del destinatario vacío")
    void debeRechazarDestinatarioVacio() throws Exception {
        String json = """
                {
                  "usuarioId": 10,
                  "sucursalOrigenId": 100,
                  "sucursalDestinoId": 200,
                  "peso": 2.5,
                  "valorDeclarado": 45000,
                  "destinatarioNombre": "",
                  "destinatarioRutDni": "12345678-9",
                  "destinatarioTelefono": "+569 5555 6666"
                }
                """;

        mockMvc.perform(
                        post("/api/solicitudes")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(solicitudEnvioService, never())
                .crearSolicitud(any(CrearSolicitudRequest.class));
    }

    @Test
    @DisplayName("POST debe rechazar RUT o DNI vacío")
    void debeRechazarRutDniVacio() throws Exception {
        String json = """
                {
                  "usuarioId": 10,
                  "sucursalOrigenId": 100,
                  "sucursalDestinoId": 200,
                  "peso": 2.5,
                  "valorDeclarado": 45000,
                  "destinatarioNombre": "María González",
                  "destinatarioRutDni": "",
                  "destinatarioTelefono": "+569 5555 6666"
                }
                """;

        mockMvc.perform(
                        post("/api/solicitudes")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(solicitudEnvioService, never())
                .crearSolicitud(any(CrearSolicitudRequest.class));
    }

    @Test
    @DisplayName("POST debe rechazar teléfono vacío")
    void debeRechazarTelefonoVacio() throws Exception {
        String json = """
                {
                  "usuarioId": 10,
                  "sucursalOrigenId": 100,
                  "sucursalDestinoId": 200,
                  "peso": 2.5,
                  "valorDeclarado": 45000,
                  "destinatarioNombre": "María González",
                  "destinatarioRutDni": "12345678-9",
                  "destinatarioTelefono": ""
                }
                """;

        mockMvc.perform(
                        post("/api/solicitudes")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(solicitudEnvioService, never())
                .crearSolicitud(any(CrearSolicitudRequest.class));
    }

    @Test
    @DisplayName("POST debe rechazar descripción demasiado larga")
    void debeRechazarDescripcionDemasiadoLarga() throws Exception {
        String descripcionLarga = "A".repeat(501);

        String json = """
                {
                  "usuarioId": 10,
                  "sucursalOrigenId": 100,
                  "sucursalDestinoId": 200,
                  "descripcion": "%s",
                  "peso": 2.5,
                  "valorDeclarado": 45000,
                  "destinatarioNombre": "María González",
                  "destinatarioRutDni": "12345678-9",
                  "destinatarioTelefono": "+569 5555 6666"
                }
                """.formatted(descripcionLarga);

        mockMvc.perform(
                        post("/api/solicitudes")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(solicitudEnvioService, never())
                .crearSolicitud(any(CrearSolicitudRequest.class));
    }

    @Test
    @DisplayName("POST debe rechazar JSON inválido")
    void debeRechazarJsonInvalido() throws Exception {
        String json = """
                {
                  "usuarioId": 10,
                  "sucursalOrigenId":
                }
                """;

        mockMvc.perform(
                        post("/api/solicitudes")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(solicitudEnvioService, never())
                .crearSolicitud(any(CrearSolicitudRequest.class));
    }

    @Test
    @DisplayName("GET /api/solicitudes debe listar solicitudes")
    void debeListarSolicitudes() throws Exception {
        SolicitudEnvioResponse segunda = new SolicitudEnvioResponse(
                501L,
                "RAM-20260712-0002",
                clienteResponse,
                sucursalOrigenResponse,
                sucursalDestinoResponse,
                "Segundo envío",
                new BigDecimal("5.00"),
                new BigDecimal("90000.00"),
                EstadoSolicitud.EN_TRANSITO,
                "Pedro Soto",
                "98765432-1",
                "+569 7777 8888",
                LocalDateTime.of(2026, 7, 12, 11, 0),
                LocalDateTime.of(2026, 7, 12, 11, 30),
                operadorResponse
        );

        when(solicitudEnvioService.listarSolicitudes())
                .thenReturn(List.of(solicitudResponse, segunda));

        mockMvc.perform(
                        get("/api/solicitudes")
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Solicitudes obtenidas correctamente"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].id").value(500))
                .andExpect(jsonPath("$.data[1].id").value(501))
                .andExpect(jsonPath("$.data[1].estado")
                        .value("EN_TRANSITO"))
                .andExpect(jsonPath("$.data[1].aprobadoPor.id")
                        .value(20));

        verify(solicitudEnvioService).listarSolicitudes();
    }

    @Test
    @DisplayName("GET /api/solicitudes debe retornar lista vacía")
    void debeRetornarListaVacia() throws Exception {
        when(solicitudEnvioService.listarSolicitudes())
                .thenReturn(List.of());

        mockMvc.perform(
                        get("/api/solicitudes")
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data").isEmpty());

        verify(solicitudEnvioService).listarSolicitudes();
    }

    @Test
    @DisplayName("GET /api/solicitudes/{id} debe obtener solicitud por ID")
    void debeObtenerPorId() throws Exception {
        when(solicitudEnvioService.obtenerPorId(500L))
                .thenReturn(solicitudResponse);

        mockMvc.perform(
                        get("/api/solicitudes/{id}", 500L)
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Solicitud obtenida correctamente"))
                .andExpect(jsonPath("$.data.id").value(500))
                .andExpect(jsonPath("$.data.codigoSeguimiento")
                        .value("RAM-20260712-0001"));

        verify(solicitudEnvioService).obtenerPorId(500L);
    }

    @Test
    @DisplayName("GET por ID debe rechazar ID inválido")
    void debeRechazarIdInvalido() throws Exception {
        mockMvc.perform(
                        get("/api/solicitudes/{id}", "abc")
                )
                .andExpect(status().isBadRequest());

        verify(solicitudEnvioService, never())
                .obtenerPorId(anyLong());
    }

    @Test
    @DisplayName("GET /codigo/{codigo} debe obtener solicitud por código")
    void debeObtenerPorCodigo() throws Exception {
        when(solicitudEnvioService
                .obtenerPorCodigo("RAM-20260712-0001"))
                .thenReturn(solicitudResponse);

        mockMvc.perform(
                        get(
                                "/api/solicitudes/codigo/{codigo}",
                                "RAM-20260712-0001"
                        )
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Solicitud obtenida correctamente"))
                .andExpect(jsonPath("$.data.id").value(500))
                .andExpect(jsonPath("$.data.codigoSeguimiento")
                        .value("RAM-20260712-0001"));

        verify(solicitudEnvioService)
                .obtenerPorCodigo("RAM-20260712-0001");
    }

    @Test
    @DisplayName("GET /usuario/{usuarioId} debe listar solicitudes del usuario")
    void debeListarPorUsuario() throws Exception {
        when(solicitudEnvioService.listarPorUsuario(10L))
                .thenReturn(List.of(solicitudResponse));

        mockMvc.perform(
                        get("/api/solicitudes/usuario/{usuarioId}", 10L)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Solicitudes del usuario obtenidas correctamente"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].usuario.id").value(10));

        verify(solicitudEnvioService)
                .listarPorUsuario(10L);
    }

    @Test
    @DisplayName("GET por usuario debe rechazar ID inválido")
    void debeRechazarUsuarioIdInvalido() throws Exception {
        mockMvc.perform(
                        get("/api/solicitudes/usuario/{usuarioId}", "abc")
                )
                .andExpect(status().isBadRequest());

        verify(solicitudEnvioService, never())
                .listarPorUsuario(anyLong());
    }

    @Test
    @DisplayName("PATCH /{id}/estado debe cambiar el estado")
    void debeCambiarEstado() throws Exception {
        CambiarEstadoSolicitudRequest request =
                new CambiarEstadoSolicitudRequest(
                        EstadoSolicitud.APROBADO,
                        20L
                );

        SolicitudEnvioResponse aprobada =
                new SolicitudEnvioResponse(
                        500L,
                        "RAM-20260712-0001",
                        clienteResponse,
                        sucursalOrigenResponse,
                        sucursalDestinoResponse,
                        "Caja con productos",
                        new BigDecimal("2.50"),
                        new BigDecimal("45000.00"),
                        EstadoSolicitud.APROBADO,
                        "María González",
                        "12345678-9",
                        "+569 5555 6666",
                        LocalDateTime.of(2026, 7, 12, 10, 0),
                        LocalDateTime.of(2026, 7, 12, 12, 0),
                        operadorResponse
                );

        when(solicitudEnvioService.cambiarEstado(
                eq(500L),
                any(CambiarEstadoSolicitudRequest.class)
        )).thenReturn(aprobada);

        mockMvc.perform(
                        patch("/api/solicitudes/{id}/estado", 500L)
                                .contentType(MediaType.APPLICATION_JSON)
                                .accept(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Estado de la solicitud actualizado correctamente"))
                .andExpect(jsonPath("$.data.id").value(500))
                .andExpect(jsonPath("$.data.estado")
                        .value("APROBADO"))
                .andExpect(jsonPath("$.data.aprobadoPor.id")
                        .value(20))
                .andExpect(jsonPath("$.data.fechaAprobacion").exists());

        ArgumentCaptor<CambiarEstadoSolicitudRequest> captor =
                ArgumentCaptor.forClass(
                        CambiarEstadoSolicitudRequest.class
                );

        verify(solicitudEnvioService)
                .cambiarEstado(eq(500L), captor.capture());

        assertThat(captor.getValue().estado())
                .isEqualTo(EstadoSolicitud.APROBADO);

        assertThat(captor.getValue().aprobadoPorId())
                .isEqualTo(20L);
    }

    @Test
    @DisplayName("PATCH debe permitir estado sin responsable")
    void debeCambiarEstadoSinResponsable() throws Exception {
        CambiarEstadoSolicitudRequest request =
                new CambiarEstadoSolicitudRequest(
                        EstadoSolicitud.EN_TRANSITO,
                        null
                );

        SolicitudEnvioResponse enTransito =
                new SolicitudEnvioResponse(
                        500L,
                        solicitudResponse.codigoSeguimiento(),
                        clienteResponse,
                        sucursalOrigenResponse,
                        sucursalDestinoResponse,
                        solicitudResponse.descripcion(),
                        solicitudResponse.peso(),
                        solicitudResponse.valorDeclarado(),
                        EstadoSolicitud.EN_TRANSITO,
                        solicitudResponse.destinatarioNombre(),
                        solicitudResponse.destinatarioRutDni(),
                        solicitudResponse.destinatarioTelefono(),
                        solicitudResponse.fechaCreacion(),
                        null,
                        null
                );

        when(solicitudEnvioService.cambiarEstado(
                eq(500L),
                any(CambiarEstadoSolicitudRequest.class)
        )).thenReturn(enTransito);

        mockMvc.perform(
                        patch("/api/solicitudes/{id}/estado", 500L)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.estado")
                        .value("EN_TRANSITO"));

        verify(solicitudEnvioService)
                .cambiarEstado(
                        eq(500L),
                        any(CambiarEstadoSolicitudRequest.class)
                );
    }

    @Test
    @DisplayName("PATCH debe rechazar estado nulo")
    void debeRechazarEstadoNulo() throws Exception {
        String json = """
                {
                  "estado": null,
                  "aprobadoPorId": 20
                }
                """;

        mockMvc.perform(
                        patch("/api/solicitudes/{id}/estado", 500L)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(solicitudEnvioService, never())
                .cambiarEstado(
                        anyLong(),
                        any(CambiarEstadoSolicitudRequest.class)
                );
    }

    @Test
    @DisplayName("PATCH debe rechazar estado inexistente")
    void debeRechazarEstadoInvalido() throws Exception {
        String json = """
                {
                  "estado": "ESTADO_INEXISTENTE",
                  "aprobadoPorId": 20
                }
                """;

        mockMvc.perform(
                        patch("/api/solicitudes/{id}/estado", 500L)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(solicitudEnvioService, never())
                .cambiarEstado(
                        anyLong(),
                        any(CambiarEstadoSolicitudRequest.class)
                );
    }

    @Test
    @DisplayName("PATCH debe rechazar ID inválido")
    void debeRechazarIdInvalidoAlCambiarEstado() throws Exception {
        CambiarEstadoSolicitudRequest request =
                new CambiarEstadoSolicitudRequest(
                        EstadoSolicitud.EN_PREPARACION,
                        20L
                );

        mockMvc.perform(
                        patch("/api/solicitudes/{id}/estado", "abc")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isBadRequest());

        verify(solicitudEnvioService, never())
                .cambiarEstado(
                        anyLong(),
                        any(CambiarEstadoSolicitudRequest.class)
                );
    }
}