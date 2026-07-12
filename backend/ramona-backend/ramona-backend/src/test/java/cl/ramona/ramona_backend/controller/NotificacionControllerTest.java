package cl.ramona.ramona_backend.controller;

import cl.ramona.ramona_backend.dto.request.NotificacionRequest;
import cl.ramona.ramona_backend.dto.response.NotificacionResponse;
import cl.ramona.ramona_backend.dto.response.RolResponse;
import cl.ramona.ramona_backend.dto.response.UsuarioResponse;
import cl.ramona.ramona_backend.service.NotificacionService;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
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
class NotificacionControllerTest {

    @Mock
    private NotificacionService notificacionService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private UsuarioResponse usuarioResponse;
    private NotificacionResponse notificacionResponse;

    @BeforeEach
    void setUp() {
        NotificacionController controller =
                new NotificacionController(notificacionService);

        LocalValidatorFactoryBean validator =
                new LocalValidatorFactoryBean();

        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders
                .standaloneSetup(controller)
                .setValidator(validator)
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();

        usuarioResponse = new UsuarioResponse(
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

        notificacionResponse = new NotificacionResponse(
                100L,
                usuarioResponse,
                "Estado actualizado",
                "Tu envío cambió al estado EN_TRANSITO",
                false,
                LocalDateTime.of(2026, 7, 12, 10, 30)
        );
    }

    @Test
    @DisplayName("POST /api/notificaciones debe crear una notificación válida")
    void debeCrearNotificacion() throws Exception {
        NotificacionRequest request = new NotificacionRequest(
                10L,
                "Estado actualizado",
                "Tu envío cambió al estado EN_TRANSITO"
        );

        when(notificacionService.crearNotificacion(
                any(NotificacionRequest.class)
        )).thenReturn(notificacionResponse);

        mockMvc.perform(
                        post("/api/notificaciones")
                                .contentType(MediaType.APPLICATION_JSON)
                                .accept(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpect(content()
                        .contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Notificación creada correctamente"))
                .andExpect(jsonPath("$.data.id").value(100))
                .andExpect(jsonPath("$.data.usuario.id").value(10))
                .andExpect(jsonPath("$.data.usuario.nombre")
                        .value("Carlos"))
                .andExpect(jsonPath("$.data.usuario.correo")
                        .value("cliente@ramona.cl"))
                .andExpect(jsonPath("$.data.usuario.rol.nombre")
                        .value("CLIENTE"))
                .andExpect(jsonPath("$.data.titulo")
                        .value("Estado actualizado"))
                .andExpect(jsonPath("$.data.mensaje")
                        .value("Tu envío cambió al estado EN_TRANSITO"))
                .andExpect(jsonPath("$.data.leida")
                        .value(false))
                .andExpect(jsonPath("$.data.fechaCreacion")
                        .exists())
                .andExpect(jsonPath("$.timestamp")
                        .exists());

        ArgumentCaptor<NotificacionRequest> captor =
                ArgumentCaptor.forClass(NotificacionRequest.class);

        verify(notificacionService)
                .crearNotificacion(captor.capture());

        NotificacionRequest recibido = captor.getValue();

        assertThat(recibido.usuarioId())
                .isEqualTo(10L);

        assertThat(recibido.titulo())
                .isEqualTo("Estado actualizado");

        assertThat(recibido.mensaje())
                .isEqualTo("Tu envío cambió al estado EN_TRANSITO");
    }

    @Test
    @DisplayName("POST debe rechazar usuario nulo")
    void debeRechazarUsuarioNulo() throws Exception {
        String json = """
                {
                  "usuarioId": null,
                  "titulo": "Estado actualizado",
                  "mensaje": "Tu envío cambió de estado"
                }
                """;

        mockMvc.perform(
                        post("/api/notificaciones")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(notificacionService, never())
                .crearNotificacion(any(NotificacionRequest.class));
    }

    @Test
    @DisplayName("POST debe rechazar título vacío")
    void debeRechazarTituloVacio() throws Exception {
        String json = """
                {
                  "usuarioId": 10,
                  "titulo": "",
                  "mensaje": "Tu envío cambió de estado"
                }
                """;

        mockMvc.perform(
                        post("/api/notificaciones")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(notificacionService, never())
                .crearNotificacion(any(NotificacionRequest.class));
    }

    @Test
    @DisplayName("POST debe rechazar título compuesto solo por espacios")
    void debeRechazarTituloConEspacios() throws Exception {
        String json = """
                {
                  "usuarioId": 10,
                  "titulo": "   ",
                  "mensaje": "Tu envío cambió de estado"
                }
                """;

        mockMvc.perform(
                        post("/api/notificaciones")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(notificacionService, never())
                .crearNotificacion(any(NotificacionRequest.class));
    }

    @Test
    @DisplayName("POST debe rechazar título mayor a 150 caracteres")
    void debeRechazarTituloDemasiadoLargo() throws Exception {
        String tituloLargo = "A".repeat(151);

        String json = """
                {
                  "usuarioId": 10,
                  "titulo": "%s",
                  "mensaje": "Tu envío cambió de estado"
                }
                """.formatted(tituloLargo);

        mockMvc.perform(
                        post("/api/notificaciones")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(notificacionService, never())
                .crearNotificacion(any(NotificacionRequest.class));
    }

    @Test
    @DisplayName("POST debe aceptar título con exactamente 150 caracteres")
    void debeAceptarTituloConLongitudMaxima() throws Exception {
        String tituloMaximo = "A".repeat(150);

        NotificacionRequest request = new NotificacionRequest(
                10L,
                tituloMaximo,
                "Mensaje válido"
        );

        NotificacionResponse response = new NotificacionResponse(
                101L,
                usuarioResponse,
                tituloMaximo,
                "Mensaje válido",
                false,
                LocalDateTime.now()
        );

        when(notificacionService.crearNotificacion(
                any(NotificacionRequest.class)
        )).thenReturn(response);

        mockMvc.perform(
                        post("/api/notificaciones")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(101))
                .andExpect(jsonPath("$.data.titulo")
                        .value(tituloMaximo));

        verify(notificacionService)
                .crearNotificacion(any(NotificacionRequest.class));
    }

    @Test
    @DisplayName("POST debe rechazar mensaje vacío")
    void debeRechazarMensajeVacio() throws Exception {
        String json = """
                {
                  "usuarioId": 10,
                  "titulo": "Estado actualizado",
                  "mensaje": ""
                }
                """;

        mockMvc.perform(
                        post("/api/notificaciones")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(notificacionService, never())
                .crearNotificacion(any(NotificacionRequest.class));
    }

    @Test
    @DisplayName("POST debe rechazar mensaje compuesto solo por espacios")
    void debeRechazarMensajeConEspacios() throws Exception {
        String json = """
                {
                  "usuarioId": 10,
                  "titulo": "Estado actualizado",
                  "mensaje": "   "
                }
                """;

        mockMvc.perform(
                        post("/api/notificaciones")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(notificacionService, never())
                .crearNotificacion(any(NotificacionRequest.class));
    }

    @Test
    @DisplayName("POST debe rechazar JSON inválido")
    void debeRechazarJsonInvalido() throws Exception {
        String json = """
                {
                  "usuarioId": 10,
                  "titulo":
                }
                """;

        mockMvc.perform(
                        post("/api/notificaciones")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(notificacionService, never())
                .crearNotificacion(any(NotificacionRequest.class));
    }

    @Test
    @DisplayName("GET /api/notificaciones/usuario/{id} debe listar notificaciones")
    void debeListarNotificacionesPorUsuario() throws Exception {
        NotificacionResponse segundaNotificacion =
                new NotificacionResponse(
                        101L,
                        usuarioResponse,
                        "Solicitud creada",
                        "Tu solicitud fue registrada correctamente",
                        true,
                        LocalDateTime.of(2026, 7, 11, 9, 0)
                );

        when(notificacionService.listarPorUsuario(10L))
                .thenReturn(List.of(
                        notificacionResponse,
                        segundaNotificacion
                ));

        mockMvc.perform(
                        get(
                                "/api/notificaciones/usuario/{usuarioId}",
                                10L
                        )
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(content()
                        .contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Notificaciones obtenidas correctamente"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].id").value(100))
                .andExpect(jsonPath("$.data[0].titulo")
                        .value("Estado actualizado"))
                .andExpect(jsonPath("$.data[0].leida")
                        .value(false))
                .andExpect(jsonPath("$.data[1].id").value(101))
                .andExpect(jsonPath("$.data[1].titulo")
                        .value("Solicitud creada"))
                .andExpect(jsonPath("$.data[1].leida")
                        .value(true))
                .andExpect(jsonPath("$.timestamp")
                        .exists());

        verify(notificacionService)
                .listarPorUsuario(10L);
    }

    @Test
    @DisplayName("GET por usuario debe devolver lista vacía")
    void debeRetornarListaVacia() throws Exception {
        when(notificacionService.listarPorUsuario(10L))
                .thenReturn(List.of());

        mockMvc.perform(
                        get(
                                "/api/notificaciones/usuario/{usuarioId}",
                                10L
                        )
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data").isEmpty());

        verify(notificacionService)
                .listarPorUsuario(10L);
    }

    @Test
    @DisplayName("GET por usuario debe rechazar ID inválido")
    void debeRechazarUsuarioIdInvalido() throws Exception {
        mockMvc.perform(
                        get(
                                "/api/notificaciones/usuario/{usuarioId}",
                                "abc"
                        )
                )
                .andExpect(status().isBadRequest());

        verify(notificacionService, never())
                .listarPorUsuario(anyLong());
    }

    @Test
    @DisplayName("PATCH /api/notificaciones/{id}/leida debe marcar como leída")
    void debeMarcarNotificacionComoLeida() throws Exception {
        NotificacionResponse leida = new NotificacionResponse(
                100L,
                usuarioResponse,
                "Estado actualizado",
                "Tu envío cambió al estado EN_TRANSITO",
                true,
                notificacionResponse.fechaCreacion()
        );

        when(notificacionService.marcarComoLeida(100L))
                .thenReturn(leida);

        mockMvc.perform(
                        patch(
                                "/api/notificaciones/{id}/leida",
                                100L
                        )
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(content()
                        .contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Notificación marcada como leída"))
                .andExpect(jsonPath("$.data.id").value(100))
                .andExpect(jsonPath("$.data.leida")
                        .value(true));

        verify(notificacionService)
                .marcarComoLeida(100L);
    }

    @Test
    @DisplayName("PATCH marcar leída debe rechazar ID inválido")
    void debeRechazarNotificacionIdInvalido() throws Exception {
        mockMvc.perform(
                        patch(
                                "/api/notificaciones/{id}/leida",
                                "abc"
                        )
                )
                .andExpect(status().isBadRequest());

        verify(notificacionService, never())
                .marcarComoLeida(anyLong());
    }

    @Test
    @DisplayName("GET /usuario/{id}/no-leidas debe contar notificaciones")
    void debeContarNotificacionesNoLeidas() throws Exception {
        when(notificacionService.contarNoLeidas(10L))
                .thenReturn(4L);

        mockMvc.perform(
                        get(
                                "/api/notificaciones/usuario/{usuarioId}/no-leidas",
                                10L
                        )
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(content()
                        .contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Cantidad de notificaciones no leídas obtenida correctamente"))
                .andExpect(jsonPath("$.data").value(4))
                .andExpect(jsonPath("$.timestamp")
                        .exists());

        verify(notificacionService)
                .contarNoLeidas(10L);
    }

    @Test
    @DisplayName("GET contar no leídas debe retornar cero")
    void debeRetornarCeroCuandoNoHayNoLeidas() throws Exception {
        when(notificacionService.contarNoLeidas(10L))
                .thenReturn(0L);

        mockMvc.perform(
                        get(
                                "/api/notificaciones/usuario/{usuarioId}/no-leidas",
                                10L
                        )
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value(0));

        verify(notificacionService)
                .contarNoLeidas(10L);
    }

    @Test
    @DisplayName("GET contar no leídas debe rechazar usuario ID inválido")
    void debeRechazarUsuarioIdInvalidoAlContar() throws Exception {
        mockMvc.perform(
                        get(
                                "/api/notificaciones/usuario/{usuarioId}/no-leidas",
                                "abc"
                        )
                )
                .andExpect(status().isBadRequest());

        verify(notificacionService, never())
                .contarNoLeidas(anyLong());
    }
}