package cl.ramona.ramona_backend.controller;

import cl.ramona.ramona_backend.dto.request.UsuarioRequest;
import cl.ramona.ramona_backend.dto.response.RolResponse;
import cl.ramona.ramona_backend.dto.response.UsuarioResponse;
import cl.ramona.ramona_backend.service.UsuarioService;
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
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UsuarioControllerTest {

    @Mock
    private UsuarioService usuarioService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private UsuarioResponse usuarioResponse;
    private RolResponse rolCliente;

    @BeforeEach
    void setUp() {
        UsuarioController usuarioController =
                new UsuarioController(usuarioService);

        LocalValidatorFactoryBean validator =
                new LocalValidatorFactoryBean();

        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders
                .standaloneSetup(usuarioController)
                .setValidator(validator)
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();

        rolCliente = new RolResponse(
                1L,
                "CLIENTE"
        );

        usuarioResponse = new UsuarioResponse(
                10L,
                "Rodrigo",
                "Díaz",
                "rodrigo@correo.cl",
                "+569 1111 2222",
                "San Antonio",
                true,
                "entra-id-10",
                rolCliente,
                LocalDateTime.of(2026, 7, 10, 10, 0),
                LocalDateTime.of(2026, 7, 11, 11, 0)
        );
    }

    @Test
    @DisplayName("GET /api/usuarios debe listar todos los usuarios")
    void debeListarUsuarios() throws Exception {
        UsuarioResponse segundoUsuario = new UsuarioResponse(
                20L,
                "Ana",
                "Pérez",
                "ana@correo.cl",
                "+569 3333 4444",
                "Santiago",
                true,
                "entra-id-20",
                new RolResponse(2L, "OPERADOR"),
                LocalDateTime.of(2026, 7, 9, 9, 0),
                LocalDateTime.of(2026, 7, 10, 12, 0)
        );

        when(usuarioService.listarUsuarios())
                .thenReturn(List.of(
                        usuarioResponse,
                        segundoUsuario
                ));

        mockMvc.perform(
                        get("/api/usuarios")
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(content()
                        .contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Usuarios obtenidos correctamente"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].id").value(10))
                .andExpect(jsonPath("$.data[0].nombre")
                        .value("Rodrigo"))
                .andExpect(jsonPath("$.data[0].apellido")
                        .value("Díaz"))
                .andExpect(jsonPath("$.data[0].correo")
                        .value("rodrigo@correo.cl"))
                .andExpect(jsonPath("$.data[0].activo")
                        .value(true))
                .andExpect(jsonPath("$.data[0].rol.nombre")
                        .value("CLIENTE"))
                .andExpect(jsonPath("$.data[1].id").value(20))
                .andExpect(jsonPath("$.data[1].rol.nombre")
                        .value("OPERADOR"))
                .andExpect(jsonPath("$.timestamp").exists());

        verify(usuarioService).listarUsuarios();
    }

    @Test
    @DisplayName("GET /api/usuarios debe devolver lista vacía")
    void debeRetornarListaVacia() throws Exception {
        when(usuarioService.listarUsuarios())
                .thenReturn(List.of());

        mockMvc.perform(
                        get("/api/usuarios")
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data").isEmpty());

        verify(usuarioService).listarUsuarios();
    }

    @Test
    @DisplayName("GET /api/usuarios/{id} debe obtener un usuario")
    void debeObtenerUsuarioPorId() throws Exception {
        when(usuarioService.obtenerUsuarioPorId(10L))
                .thenReturn(usuarioResponse);

        mockMvc.perform(
                        get("/api/usuarios/{id}", 10L)
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Usuario obtenido correctamente"))
                .andExpect(jsonPath("$.data.id").value(10))
                .andExpect(jsonPath("$.data.nombre")
                        .value("Rodrigo"))
                .andExpect(jsonPath("$.data.apellido")
                        .value("Díaz"))
                .andExpect(jsonPath("$.data.correo")
                        .value("rodrigo@correo.cl"))
                .andExpect(jsonPath("$.data.telefono")
                        .value("+569 1111 2222"))
                .andExpect(jsonPath("$.data.direccion")
                        .value("San Antonio"))
                .andExpect(jsonPath("$.data.activo")
                        .value(true))
                .andExpect(jsonPath("$.data.entraId")
                        .value("entra-id-10"))
                .andExpect(jsonPath("$.data.rol.id")
                        .value(1))
                .andExpect(jsonPath("$.data.rol.nombre")
                        .value("CLIENTE"));

        verify(usuarioService)
                .obtenerUsuarioPorId(10L);
    }

    @Test
    @DisplayName("GET /api/usuarios/{id} debe rechazar ID inválido")
    void debeRechazarIdInvalido() throws Exception {
        mockMvc.perform(
                        get("/api/usuarios/{id}", "abc")
                )
                .andExpect(status().isBadRequest());

        verify(usuarioService, never())
                .obtenerUsuarioPorId(anyLong());
    }

    @Test
    @DisplayName("POST /api/usuarios debe crear un usuario válido")
    void debeCrearUsuario() throws Exception {
        UsuarioRequest request = new UsuarioRequest(
                "Rodrigo",
                "Díaz",
                "rodrigo@correo.cl",
                "+569 1111 2222",
                "San Antonio",
                "entra-id-10",
                1L
        );

        when(usuarioService
                .crearUsuario(any(UsuarioRequest.class)))
                .thenReturn(usuarioResponse);

        mockMvc.perform(
                        post("/api/usuarios")
                                .contentType(MediaType.APPLICATION_JSON)
                                .accept(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Usuario creado correctamente"))
                .andExpect(jsonPath("$.data.id").value(10))
                .andExpect(jsonPath("$.data.nombre")
                        .value("Rodrigo"))
                .andExpect(jsonPath("$.data.correo")
                        .value("rodrigo@correo.cl"))
                .andExpect(jsonPath("$.data.activo")
                        .value(true))
                .andExpect(jsonPath("$.data.rol.nombre")
                        .value("CLIENTE"));

        ArgumentCaptor<UsuarioRequest> captor =
                ArgumentCaptor.forClass(UsuarioRequest.class);

        verify(usuarioService)
                .crearUsuario(captor.capture());

        UsuarioRequest recibido = captor.getValue();

        assertThat(recibido.nombre())
                .isEqualTo("Rodrigo");

        assertThat(recibido.apellido())
                .isEqualTo("Díaz");

        assertThat(recibido.correo())
                .isEqualTo("rodrigo@correo.cl");

        assertThat(recibido.telefono())
                .isEqualTo("+569 1111 2222");

        assertThat(recibido.direccion())
                .isEqualTo("San Antonio");

        assertThat(recibido.entraId())
                .isEqualTo("entra-id-10");

        assertThat(recibido.roleId())
                .isEqualTo(1L);
    }

    @Test
    @DisplayName("POST /api/usuarios debe permitir teléfono, dirección y entraId nulos")
    void debeCrearUsuarioConCamposOpcionalesNulos() throws Exception {
        UsuarioRequest request = new UsuarioRequest(
                "Carlos",
                "Pérez",
                "carlos@correo.cl",
                null,
                null,
                null,
                1L
        );

        UsuarioResponse response = new UsuarioResponse(
                30L,
                "Carlos",
                "Pérez",
                "carlos@correo.cl",
                null,
                null,
                true,
                null,
                rolCliente,
                LocalDateTime.now(),
                null
        );

        when(usuarioService
                .crearUsuario(any(UsuarioRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                        post("/api/usuarios")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(30))
                .andExpect(jsonPath("$.data.telefono")
                        .value(nullValue()))
                .andExpect(jsonPath("$.data.direccion")
                        .value(nullValue()))
                .andExpect(jsonPath("$.data.entraId")
                        .value(nullValue()));

        verify(usuarioService)
                .crearUsuario(any(UsuarioRequest.class));
    }

    @Test
    @DisplayName("POST /api/usuarios debe rechazar nombre vacío")
    void debeRechazarNombreVacio() throws Exception {
        String json = """
                {
                  "nombre": "",
                  "apellido": "Díaz",
                  "correo": "rodrigo@correo.cl",
                  "telefono": "+569 1111 2222",
                  "direccion": "San Antonio",
                  "entraId": "entra-id-10",
                  "roleId": 1
                }
                """;

        mockMvc.perform(
                        post("/api/usuarios")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(usuarioService, never())
                .crearUsuario(any(UsuarioRequest.class));
    }

    @Test
    @DisplayName("POST /api/usuarios debe rechazar apellido vacío")
    void debeRechazarApellidoVacio() throws Exception {
        String json = """
                {
                  "nombre": "Rodrigo",
                  "apellido": "",
                  "correo": "rodrigo@correo.cl",
                  "roleId": 1
                }
                """;

        mockMvc.perform(
                        post("/api/usuarios")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(usuarioService, never())
                .crearUsuario(any(UsuarioRequest.class));
    }

    @Test
    @DisplayName("POST /api/usuarios debe rechazar correo vacío")
    void debeRechazarCorreoVacio() throws Exception {
        String json = """
                {
                  "nombre": "Rodrigo",
                  "apellido": "Díaz",
                  "correo": "",
                  "roleId": 1
                }
                """;

        mockMvc.perform(
                        post("/api/usuarios")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(usuarioService, never())
                .crearUsuario(any(UsuarioRequest.class));
    }

    @Test
    @DisplayName("POST /api/usuarios debe rechazar correo inválido")
    void debeRechazarCorreoInvalido() throws Exception {
        String json = """
                {
                  "nombre": "Rodrigo",
                  "apellido": "Díaz",
                  "correo": "correo-invalido",
                  "roleId": 1
                }
                """;

        mockMvc.perform(
                        post("/api/usuarios")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(usuarioService, never())
                .crearUsuario(any(UsuarioRequest.class));
    }

    @Test
    @DisplayName("POST /api/usuarios debe rechazar rol nulo")
    void debeRechazarRolNulo() throws Exception {
        String json = """
                {
                  "nombre": "Rodrigo",
                  "apellido": "Díaz",
                  "correo": "rodrigo@correo.cl",
                  "roleId": null
                }
                """;

        mockMvc.perform(
                        post("/api/usuarios")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(usuarioService, never())
                .crearUsuario(any(UsuarioRequest.class));
    }

    @Test
    @DisplayName("POST /api/usuarios debe rechazar teléfono demasiado largo")
    void debeRechazarTelefonoDemasiadoLargo() throws Exception {
        String json = """
                {
                  "nombre": "Rodrigo",
                  "apellido": "Díaz",
                  "correo": "rodrigo@correo.cl",
                  "telefono": "123456789012345678901",
                  "roleId": 1
                }
                """;

        mockMvc.perform(
                        post("/api/usuarios")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(usuarioService, never())
                .crearUsuario(any(UsuarioRequest.class));
    }

    @Test
    @DisplayName("POST /api/usuarios debe rechazar nombre demasiado largo")
    void debeRechazarNombreDemasiadoLargo() throws Exception {
        String nombreLargo = "A".repeat(101);

        String json = """
                {
                  "nombre": "%s",
                  "apellido": "Díaz",
                  "correo": "rodrigo@correo.cl",
                  "roleId": 1
                }
                """.formatted(nombreLargo);

        mockMvc.perform(
                        post("/api/usuarios")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(usuarioService, never())
                .crearUsuario(any(UsuarioRequest.class));
    }

    @Test
    @DisplayName("POST /api/usuarios debe rechazar JSON inválido")
    void debeRechazarJsonInvalido() throws Exception {
        String json = """
                {
                  "nombre": "Rodrigo",
                  "apellido":
                }
                """;

        mockMvc.perform(
                        post("/api/usuarios")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(usuarioService, never())
                .crearUsuario(any(UsuarioRequest.class));
    }

    @Test
    @DisplayName("PUT /api/usuarios/{id} debe actualizar un usuario")
    void debeActualizarUsuario() throws Exception {
        UsuarioRequest request = new UsuarioRequest(
                "Rodrigo Andrés",
                "Díaz Vallejos",
                "nuevo@correo.cl",
                "+569 7777 8888",
                "Cartagena",
                "nuevo-entra-id",
                2L
        );

        UsuarioResponse actualizado = new UsuarioResponse(
                10L,
                request.nombre(),
                request.apellido(),
                request.correo(),
                request.telefono(),
                request.direccion(),
                true,
                request.entraId(),
                new RolResponse(2L, "OPERADOR"),
                usuarioResponse.fechaCreacion(),
                LocalDateTime.now()
        );

        when(usuarioService.actualizarUsuario(
                eq(10L),
                any(UsuarioRequest.class)
        )).thenReturn(actualizado);

        mockMvc.perform(
                        put("/api/usuarios/{id}", 10L)
                                .contentType(MediaType.APPLICATION_JSON)
                                .accept(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Usuario actualizado correctamente"))
                .andExpect(jsonPath("$.data.id").value(10))
                .andExpect(jsonPath("$.data.nombre")
                        .value("Rodrigo Andrés"))
                .andExpect(jsonPath("$.data.apellido")
                        .value("Díaz Vallejos"))
                .andExpect(jsonPath("$.data.correo")
                        .value("nuevo@correo.cl"))
                .andExpect(jsonPath("$.data.rol.nombre")
                        .value("OPERADOR"));

        ArgumentCaptor<UsuarioRequest> captor =
                ArgumentCaptor.forClass(UsuarioRequest.class);

        verify(usuarioService)
                .actualizarUsuario(eq(10L), captor.capture());

        assertThat(captor.getValue().nombre())
                .isEqualTo("Rodrigo Andrés");

        assertThat(captor.getValue().roleId())
                .isEqualTo(2L);
    }

    @Test
    @DisplayName("PUT /api/usuarios/{id} debe rechazar datos inválidos")
    void debeRechazarActualizacionInvalida() throws Exception {
        String json = """
                {
                  "nombre": "",
                  "apellido": "",
                  "correo": "correo-invalido",
                  "roleId": null
                }
                """;

        mockMvc.perform(
                        put("/api/usuarios/{id}", 10L)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(usuarioService, never())
                .actualizarUsuario(
                        anyLong(),
                        any(UsuarioRequest.class)
                );
    }

    @Test
    @DisplayName("PATCH /api/usuarios/{id}/activo debe deshabilitar usuario")
    void debeDeshabilitarUsuario() throws Exception {
        UsuarioResponse deshabilitado = new UsuarioResponse(
                10L,
                usuarioResponse.nombre(),
                usuarioResponse.apellido(),
                usuarioResponse.correo(),
                usuarioResponse.telefono(),
                usuarioResponse.direccion(),
                false,
                usuarioResponse.entraId(),
                usuarioResponse.rol(),
                usuarioResponse.fechaCreacion(),
                LocalDateTime.now()
        );

        when(usuarioService
                .cambiarEstadoUsuario(10L, false))
                .thenReturn(deshabilitado);

        mockMvc.perform(
                        patch("/api/usuarios/{id}/activo", 10L)
                                .param("activo", "false")
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Estado del usuario actualizado correctamente"))
                .andExpect(jsonPath("$.data.id").value(10))
                .andExpect(jsonPath("$.data.activo")
                        .value(false));

        verify(usuarioService)
                .cambiarEstadoUsuario(10L, false);
    }

    @Test
    @DisplayName("PATCH /api/usuarios/{id}/activo debe habilitar usuario")
    void debeHabilitarUsuario() throws Exception {
        when(usuarioService
                .cambiarEstadoUsuario(10L, true))
                .thenReturn(usuarioResponse);

        mockMvc.perform(
                        patch("/api/usuarios/{id}/activo", 10L)
                                .param("activo", "true")
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.activo")
                        .value(true));

        verify(usuarioService)
                .cambiarEstadoUsuario(10L, true);
    }

    @Test
    @DisplayName("PATCH activo debe rechazar parámetro faltante")
    void debeRechazarActivoFaltante() throws Exception {
        mockMvc.perform(
                        patch("/api/usuarios/{id}/activo", 10L)
                )
                .andExpect(status().isBadRequest());

        verify(usuarioService, never())
                .cambiarEstadoUsuario(anyLong(), anyBoolean());
    }

    @Test
    @DisplayName("PATCH activo debe rechazar booleano inválido")
    void debeRechazarActivoInvalido() throws Exception {
        mockMvc.perform(
                        patch("/api/usuarios/{id}/activo", 10L)
                                .param("activo", "incorrecto")
                )
                .andExpect(status().isBadRequest());

        verify(usuarioService, never())
                .cambiarEstadoUsuario(anyLong(), anyBoolean());
    }

    @Test
    @DisplayName("PATCH /api/usuarios/{id}/rol debe cambiar el rol")
    void debeCambiarRolUsuario() throws Exception {
        UsuarioResponse administrador = new UsuarioResponse(
                10L,
                usuarioResponse.nombre(),
                usuarioResponse.apellido(),
                usuarioResponse.correo(),
                usuarioResponse.telefono(),
                usuarioResponse.direccion(),
                true,
                usuarioResponse.entraId(),
                new RolResponse(3L, "ADMIN"),
                usuarioResponse.fechaCreacion(),
                LocalDateTime.now()
        );

        when(usuarioService
                .cambiarRolUsuario(10L, 3L))
                .thenReturn(administrador);

        mockMvc.perform(
                        patch("/api/usuarios/{id}/rol", 10L)
                                .param("roleId", "3")
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Rol del usuario actualizado correctamente"))
                .andExpect(jsonPath("$.data.id").value(10))
                .andExpect(jsonPath("$.data.rol.id").value(3))
                .andExpect(jsonPath("$.data.rol.nombre")
                        .value("ADMIN"));

        verify(usuarioService)
                .cambiarRolUsuario(10L, 3L);
    }

    @Test
    @DisplayName("PATCH rol debe rechazar roleId faltante")
    void debeRechazarRoleIdFaltante() throws Exception {
        mockMvc.perform(
                        patch("/api/usuarios/{id}/rol", 10L)
                )
                .andExpect(status().isBadRequest());

        verify(usuarioService, never())
                .cambiarRolUsuario(anyLong(), anyLong());
    }

    @Test
    @DisplayName("PATCH rol debe rechazar roleId inválido")
    void debeRechazarRoleIdInvalido() throws Exception {
        mockMvc.perform(
                        patch("/api/usuarios/{id}/rol", 10L)
                                .param("roleId", "abc")
                )
                .andExpect(status().isBadRequest());

        verify(usuarioService, never())
                .cambiarRolUsuario(anyLong(), anyLong());
    }

    @Test
    @DisplayName("DELETE /api/usuarios/{id} debe eliminar un usuario")
    void debeEliminarUsuario() throws Exception {
        doNothing()
                .when(usuarioService)
                .eliminarUsuario(10L);

        mockMvc.perform(
                        delete("/api/usuarios/{id}", 10L)
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(content()
                        .contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Usuario eliminado correctamente"))
                .andExpect(jsonPath("$.data")
                        .value(nullValue()))
                .andExpect(jsonPath("$.timestamp").exists());

        verify(usuarioService)
                .eliminarUsuario(10L);
    }
}