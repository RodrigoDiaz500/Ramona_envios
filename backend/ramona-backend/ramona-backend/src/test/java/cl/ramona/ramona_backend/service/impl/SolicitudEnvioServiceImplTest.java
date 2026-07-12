package cl.ramona.ramona_backend.service.impl;

import cl.ramona.ramona_backend.dto.request.CambiarEstadoSolicitudRequest;
import cl.ramona.ramona_backend.dto.request.CrearSolicitudRequest;
import cl.ramona.ramona_backend.dto.response.SolicitudEnvioResponse;
import cl.ramona.ramona_backend.entity.Notificacion;
import cl.ramona.ramona_backend.entity.Rol;
import cl.ramona.ramona_backend.entity.Seguimiento;
import cl.ramona.ramona_backend.entity.SolicitudEnvio;
import cl.ramona.ramona_backend.entity.Sucursal;
import cl.ramona.ramona_backend.entity.Usuario;
import cl.ramona.ramona_backend.enums.EstadoSolicitud;
import cl.ramona.ramona_backend.exception.ResourceNotFoundException;
import cl.ramona.ramona_backend.repository.NotificacionRepository;
import cl.ramona.ramona_backend.repository.SeguimientoRepository;
import cl.ramona.ramona_backend.repository.SolicitudEnvioRepository;
import cl.ramona.ramona_backend.repository.SucursalRepository;
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
class SolicitudEnvioServiceImplTest {

    @Mock
    private SolicitudEnvioRepository solicitudEnvioRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private SucursalRepository sucursalRepository;

    @Mock
    private SeguimientoRepository seguimientoRepository;

    @Mock
    private NotificacionRepository notificacionRepository;

    private SolicitudEnvioServiceImpl service;

    private Rol rolCliente;
    private Rol rolOperador;

    private Usuario cliente;
    private Usuario operador;

    private Sucursal sucursalOrigen;
    private Sucursal sucursalDestino;

    private CrearSolicitudRequest requestValido;

