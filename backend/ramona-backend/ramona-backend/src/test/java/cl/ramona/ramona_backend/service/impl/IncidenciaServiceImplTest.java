package cl.ramona.ramona_backend.service.impl;

import cl.ramona.ramona_backend.dto.request.ActualizarEstadoIncidenciaRequest;
import cl.ramona.ramona_backend.dto.request.IncidenciaRequest;
import cl.ramona.ramona_backend.dto.response.IncidenciaResponse;
import cl.ramona.ramona_backend.entity.Incidencia;
import cl.ramona.ramona_backend.entity.Rol;
import cl.ramona.ramona_backend.entity.SolicitudEnvio;
import cl.ramona.ramona_backend.entity.Sucursal;
import cl.ramona.ramona_backend.entity.Usuario;
import cl.ramona.ramona_backend.enums.EstadoIncidencia;
import cl.ramona.ramona_backend.enums.EstadoSolicitud;
import cl.ramona.ramona_backend.exception.ResourceNotFoundException;
import cl.ramona.ramona_backend.repository.IncidenciaRepository;
import cl.ramona.ramona_backend.repository.SolicitudEnvioRepository;
import cl.ramona.ramona_backend.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IncidenciaServiceImplTest {

    @Mock
    private IncidenciaRepository incidenciaRepository;

    @Mock
    private SolicitudEnvioRepository solicitudEnvioRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    private IncidenciaServiceImpl incidenciaService;

    private Rol rolCliente;
    private Rol rolOperador;

    private Usuario cliente;
    private Usuario operador;

    private Sucursal sucursalOrigen;
    private Sucursal sucursalDestino;

    private SolicitudEnvio solicitud;
    private Incidencia incidenciaExistente;

    @BeforeEach
    void setUp() {
        incidenciaService = new IncidenciaServiceImpl(
                incidenciaRepository,
                solicitudEnvioRepository,
                usuarioRepository
        );

        rolCliente = Rol.builder()
                .id(1L)
                .nombre("CLIENTE")
                .build();

        rolOperador = Rol.builder()
                .id(2L)
                .nombre("OPERADOR")
                .build();

        cliente = Usuario.builder()
                .id(10L)
                .nombre("Carlos")
                .apellido("Díaz")
                .correo("cliente@ramona.cl")
                .telefono("+569 1111 2222")
                .direccion("San Antonio")
                .activo(true)
                .entraId("entra-cliente")
                .rol(rolCliente)
                .fechaCreacion(LocalDateTime.now().minusDays(20))
                .fechaActualizacion(LocalDateTime.now().minusDays(2))
                .build();

        operador = Usuario.builder()
                .id(20L)
                .nombre("Operador")
                .apellido("Ramona")
                .correo("operador@ramona.cl")
                .telefono("+569 3333 4444")
                .direccion("Valparaíso")
                .activo(true)
                .entraId("entra-operador")
                .rol(rolOperador)
                .fechaCreacion(LocalDateTime.now().minusDays(10))
                .fechaActualizacion(LocalDateTime.now().minusDays(1))
                .build();

        sucursalOrigen = Sucursal.builder()
                .id(100L)
                .nombre("Sucursal San Antonio")
                .direccion("Barros Luco 100")
                .ciudad("San Antonio")
                .telefono("+5635 2000000")
                .habilitada(true)
                .fechaCreacion(LocalDateTime.now().minusMonths(1))
                .build();

        sucursalDestino = Sucursal.builder()
                .id(200L)
                .nombre("Sucursal Santiago")
                .direccion("Alameda 200")
                .ciudad("Santiago")
                .telefono("+562 2000000")
                .habilitada(true)
                .fechaCreacion(LocalDateTime.now().minusMonths(1))
                .build();

        solicitud = SolicitudEnvio.builder()
                .id(500L)
                .codigoSeguimiento("RAM-20260710-500")
                .usuario(cliente)
                .sucursalOrigen(sucursalOrigen)
                .sucursalDestino(sucursalDestino)
                .descripcion("Caja con productos")
                .peso(new BigDecimal("4.50"))
                .valorDeclarado(new BigDecimal("70000"))
                .estado(EstadoSolicitud.EN_TRANSITO)
                .destinatarioNombre("María González")
                .destinatarioRutDni("12345678-9")
                .destinatarioTelefono("+569 5555 6666")
                .fechaCreacion(LocalDateTime.now().minusDays(2))
                .build();

        incidenciaExistente = Incidencia.builder()
                .id(1000L)
                .solicitudEnvio(solicitud)
                .titulo("Envío dañado")
                .descripcion("La caja presenta daños durante el transporte")
                .estado(EstadoIncidencia.ABIERTA)
                .creadaPor(cliente)
                .asignadaA(operador)
                .fechaCreacion(LocalDateTime.now().minusHours(5))
                .fechaActualizacion(LocalDateTime.now().minusHours(5))
                .build();
    }

    @Test
    @DisplayName("Debe crear una incidencia con usuario asignado")
    void debeCrearIncidenciaConAsignado() {
        IncidenciaRequest request = new IncidenciaRequest(
                500L,
                "Paquete dañado",
                "La caja presenta golpes visibles",
                10L,
                20L
        );

        when(solicitudEnvioRepository.findById(500L))
                .thenReturn(Optional.of(solicitud));

        when(usuarioRepository.findById(10L))
                .thenReturn(Optional.of(cliente));

        when(usuarioRepository.findById(20L))
                .thenReturn(Optional.of(operador));

        when(incidenciaRepository.save(any(Incidencia.class)))
                .thenAnswer(invocation -> {
                    Incidencia incidencia = invocation.getArgument(0);
                    incidencia.setId(1001L);
                    return incidencia;
                });

        IncidenciaResponse response =
                incidenciaService.crearIncidencia(request);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(1001L);
        assertThat(response.solicitudEnvioId()).isEqualTo(500L);
        assertThat(response.codigoSeguimiento())
                .isEqualTo("RAM-20260710-500");

        assertThat(response.titulo())
                .isEqualTo("Paquete dañado");

        assertThat(response.descripcion())
                .isEqualTo("La caja presenta golpes visibles");

        assertThat(response.estado())
                .isEqualTo(EstadoIncidencia.ABIERTA);

        assertThat(response.creadaPor().id())
                .isEqualTo(10L);

        assertThat(response.asignadaA()).isNotNull();
        assertThat(response.asignadaA().id())
                .isEqualTo(20L);

        assertThat(response.fechaCreacion()).isNotNull();
        assertThat(response.fechaActualizacion()).isNotNull();
    }

    @Test
    @DisplayName("Debe crear una incidencia sin usuario asignado")
    void debeCrearIncidenciaSinAsignado() {
        IncidenciaRequest request = new IncidenciaRequest(
                500L,
                "Retraso de entrega",
                "El envío no llegó en la fecha estimada",
                10L,
                null
        );

        when(solicitudEnvioRepository.findById(500L))
                .thenReturn(Optional.of(solicitud));

        when(usuarioRepository.findById(10L))
                .thenReturn(Optional.of(cliente));

        when(incidenciaRepository.save(any(Incidencia.class)))
                .thenAnswer(invocation -> {
                    Incidencia incidencia = invocation.getArgument(0);
                    incidencia.setId(1002L);
                    return incidencia;
                });

        IncidenciaResponse response =
                incidenciaService.crearIncidencia(request);

        assertThat(response.id()).isEqualTo(1002L);
        assertThat(response.estado())
                .isEqualTo(EstadoIncidencia.ABIERTA);
        assertThat(response.asignadaA()).isNull();

        verify(usuarioRepository, never())
                .findById(20L);
    }

    @Test
    @DisplayName("Debe guardar correctamente los datos de la incidencia")
    void debeGuardarDatosCorrectos() {
        IncidenciaRequest request = new IncidenciaRequest(
                500L,
                "Contenido incompleto",
                "Faltan productos dentro de la caja",
                10L,
                20L
        );

        when(solicitudEnvioRepository.findById(500L))
                .thenReturn(Optional.of(solicitud));

        when(usuarioRepository.findById(10L))
                .thenReturn(Optional.of(cliente));

        when(usuarioRepository.findById(20L))
                .thenReturn(Optional.of(operador));

        when(incidenciaRepository.save(any(Incidencia.class)))
                .thenAnswer(invocation -> {
                    Incidencia incidencia = invocation.getArgument(0);
                    incidencia.setId(1003L);
                    return incidencia;
                });

        incidenciaService.crearIncidencia(request);

        ArgumentCaptor<Incidencia> captor =
                ArgumentCaptor.forClass(Incidencia.class);

        verify(incidenciaRepository)
                .save(captor.capture());

        Incidencia guardada = captor.getValue();

        assertThat(guardada.getSolicitudEnvio())
                .isEqualTo(solicitud);

        assertThat(guardada.getTitulo())
                .isEqualTo("Contenido incompleto");

        assertThat(guardada.getDescripcion())
                .isEqualTo("Faltan productos dentro de la caja");

        assertThat(guardada.getEstado())
                .isEqualTo(EstadoIncidencia.ABIERTA);

        assertThat(guardada.getCreadaPor())
                .isEqualTo(cliente);

        assertThat(guardada.getAsignadaA())
                .isEqualTo(operador);

        assertThat(guardada.getFechaCreacion())
                .isNotNull();

        assertThat(guardada.getFechaActualizacion())
                .isNotNull();
    }

    @Test
    @DisplayName("Debe fallar cuando la solicitud no existe")
    void debeFallarCuandoSolicitudNoExiste() {
        IncidenciaRequest request = new IncidenciaRequest(
                999L,
                "Problema",
                "Descripción",
                10L,
                null
        );

        when(solicitudEnvioRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                incidenciaService.crearIncidencia(request)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Solicitud no encontrada");

        verifyNoInteractions(usuarioRepository);

        verify(incidenciaRepository, never())
                .save(any(Incidencia.class));
    }

    @Test
    @DisplayName("Debe fallar cuando el usuario creador no existe")
    void debeFallarCuandoCreadorNoExiste() {
        IncidenciaRequest request = new IncidenciaRequest(
                500L,
                "Problema",
                "Descripción",
                999L,
                null
        );

        when(solicitudEnvioRepository.findById(500L))
                .thenReturn(Optional.of(solicitud));

        when(usuarioRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                incidenciaService.crearIncidencia(request)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Usuario creador no encontrado");

        verify(incidenciaRepository, never())
                .save(any(Incidencia.class));
    }

    @Test
    @DisplayName("Debe fallar cuando el usuario asignado no existe")
    void debeFallarCuandoAsignadoNoExiste() {
        IncidenciaRequest request = new IncidenciaRequest(
                500L,
                "Problema",
                "Descripción",
                10L,
                999L
        );

        when(solicitudEnvioRepository.findById(500L))
                .thenReturn(Optional.of(solicitud));

        when(usuarioRepository.findById(10L))
                .thenReturn(Optional.of(cliente));

        when(usuarioRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                incidenciaService.crearIncidencia(request)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Usuario asignado no encontrado");

        verify(incidenciaRepository, never())
                .save(any(Incidencia.class));
    }

    @Test
    @DisplayName("Debe listar todas las incidencias")
    void debeListarTodasLasIncidencias() {
        Incidencia segunda = crearIncidencia(
                1001L,
                EstadoIncidencia.EN_PROCESO,
                "Retraso",
                operador
        );

        when(incidenciaRepository.findAll())
                .thenReturn(List.of(
                        incidenciaExistente,
                        segunda
                ));

        List<IncidenciaResponse> resultado =
                incidenciaService.listarIncidencias();

        assertThat(resultado).hasSize(2);

        assertThat(resultado)
                .extracting(IncidenciaResponse::id)
                .containsExactly(1000L, 1001L);

        assertThat(resultado)
                .extracting(IncidenciaResponse::estado)
                .containsExactly(
                        EstadoIncidencia.ABIERTA,
                        EstadoIncidencia.EN_PROCESO
                );
    }

    @Test
    @DisplayName("Debe devolver lista vacía cuando no existen incidencias")
    void debeRetornarListaVacia() {
        when(incidenciaRepository.findAll())
                .thenReturn(List.of());

        List<IncidenciaResponse> resultado =
                incidenciaService.listarIncidencias();

        assertThat(resultado).isEmpty();
    }

    @Test
    @DisplayName("Debe obtener una incidencia por ID")
    void debeObtenerIncidenciaPorId() {
        when(incidenciaRepository.findById(1000L))
                .thenReturn(Optional.of(incidenciaExistente));

        IncidenciaResponse response =
                incidenciaService.obtenerPorId(1000L);

        assertThat(response.id()).isEqualTo(1000L);
        assertThat(response.titulo())
                .isEqualTo("Envío dañado");
        assertThat(response.estado())
                .isEqualTo(EstadoIncidencia.ABIERTA);
    }

    @Test
    @DisplayName("Debe fallar al obtener una incidencia inexistente")
    void debeFallarCuandoIncidenciaNoExiste() {
        when(incidenciaRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                incidenciaService.obtenerPorId(999L)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Incidencia no encontrada");
    }

    @Test
    @DisplayName("Debe listar incidencias por solicitud")
    void debeListarPorSolicitud() {
        when(incidenciaRepository.findBySolicitudEnvioId(500L))
                .thenReturn(List.of(incidenciaExistente));

        List<IncidenciaResponse> resultado =
                incidenciaService.listarPorSolicitud(500L);

        assertThat(resultado).hasSize(1);
        assertThat(resultado.getFirst().solicitudEnvioId())
                .isEqualTo(500L);

        verify(incidenciaRepository)
                .findBySolicitudEnvioId(500L);
    }

    @Test
    @DisplayName("Debe listar incidencias por estado")
    void debeListarPorEstado() {
        when(incidenciaRepository.findByEstado(EstadoIncidencia.ABIERTA))
                .thenReturn(List.of(incidenciaExistente));

        List<IncidenciaResponse> resultado =
                incidenciaService.listarPorEstado(
                        EstadoIncidencia.ABIERTA
                );

        assertThat(resultado).hasSize(1);
        assertThat(resultado.getFirst().estado())
                .isEqualTo(EstadoIncidencia.ABIERTA);

        verify(incidenciaRepository)
                .findByEstado(EstadoIncidencia.ABIERTA);
    }

    @Test
    @DisplayName("Debe actualizar el estado de una incidencia sin cambiar asignado")
    void debeActualizarEstadoSinCambiarAsignado() {
        ActualizarEstadoIncidenciaRequest request =
                new ActualizarEstadoIncidenciaRequest(
                        EstadoIncidencia.EN_PROCESO,
                        null
                );

        LocalDateTime fechaAnterior =
                incidenciaExistente.getFechaActualizacion();

        when(incidenciaRepository.findById(1000L))
                .thenReturn(Optional.of(incidenciaExistente));

        when(incidenciaRepository.save(any(Incidencia.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        IncidenciaResponse response =
                incidenciaService.actualizarEstado(
                        1000L,
                        request
                );

        assertThat(response.estado())
                .isEqualTo(EstadoIncidencia.EN_PROCESO);

        assertThat(response.asignadaA()).isNotNull();
        assertThat(response.asignadaA().id())
                .isEqualTo(20L);

        assertThat(response.fechaActualizacion())
                .isAfterOrEqualTo(fechaAnterior);

        verify(usuarioRepository, never())
                .findById(anyLong());
    }

    @Test
    @DisplayName("Debe actualizar el estado y asignar otro usuario")
    void debeActualizarEstadoYAsignado() {
        Usuario nuevoOperador = Usuario.builder()
                .id(30L)
                .nombre("Nuevo")
                .apellido("Operador")
                .correo("nuevo@ramona.cl")
                .telefono("+569 7777 8888")
                .direccion("Santiago")
                .activo(true)
                .entraId("entra-nuevo-operador")
                .rol(rolOperador)
                .fechaCreacion(LocalDateTime.now().minusDays(4))
                .fechaActualizacion(LocalDateTime.now())
                .build();

        ActualizarEstadoIncidenciaRequest request =
                new ActualizarEstadoIncidenciaRequest(
                        EstadoIncidencia.RESUELTA,
                        30L
                );

        when(incidenciaRepository.findById(1000L))
                .thenReturn(Optional.of(incidenciaExistente));

        when(usuarioRepository.findById(30L))
                .thenReturn(Optional.of(nuevoOperador));

        when(incidenciaRepository.save(any(Incidencia.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        IncidenciaResponse response =
                incidenciaService.actualizarEstado(
                        1000L,
                        request
                );

        assertThat(response.estado())
                .isEqualTo(EstadoIncidencia.RESUELTA);

        assertThat(response.asignadaA()).isNotNull();
        assertThat(response.asignadaA().id())
                .isEqualTo(30L);

        assertThat(incidenciaExistente.getAsignadaA())
                .isEqualTo(nuevoOperador);
    }

    @Test
    @DisplayName("Debe fallar al actualizar con usuario asignado inexistente")
    void debeFallarAlActualizarConAsignadoInexistente() {
        ActualizarEstadoIncidenciaRequest request =
                new ActualizarEstadoIncidenciaRequest(
                        EstadoIncidencia.RESUELTA,
                        999L
                );

        when(incidenciaRepository.findById(1000L))
                .thenReturn(Optional.of(incidenciaExistente));

        when(usuarioRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                incidenciaService.actualizarEstado(
                        1000L,
                        request
                )
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Usuario asignado no encontrado");

        verify(incidenciaRepository, never())
                .save(any(Incidencia.class));
    }

    @Test
    @DisplayName("Debe fallar al actualizar una incidencia inexistente")
    void debeFallarAlActualizarIncidenciaInexistente() {
        ActualizarEstadoIncidenciaRequest request =
                new ActualizarEstadoIncidenciaRequest(
                        EstadoIncidencia.CERRADA,
                        null
                );

        when(incidenciaRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                incidenciaService.actualizarEstado(
                        999L,
                        request
                )
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Incidencia no encontrada");

        verifyNoInteractions(usuarioRepository);

        verify(incidenciaRepository, never())
                .save(any(Incidencia.class));
    }

    @Test
    @DisplayName("Debe mapear correctamente todos los campos")
    void debeMapearTodosLosCampos() {
        when(incidenciaRepository.findById(1000L))
                .thenReturn(Optional.of(incidenciaExistente));

        IncidenciaResponse response =
                incidenciaService.obtenerPorId(1000L);

        assertThat(response.id())
                .isEqualTo(incidenciaExistente.getId());

        assertThat(response.solicitudEnvioId())
                .isEqualTo(solicitud.getId());

        assertThat(response.codigoSeguimiento())
                .isEqualTo(solicitud.getCodigoSeguimiento());

        assertThat(response.titulo())
                .isEqualTo(incidenciaExistente.getTitulo());

        assertThat(response.descripcion())
                .isEqualTo(incidenciaExistente.getDescripcion());

        assertThat(response.estado())
                .isEqualTo(incidenciaExistente.getEstado());

        assertThat(response.creadaPor().id())
                .isEqualTo(cliente.getId());

        assertThat(response.creadaPor().rol().nombre())
                .isEqualTo("CLIENTE");

        assertThat(response.asignadaA()).isNotNull();

        assertThat(response.asignadaA().id())
                .isEqualTo(operador.getId());

        assertThat(response.asignadaA().rol().nombre())
                .isEqualTo("OPERADOR");

        assertThat(response.fechaCreacion())
                .isEqualTo(incidenciaExistente.getFechaCreacion());

        assertThat(response.fechaActualizacion())
                .isEqualTo(incidenciaExistente.getFechaActualizacion());
    }

    private Incidencia crearIncidencia(
            Long id,
            EstadoIncidencia estado,
            String titulo,
            Usuario asignado
    ) {
        return Incidencia.builder()
                .id(id)
                .solicitudEnvio(solicitud)
                .titulo(titulo)
                .descripcion("Descripción de prueba")
                .estado(estado)
                .creadaPor(cliente)
                .asignadaA(asignado)
                .fechaCreacion(LocalDateTime.now().minusHours(2))
                .fechaActualizacion(LocalDateTime.now().minusHours(1))
                .build();
    }
}