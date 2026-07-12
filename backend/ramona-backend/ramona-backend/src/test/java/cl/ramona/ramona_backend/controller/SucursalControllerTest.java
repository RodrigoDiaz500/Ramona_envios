package cl.ramona.ramona_backend.controller;

import cl.ramona.ramona_backend.dto.request.SucursalRequest;
import cl.ramona.ramona_backend.dto.response.SucursalResponse;
import cl.ramona.ramona_backend.service.SucursalService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
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

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.nullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class SucursalControllerTest {

    @Mock
    private SucursalService sucursalService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private SucursalResponse sucursalResponse;

    @BeforeEach
    void setUp() {
        SucursalController sucursalController =
                new SucursalController(sucursalService);

        LocalValidatorFactoryBean validator =
                new LocalValidatorFactoryBean();

        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders
                .standaloneSetup(sucursalController)
                .setValidator(validator)
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();

        sucursalResponse = new SucursalResponse(
                1L,
                "Sucursal San Antonio",
                "Barros Luco 123",
                "San Antonio",
                "+5635 2223344",
                true,
                LocalDateTime.of(2026, 7, 10, 10, 30)
        );
    }

    @Test
    @DisplayName("GET /api/sucursales debe listar todas las sucursales")
    void debeListarSucursales() throws Exception {
        SucursalResponse segundaSucursal = new SucursalResponse(
                2L,
                "Sucursal Santiago",
                "Alameda 500",
                "Santiago",
                "+562 22334455",
                true,
                LocalDateTime.of(2026, 7, 11, 11, 0)
        );

        when(sucursalService.listarSucursales())
                .thenReturn(List.of(
                        sucursalResponse,
                        segundaSucursal
                ));

        mockMvc.perform(
                        get("/api/sucursales")
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(content()
                        .contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Sucursales obtenidas correctamente"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[0].nombre")
                        .value("Sucursal San Antonio"))
                .andExpect(jsonPath("$.data[0].direccion")
                        .value("Barros Luco 123"))
                .andExpect(jsonPath("$.data[0].ciudad")
                        .value("San Antonio"))
                .andExpect(jsonPath("$.data[0].telefono")
                        .value("+5635 2223344"))
                .andExpect(jsonPath("$.data[0].habilitada")
                        .value(true))
                .andExpect(jsonPath("$.data[1].id").value(2))
                .andExpect(jsonPath("$.data[1].nombre")
                        .value("Sucursal Santiago"))
                .andExpect(jsonPath("$.timestamp").exists());

        verify(sucursalService).listarSucursales();
    }

    @Test
    @DisplayName("GET /api/sucursales debe retornar una lista vacía")
    void debeRetornarListaVacia() throws Exception {
        when(sucursalService.listarSucursales())
                .thenReturn(List.of());

        mockMvc.perform(
                        get("/api/sucursales")
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Sucursales obtenidas correctamente"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data").isEmpty());

        verify(sucursalService).listarSucursales();
    }

    @Test
    @DisplayName("GET /api/sucursales/{id} debe obtener una sucursal")
    void debeObtenerSucursalPorId() throws Exception {
        when(sucursalService.obtenerSucursalPorId(1L))
                .thenReturn(sucursalResponse);

        mockMvc.perform(
                        get("/api/sucursales/{id}", 1L)
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(content()
                        .contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Sucursal obtenida correctamente"))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.nombre")
                        .value("Sucursal San Antonio"))
                .andExpect(jsonPath("$.data.direccion")
                        .value("Barros Luco 123"))
                .andExpect(jsonPath("$.data.ciudad")
                        .value("San Antonio"))
                .andExpect(jsonPath("$.data.telefono")
                        .value("+5635 2223344"))
                .andExpect(jsonPath("$.data.habilitada")
                        .value(true));

        verify(sucursalService).obtenerSucursalPorId(1L);
    }

    @Test
    @DisplayName("GET /api/sucursales/{id} debe rechazar un ID inválido")
    void debeRechazarIdInvalido() throws Exception {
        mockMvc.perform(
                        get("/api/sucursales/{id}", "abc")
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isBadRequest());

        verify(sucursalService, never())
                .obtenerSucursalPorId(anyLong());
    }

    @Test
    @DisplayName("POST /api/sucursales debe crear una sucursal válida")
    void debeCrearSucursal() throws Exception {
        SucursalRequest request = new SucursalRequest(
                "Sucursal San Antonio",
                "Barros Luco 123",
                "San Antonio",
                "+5635 2223344"
        );

        when(sucursalService.crearSucursal(any(SucursalRequest.class)))
                .thenReturn(sucursalResponse);

        mockMvc.perform(
                        post("/api/sucursales")
                                .contentType(MediaType.APPLICATION_JSON)
                                .accept(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpect(content()
                        .contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Sucursal creada correctamente"))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.nombre")
                        .value("Sucursal San Antonio"))
                .andExpect(jsonPath("$.data.direccion")
                        .value("Barros Luco 123"))
                .andExpect(jsonPath("$.data.ciudad")
                        .value("San Antonio"))
                .andExpect(jsonPath("$.data.telefono")
                        .value("+5635 2223344"))
                .andExpect(jsonPath("$.data.habilitada")
                        .value(true));

        ArgumentCaptor<SucursalRequest> captor =
                ArgumentCaptor.forClass(SucursalRequest.class);

        verify(sucursalService)
                .crearSucursal(captor.capture());

        SucursalRequest requestRecibido = captor.getValue();

        assertThat(requestRecibido.nombre())
                .isEqualTo("Sucursal San Antonio");

        assertThat(requestRecibido.direccion())
                .isEqualTo("Barros Luco 123");

        assertThat(requestRecibido.ciudad())
                .isEqualTo("San Antonio");

        assertThat(requestRecibido.telefono())
                .isEqualTo("+5635 2223344");
    }

    @Test
    @DisplayName("POST /api/sucursales debe permitir teléfono nulo")
    void debeCrearSucursalSinTelefono() throws Exception {
        SucursalRequest request = new SucursalRequest(
                "Sucursal Cartagena",
                "Avenida Cartagena 100",
                "Cartagena",
                null
        );

        SucursalResponse response = new SucursalResponse(
                3L,
                "Sucursal Cartagena",
                "Avenida Cartagena 100",
                "Cartagena",
                null,
                true,
                LocalDateTime.of(2026, 7, 10, 12, 0)
        );

        when(sucursalService.crearSucursal(any(SucursalRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                        post("/api/sucursales")
                                .contentType(MediaType.APPLICATION_JSON)
                                .accept(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(3))
                .andExpect(jsonPath("$.data.nombre")
                        .value("Sucursal Cartagena"))
                .andExpect(jsonPath("$.data.telefono")
                        .value(nullValue()))
                .andExpect(jsonPath("$.data.habilitada")
                        .value(true));

        verify(sucursalService)
                .crearSucursal(any(SucursalRequest.class));
    }

    @Test
    @DisplayName("POST /api/sucursales debe rechazar nombre vacío")
    void debeRechazarNombreVacio() throws Exception {
        String json = """
                {
                  "nombre": "",
                  "direccion": "Barros Luco 123",
                  "ciudad": "San Antonio",
                  "telefono": "+5635 2223344"
                }
                """;

        mockMvc.perform(
                        post("/api/sucursales")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(sucursalService, never())
                .crearSucursal(any(SucursalRequest.class));
    }

    @Test
    @DisplayName("POST /api/sucursales debe rechazar dirección vacía")
    void debeRechazarDireccionVacia() throws Exception {
        String json = """
                {
                  "nombre": "Sucursal San Antonio",
                  "direccion": "",
                  "ciudad": "San Antonio",
                  "telefono": "+5635 2223344"
                }
                """;

        mockMvc.perform(
                        post("/api/sucursales")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(sucursalService, never())
                .crearSucursal(any(SucursalRequest.class));
    }

    @Test
    @DisplayName("POST /api/sucursales debe rechazar ciudad vacía")
    void debeRechazarCiudadVacia() throws Exception {
        String json = """
                {
                  "nombre": "Sucursal San Antonio",
                  "direccion": "Barros Luco 123",
                  "ciudad": "",
                  "telefono": "+5635 2223344"
                }
                """;

        mockMvc.perform(
                        post("/api/sucursales")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(sucursalService, never())
                .crearSucursal(any(SucursalRequest.class));
    }

    @Test
    @DisplayName("POST /api/sucursales debe rechazar teléfono demasiado largo")
    void debeRechazarTelefonoDemasiadoLargo() throws Exception {
        String json = """
                {
                  "nombre": "Sucursal San Antonio",
                  "direccion": "Barros Luco 123",
                  "ciudad": "San Antonio",
                  "telefono": "123456789012345678901"
                }
                """;

        mockMvc.perform(
                        post("/api/sucursales")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(sucursalService, never())
                .crearSucursal(any(SucursalRequest.class));
    }

    @Test
    @DisplayName("POST /api/sucursales debe rechazar nombre demasiado largo")
    void debeRechazarNombreDemasiadoLargo() throws Exception {
        String nombreLargo = "A".repeat(101);

        String json = """
                {
                  "nombre": "%s",
                  "direccion": "Barros Luco 123",
                  "ciudad": "San Antonio",
                  "telefono": "+5635 2223344"
                }
                """.formatted(nombreLargo);

        mockMvc.perform(
                        post("/api/sucursales")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(sucursalService, never())
                .crearSucursal(any(SucursalRequest.class));
    }

    @Test
    @DisplayName("POST /api/sucursales debe rechazar JSON inválido")
    void debeRechazarJsonInvalido() throws Exception {
        String jsonInvalido = """
                {
                  "nombre": "Sucursal San Antonio",
                  "direccion":
                }
                """;

        mockMvc.perform(
                        post("/api/sucursales")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(jsonInvalido)
                )
                .andExpect(status().isBadRequest());

        verify(sucursalService, never())
                .crearSucursal(any(SucursalRequest.class));
    }

    @Test
    @DisplayName("PUT /api/sucursales/{id} debe actualizar una sucursal")
    void debeActualizarSucursal() throws Exception {
        SucursalRequest request = new SucursalRequest(
                "Sucursal Actualizada",
                "Centenario 450",
                "San Antonio",
                "+5635 2998877"
        );

        SucursalResponse responseActualizada = new SucursalResponse(
                1L,
                "Sucursal Actualizada",
                "Centenario 450",
                "San Antonio",
                "+5635 2998877",
                true,
                sucursalResponse.fechaCreacion()
        );

        when(sucursalService.actualizarSucursal(
                eq(1L),
                any(SucursalRequest.class)
        )).thenReturn(responseActualizada);

        mockMvc.perform(
                        put("/api/sucursales/{id}", 1L)
                                .contentType(MediaType.APPLICATION_JSON)
                                .accept(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Sucursal actualizada correctamente"))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.nombre")
                        .value("Sucursal Actualizada"))
                .andExpect(jsonPath("$.data.direccion")
                        .value("Centenario 450"))
                .andExpect(jsonPath("$.data.ciudad")
                        .value("San Antonio"))
                .andExpect(jsonPath("$.data.telefono")
                        .value("+5635 2998877"))
                .andExpect(jsonPath("$.data.habilitada")
                        .value(true));

        ArgumentCaptor<SucursalRequest> captor =
                ArgumentCaptor.forClass(SucursalRequest.class);

        verify(sucursalService)
                .actualizarSucursal(eq(1L), captor.capture());

        SucursalRequest requestRecibido = captor.getValue();

        assertThat(requestRecibido.nombre())
                .isEqualTo("Sucursal Actualizada");

        assertThat(requestRecibido.direccion())
                .isEqualTo("Centenario 450");
    }

    @Test
    @DisplayName("PUT /api/sucursales/{id} debe rechazar datos inválidos")
    void debeRechazarActualizacionInvalida() throws Exception {
        String json = """
                {
                  "nombre": "",
                  "direccion": "",
                  "ciudad": "",
                  "telefono": "123"
                }
                """;

        mockMvc.perform(
                        put("/api/sucursales/{id}", 1L)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest());

        verify(sucursalService, never())
                .actualizarSucursal(
                        anyLong(),
                        any(SucursalRequest.class)
                );
    }

    @Test
    @DisplayName("PATCH /api/sucursales/{id}/habilitada debe deshabilitar una sucursal")
    void debeDeshabilitarSucursal() throws Exception {
        SucursalResponse responseDeshabilitada = new SucursalResponse(
                1L,
                sucursalResponse.nombre(),
                sucursalResponse.direccion(),
                sucursalResponse.ciudad(),
                sucursalResponse.telefono(),
                false,
                sucursalResponse.fechaCreacion()
        );

        when(sucursalService.cambiarEstadoSucursal(1L, false))
                .thenReturn(responseDeshabilitada);

        mockMvc.perform(
                        patch("/api/sucursales/{id}/habilitada", 1L)
                                .param("habilitada", "false")
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Estado de la sucursal actualizado correctamente"))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.habilitada")
                        .value(false));

        verify(sucursalService)
                .cambiarEstadoSucursal(1L, false);
    }

    @Test
    @DisplayName("PATCH /api/sucursales/{id}/habilitada debe habilitar una sucursal")
    void debeHabilitarSucursal() throws Exception {
        when(sucursalService.cambiarEstadoSucursal(1L, true))
                .thenReturn(sucursalResponse);

        mockMvc.perform(
                        patch("/api/sucursales/{id}/habilitada", 1L)
                                .param("habilitada", "true")
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Estado de la sucursal actualizado correctamente"))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.habilitada")
                        .value(true));

        verify(sucursalService)
                .cambiarEstadoSucursal(1L, true);
    }

    @Test
    @DisplayName("PATCH debe rechazar cuando falta el parámetro habilitada")
    void debeRechazarPatchSinParametro() throws Exception {
        mockMvc.perform(
                        patch("/api/sucursales/{id}/habilitada", 1L)
                )
                .andExpect(status().isBadRequest());

        verify(sucursalService, never())
                .cambiarEstadoSucursal(anyLong(), anyBoolean());
    }

    @Test
    @DisplayName("PATCH debe rechazar un valor booleano inválido")
    void debeRechazarBooleanoInvalido() throws Exception {
        mockMvc.perform(
                        patch("/api/sucursales/{id}/habilitada", 1L)
                                .param("habilitada", "valor-invalido")
                )
                .andExpect(status().isBadRequest());

        verify(sucursalService, never())
                .cambiarEstadoSucursal(anyLong(), anyBoolean());
    }

    @Test
    @DisplayName("DELETE /api/sucursales/{id} debe eliminar una sucursal")
    void debeEliminarSucursal() throws Exception {
        doNothing()
                .when(sucursalService)
                .eliminarSucursal(1L);

        mockMvc.perform(
                        delete("/api/sucursales/{id}", 1L)
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(content()
                        .contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Sucursal eliminada correctamente"))
                .andExpect(jsonPath("$.data")
                        .value(nullValue()))
                .andExpect(jsonPath("$.timestamp").exists());

        verify(sucursalService)
                .eliminarSucursal(1L);
    }
}