    @BeforeEach
    void setUp() {
        service = new SolicitudEnvioServiceImpl(
                solicitudEnvioRepository,
                usuarioRepository,
                sucursalRepository,
                seguimientoRepository,
                notificacionRepository
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
                .apellido("Diaz")
                .correo("cliente@ramona.cl")
                .telefono("+569 1111 2222")
                .direccion("San Antonio")
                .activo(true)
                .entraId("entra-cliente")
                .rol(rolCliente)
                .fechaCreacion(LocalDateTime.now().minusDays(10))
                .fechaActualizacion(LocalDateTime.now())
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
                .fechaActualizacion(LocalDateTime.now())
                .build();

        sucursalOrigen = Sucursal.builder()
                .id(100L)
                .nombre("Sucursal San Antonio")
                .direccion("Centro 100")
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

        requestValido = new CrearSolicitudRequest(
                10L,
                100L,
                200L,
                "Caja con productos",
                new BigDecimal("2.50"),
                new BigDecimal("45000"),
                "María González",
                "12345678-9",
                "+569 5555 6666"
        );
    }

    @Test
    @DisplayName("Debe crear una solicitud correctamente")
    void debeCrearSolicitudCorrectamente() {
        when(usuarioRepository.findById(10L))
                .thenReturn(Optional.of(cliente));

        when(sucursalRepository.findById(100L))
                .thenReturn(Optional.of(sucursalOrigen));

        when(sucursalRepository.findById(200L))
                .thenReturn(Optional.of(sucursalDestino));

        when(solicitudEnvioRepository.existsByCodigoSeguimiento(anyString()))
                .thenReturn(false);

        when(solicitudEnvioRepository.save(any(SolicitudEnvio.class)))
                .thenAnswer(invocation -> {
                    SolicitudEnvio solicitud = invocation.getArgument(0);
                    solicitud.setId(500L);
                    return solicitud;
                });

        SolicitudEnvioResponse response =
                service.crearSolicitud(requestValido);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(500L);
        assertThat(response.codigoSeguimiento()).isNotBlank();
        assertThat(response.estado())
                .isEqualTo(EstadoSolicitud.PENDIENTE_APROBACION);

        assertThat(response.usuario().id())
                .isEqualTo(cliente.getId());

        assertThat(response.sucursalOrigen().id())
                .isEqualTo(sucursalOrigen.getId());

        assertThat(response.sucursalDestino().id())
                .isEqualTo(sucursalDestino.getId());

        assertThat(response.descripcion())
                .isEqualTo("Caja con productos");

        assertThat(response.peso())
                .isEqualByComparingTo("2.50");

        assertThat(response.valorDeclarado())
                .isEqualByComparingTo("45000");

        assertThat(response.destinatarioNombre())
                .isEqualTo("María González");

        assertThat(response.destinatarioRutDni())
                .isEqualTo("12345678-9");

        assertThat(response.destinatarioTelefono())
                .isEqualTo("+569 5555 6666");

        assertThat(response.fechaCreacion()).isNotNull();
        assertThat(response.fechaAprobacion()).isNull();
        assertThat(response.aprobadoPor()).isNull();

        verify(solicitudEnvioRepository)
                .save(any(SolicitudEnvio.class));

        verify(seguimientoRepository)
                .save(any(Seguimiento.class));

        verify(notificacionRepository)
                .save(any(Notificacion.class));
    }

    @Test
    @DisplayName("Debe crear seguimiento inicial con estado pendiente")
    void debeCrearSeguimientoInicial() {
        prepararCreacionExitosa();

        service.crearSolicitud(requestValido);

        ArgumentCaptor<Seguimiento> captor =
                ArgumentCaptor.forClass(Seguimiento.class);

        verify(seguimientoRepository)
                .save(captor.capture());

        Seguimiento seguimiento = captor.getValue();

        assertThat(seguimiento.getSolicitudEnvio()).isNotNull();
        assertThat(seguimiento.getEstado())
                .isEqualTo(EstadoSolicitud.PENDIENTE_APROBACION);

        assertThat(seguimiento.getDescripcion())
                .isEqualTo("Solicitud creada y pendiente de aprobación");

        assertThat(seguimiento.getUsuario())
                .isEqualTo(cliente);

        assertThat(seguimiento.getFechaEvento())
                .isNotNull();
    }

    @Test
    @DisplayName("Debe crear una notificación cuando se registra la solicitud")
    void debeCrearNotificacionAlRegistrarSolicitud() {
        prepararCreacionExitosa();

        SolicitudEnvioResponse response =
                service.crearSolicitud(requestValido);

        ArgumentCaptor<Notificacion> captor =
                ArgumentCaptor.forClass(Notificacion.class);

        verify(notificacionRepository)
                .save(captor.capture());

        Notificacion notificacion = captor.getValue();

        assertThat(notificacion.getUsuario())
                .isEqualTo(cliente);

        assertThat(notificacion.getTitulo())
                .isEqualTo("Solicitud creada");

        assertThat(notificacion.getMensaje())
                .contains(response.codigoSeguimiento())
                .contains("pendiente de aprobación");

        assertThat(notificacion.getLeida()).isFalse();
        assertThat(notificacion.getFechaCreacion()).isNotNull();
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando el usuario no existe")
    void debeFallarCuandoUsuarioNoExiste() {
        when(usuarioRepository.findById(10L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                service.crearSolicitud(requestValido)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Usuario no encontrado");

        verifyNoInteractions(sucursalRepository);
        verify(solicitudEnvioRepository, never())
                .save(any());
        verify(seguimientoRepository, never())
                .save(any());
        verify(notificacionRepository, never())
                .save(any());
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando la sucursal de origen no existe")
    void debeFallarCuandoSucursalOrigenNoExiste() {
        when(usuarioRepository.findById(10L))
                .thenReturn(Optional.of(cliente));

        when(sucursalRepository.findById(100L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                service.crearSolicitud(requestValido)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Sucursal de origen no encontrada");

        verify(solicitudEnvioRepository, never())
                .save(any());
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando la sucursal de destino no existe")
    void debeFallarCuandoSucursalDestinoNoExiste() {
        when(usuarioRepository.findById(10L))
                .thenReturn(Optional.of(cliente));

        when(sucursalRepository.findById(100L))
                .thenReturn(Optional.of(sucursalOrigen));

        when(sucursalRepository.findById(200L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                service.crearSolicitud(requestValido)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Sucursal de destino no encontrada");

        verify(solicitudEnvioRepository, never())
                .save(any());
    }

    @Test
    @DisplayName("Debe rechazar una sucursal de origen deshabilitada")
    void debeRechazarSucursalOrigenDeshabilitada() {
        sucursalOrigen.setHabilitada(false);

        prepararRepositoriosDeCreacion();

        assertThatThrownBy(() ->
                service.crearSolicitud(requestValido)
        )
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("La sucursal de origen no está habilitada");

        verify(solicitudEnvioRepository, never())
                .save(any());
    }

    @Test
    @DisplayName("Debe rechazar una sucursal de destino deshabilitada")
    void debeRechazarSucursalDestinoDeshabilitada() {
        sucursalDestino.setHabilitada(false);

        prepararRepositoriosDeCreacion();

        assertThatThrownBy(() ->
                service.crearSolicitud(requestValido)
        )
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("La sucursal de destino no está habilitada");

        verify(solicitudEnvioRepository, never())
                .save(any());
    }

    @Test
    @DisplayName("Debe rechazar origen y destino con el mismo ID")
    void debeRechazarSucursalesIguales() {
        Sucursal mismaSucursal = Sucursal.builder()
                .id(100L)
                .nombre("Sucursal repetida")
                .direccion("Dirección")
                .ciudad("San Antonio")
                .telefono("123")
                .habilitada(true)
                .fechaCreacion(LocalDateTime.now())
                .build();

        when(usuarioRepository.findById(10L))
                .thenReturn(Optional.of(cliente));

        when(sucursalRepository.findById(100L))
                .thenReturn(Optional.of(sucursalOrigen));

        when(sucursalRepository.findById(200L))
                .thenReturn(Optional.of(mismaSucursal));

        assertThatThrownBy(() ->
                service.crearSolicitud(requestValido)
        )
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage(
                        "La sucursal de origen y destino no pueden ser la misma"
                );

        verify(solicitudEnvioRepository, never())
                .save(any());
    }

    @Test
    @DisplayName("Debe regenerar el código cuando ya existe")
    void debeRegenerarCodigoDuplicado() {
        prepararRepositoriosDeCreacion();

        when(solicitudEnvioRepository.existsByCodigoSeguimiento(anyString()))
                .thenReturn(true, false);

        when(solicitudEnvioRepository.save(any(SolicitudEnvio.class)))
                .thenAnswer(invocation -> {
                    SolicitudEnvio solicitud = invocation.getArgument(0);
                    solicitud.setId(500L);
                    return solicitud;
                });

        SolicitudEnvioResponse response =
                service.crearSolicitud(requestValido);

        assertThat(response.codigoSeguimiento()).isNotBlank();

        verify(solicitudEnvioRepository, times(2))
                .existsByCodigoSeguimiento(anyString());
    }

    @Test
    @DisplayName("Debe listar todas las solicitudes")
    void debeListarTodasLasSolicitudes() {
        SolicitudEnvio primera =
                crearSolicitudPersistida(501L, "RAM-001");

        SolicitudEnvio segunda =
                crearSolicitudPersistida(502L, "RAM-002");

        when(solicitudEnvioRepository.findAll())
                .thenReturn(List.of(primera, segunda));

        List<SolicitudEnvioResponse> resultado =
                service.listarSolicitudes();

        assertThat(resultado).hasSize(2);
        assertThat(resultado)
                .extracting(SolicitudEnvioResponse::codigoSeguimiento)
                .containsExactly("RAM-001", "RAM-002");

        verify(solicitudEnvioRepository).findAll();
    }

    @Test
    @DisplayName("Debe retornar lista vacía cuando no existen solicitudes")
    void debeRetornarListaVacia() {
        when(solicitudEnvioRepository.findAll())
                .thenReturn(List.of());

        List<SolicitudEnvioResponse> resultado =
                service.listarSolicitudes();

        assertThat(resultado).isEmpty();
    }

    @Test
    @DisplayName("Debe obtener una solicitud por ID")
    void debeObtenerSolicitudPorId() {
        SolicitudEnvio solicitud =
                crearSolicitudPersistida(501L, "RAM-001");

        when(solicitudEnvioRepository.findById(501L))
                .thenReturn(Optional.of(solicitud));

        SolicitudEnvioResponse response =
                service.obtenerPorId(501L);

        assertThat(response.id()).isEqualTo(501L);
        assertThat(response.codigoSeguimiento())
                .isEqualTo("RAM-001");
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando no encuentra solicitud por ID")
    void debeFallarCuandoSolicitudPorIdNoExiste() {
        when(solicitudEnvioRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                service.obtenerPorId(999L)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Solicitud no encontrada");
    }

    @Test
    @DisplayName("Debe obtener una solicitud por código")
    void debeObtenerSolicitudPorCodigo() {
        SolicitudEnvio solicitud =
                crearSolicitudPersistida(501L, "RAM-ABC-001");

        when(solicitudEnvioRepository
                .findByCodigoSeguimiento("RAM-ABC-001"))
                .thenReturn(Optional.of(solicitud));

        SolicitudEnvioResponse response =
                service.obtenerPorCodigo("RAM-ABC-001");

        assertThat(response.id()).isEqualTo(501L);
        assertThat(response.codigoSeguimiento())
                .isEqualTo("RAM-ABC-001");
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando el código no existe")
    void debeFallarCuandoCodigoNoExiste() {
        when(solicitudEnvioRepository
                .findByCodigoSeguimiento("NO-EXISTE"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                service.obtenerPorCodigo("NO-EXISTE")
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Solicitud no encontrada con ese código");
    }

    @Test
    @DisplayName("Debe listar las solicitudes de un usuario")
    void debeListarSolicitudesPorUsuario() {
        SolicitudEnvio solicitud =
                crearSolicitudPersistida(501L, "RAM-USUARIO-001");

        when(solicitudEnvioRepository.findByUsuarioId(10L))
                .thenReturn(List.of(solicitud));

        List<SolicitudEnvioResponse> resultado =
                service.listarPorUsuario(10L);

        assertThat(resultado).hasSize(1);
        assertThat(resultado.getFirst().usuario().id())
                .isEqualTo(10L);

        verify(solicitudEnvioRepository)
                .findByUsuarioId(10L);
    }

    @Test
    @DisplayName("Debe aprobar una solicitud y registrar aprobador")
    void debeAprobarSolicitud() {
        SolicitudEnvio solicitud =
                crearSolicitudPersistida(501L, "RAM-APROBAR");

        CambiarEstadoSolicitudRequest request =
                new CambiarEstadoSolicitudRequest(
                        EstadoSolicitud.APROBADO,
                        20L
                );

        when(solicitudEnvioRepository.findById(501L))
                .thenReturn(Optional.of(solicitud));

        when(usuarioRepository.findById(20L))
                .thenReturn(Optional.of(operador));

        when(solicitudEnvioRepository.save(any(SolicitudEnvio.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        SolicitudEnvioResponse response =
                service.cambiarEstado(501L, request);

        assertThat(response.estado())
                .isEqualTo(EstadoSolicitud.APROBADO);

        assertThat(response.aprobadoPor()).isNotNull();
        assertThat(response.aprobadoPor().id())
                .isEqualTo(20L);

        assertThat(response.fechaAprobacion()).isNotNull();

        assertThat(solicitud.getEstado())
                .isEqualTo(EstadoSolicitud.APROBADO);

        assertThat(solicitud.getAprobadoPor())
                .isEqualTo(operador);
    }

    @Test
    @DisplayName("Debe exigir usuario aprobador al aprobar")
    void debeExigirAprobadorAlAprobar() {
        SolicitudEnvio solicitud =
                crearSolicitudPersistida(501L, "RAM-SIN-APROBADOR");

        CambiarEstadoSolicitudRequest request =
                new CambiarEstadoSolicitudRequest(
                        EstadoSolicitud.APROBADO,
                        null
                );

        when(solicitudEnvioRepository.findById(501L))
                .thenReturn(Optional.of(solicitud));

        assertThatThrownBy(() ->
                service.cambiarEstado(501L, request)
        )
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage(
                        "Debe indicar el usuario que aprueba la solicitud"
                );

        verify(solicitudEnvioRepository, never())
                .save(any());
    }

    @Test
    @DisplayName("Debe fallar cuando el usuario aprobador no existe")
    void debeFallarCuandoAprobadorNoExiste() {
        SolicitudEnvio solicitud =
                crearSolicitudPersistida(501L, "RAM-APROBADOR-INVALIDO");

        CambiarEstadoSolicitudRequest request =
                new CambiarEstadoSolicitudRequest(
                        EstadoSolicitud.APROBADO,
                        999L
                );

        when(solicitudEnvioRepository.findById(501L))
                .thenReturn(Optional.of(solicitud));

        when(usuarioRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                service.cambiarEstado(501L, request)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Usuario aprobador no encontrado");

        verify(solicitudEnvioRepository, never())
                .save(any());
    }

    @Test
    @DisplayName("Debe cambiar estado usando al propietario cuando no hay responsable")
    void debeCambiarEstadoUsandoPropietario() {
        SolicitudEnvio solicitud =
                crearSolicitudPersistida(501L, "RAM-TRANSITO");

        CambiarEstadoSolicitudRequest request =
                new CambiarEstadoSolicitudRequest(
                        EstadoSolicitud.EN_TRANSITO,
                        null
                );

        when(solicitudEnvioRepository.findById(501L))
                .thenReturn(Optional.of(solicitud));

        when(solicitudEnvioRepository.save(any(SolicitudEnvio.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        SolicitudEnvioResponse response =
                service.cambiarEstado(501L, request);

        assertThat(response.estado())
                .isEqualTo(EstadoSolicitud.EN_TRANSITO);

        ArgumentCaptor<Seguimiento> seguimientoCaptor =
                ArgumentCaptor.forClass(Seguimiento.class);

        verify(seguimientoRepository)
                .save(seguimientoCaptor.capture());

        assertThat(seguimientoCaptor.getValue().getUsuario())
                .isEqualTo(cliente);

        assertThat(seguimientoCaptor.getValue().getEstado())
                .isEqualTo(EstadoSolicitud.EN_TRANSITO);
    }

    @Test
    @DisplayName("Debe usar responsable indicado en cambios distintos de aprobado")
    void debeUsarResponsableIndicado() {
        SolicitudEnvio solicitud =
                crearSolicitudPersistida(501L, "RAM-RESPONSABLE");

        CambiarEstadoSolicitudRequest request =
                new CambiarEstadoSolicitudRequest(
                        EstadoSolicitud.EN_PREPARACION,
                        20L
                );

        when(solicitudEnvioRepository.findById(501L))
                .thenReturn(Optional.of(solicitud));

        when(usuarioRepository.findById(20L))
                .thenReturn(Optional.of(operador));

        when(solicitudEnvioRepository.save(any(SolicitudEnvio.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        service.cambiarEstado(501L, request);

        ArgumentCaptor<Seguimiento> captor =
                ArgumentCaptor.forClass(Seguimiento.class);

        verify(seguimientoRepository)
                .save(captor.capture());

        assertThat(captor.getValue().getUsuario())
                .isEqualTo(operador);
    }

    @Test
    @DisplayName("Debe fallar cuando el responsable indicado no existe")
    void debeFallarCuandoResponsableNoExiste() {
        SolicitudEnvio solicitud =
                crearSolicitudPersistida(501L, "RAM-RESP-INVALIDO");

        CambiarEstadoSolicitudRequest request =
                new CambiarEstadoSolicitudRequest(
                        EstadoSolicitud.EN_TRANSITO,
                        999L
                );

        when(solicitudEnvioRepository.findById(501L))
                .thenReturn(Optional.of(solicitud));

        when(usuarioRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                service.cambiarEstado(501L, request)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Usuario responsable no encontrado");

        verify(solicitudEnvioRepository, never())
                .save(any());
    }

    @Test
    @DisplayName("Debe crear notificación al cambiar estado")
    void debeNotificarCambioDeEstado() {
        SolicitudEnvio solicitud =
                crearSolicitudPersistida(501L, "RAM-NOTIFICAR");

        CambiarEstadoSolicitudRequest request =
                new CambiarEstadoSolicitudRequest(
                        EstadoSolicitud.EN_TRANSITO,
                        null
                );

        when(solicitudEnvioRepository.findById(501L))
                .thenReturn(Optional.of(solicitud));

        when(solicitudEnvioRepository.save(any(SolicitudEnvio.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        service.cambiarEstado(501L, request);

        ArgumentCaptor<Notificacion> captor =
                ArgumentCaptor.forClass(Notificacion.class);

        verify(notificacionRepository)
                .save(captor.capture());

        Notificacion notificacion = captor.getValue();

        assertThat(notificacion.getUsuario())
                .isEqualTo(cliente);

        assertThat(notificacion.getTitulo())
                .isEqualTo("Estado actualizado");

        assertThat(notificacion.getMensaje())
                .contains("RAM-NOTIFICAR")
                .contains("EN_TRANSITO");

        assertThat(notificacion.getLeida()).isFalse();
    }

    private void prepararRepositoriosDeCreacion() {
        when(usuarioRepository.findById(10L))
                .thenReturn(Optional.of(cliente));

        when(sucursalRepository.findById(100L))
                .thenReturn(Optional.of(sucursalOrigen));

        when(sucursalRepository.findById(200L))
                .thenReturn(Optional.of(sucursalDestino));
    }

    private void prepararCreacionExitosa() {
        prepararRepositoriosDeCreacion();

        when(solicitudEnvioRepository
                .existsByCodigoSeguimiento(anyString()))
                .thenReturn(false);

        when(solicitudEnvioRepository.save(any(SolicitudEnvio.class)))
                .thenAnswer(invocation -> {
                    SolicitudEnvio solicitud = invocation.getArgument(0);
                    solicitud.setId(500L);
                    return solicitud;
                });
    }

    private SolicitudEnvio crearSolicitudPersistida(
            Long id,
            String codigo
    ) {
        return SolicitudEnvio.builder()
                .id(id)
                .codigoSeguimiento(codigo)
                .usuario(cliente)
                .sucursalOrigen(sucursalOrigen)
                .sucursalDestino(sucursalDestino)
                .descripcion("Caja de prueba")
                .peso(new BigDecimal("2.50"))
                .valorDeclarado(new BigDecimal("45000"))
                .estado(EstadoSolicitud.PENDIENTE_APROBACION)
                .destinatarioNombre("María González")
                .destinatarioRutDni("12345678-9")
                .destinatarioTelefono("+569 5555 6666")
                .fechaCreacion(LocalDateTime.now().minusHours(1))
                .fechaAprobacion(null)
                .aprobadoPor(null)
                .build();
    }
}