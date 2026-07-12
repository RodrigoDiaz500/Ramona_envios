package cl.ramona.ramona_backend.service.impl;

import cl.ramona.ramona_backend.dto.request.SeguimientoRequest;
import cl.ramona.ramona_backend.dto.response.SeguimientoResponse;
import cl.ramona.ramona_backend.entity.Rol;
import cl.ramona.ramona_backend.entity.Seguimiento;
import cl.ramona.ramona_backend.entity.SolicitudEnvio;
import cl.ramona.ramona_backend.entity.Sucursal;
import cl.ramona.ramona_backend.entity.Usuario;
import cl.ramona.ramona_backend.enums.EstadoSolicitud;
import cl.ramona.ramona_backend.exception.ResourceNotFoundException;
import cl.ramona.ramona_backend.repository.SeguimientoRepository;
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
class SeguimientoServiceImplTest {

    @Mock
    private SeguimientoRepository seguimientoRepository;

    @Mock
    private SolicitudEnvioRepository solicitudEnvioRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    private SeguimientoServiceImpl seguimientoService;

    private Rol rolOperador;
    private Usuario operador;
    private Usuario cliente;

    private Sucursal sucursalOrigen;
    private Sucursal sucursalDestino;

    private SolicitudEnvio solicitud;

    @BeforeEach
    void setUp() {
        seguimientoService = new SeguimientoServiceImpl(
                seguimientoRepository,
                solicitudEnvioRepository,
                usuarioRepository
        );

        rolOperador = Rol.builder()
                .id(2L)
                .nombre("OPERADOR")
                .build();

        Rol rolCliente = Rol.builder()
                .id(1L)
                .nombre("CLIENTE")
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
                .codigoSeguimiento("RAM-20260710-0001")
                .usuario(cliente)
                .sucursalOrigen(sucursalOrigen)
                .sucursalDestino(sucursalDestino)
                .descripcion("Caja de prueba")
                .peso(new BigDecimal("3.50"))
                .valorDeclarado(new BigDecimal("55000"))
                .estado(EstadoSolicitud.APROBADO)
                .destinatarioNombre("María González")
                .destinatarioRutDni("12345678-9")
                .destinatarioTelefono("+569 5555 6666")
                .fechaCreacion(LocalDateTime.now().minusDays(1))
                .build();
    }

    @Test
    @DisplayName("Debe crear un seguimiento correctamente")
    void debeCrearSeguimientoCorrectamente() {
        SeguimientoRequest request = new SeguimientoRequest(
                500L,
                EstadoSolicitud.EN_PREPARACION,
                "Envío preparado para despacho",
                20L
        );

        when(solicitudEnvioRepository.findById(500L))
                .thenReturn(Optional.of(solicitud));

        when(usuarioRepository.findById(20L))
                .thenReturn(Optional.of(operador));

        when(seguimientoRepository.save(any(Seguimiento.class)))
                .thenAnswer(invocation -> {
                    Seguimiento seguimiento = invocation.getArgument(0);
                    seguimiento.setId(1000L);
                    return seguimiento;
                });

        SeguimientoResponse response =
                seguimientoService.crearSeguimiento(request);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(1000L);
        assertThat(response.solicitudEnvioId()).isEqualTo(500L);
        assertThat(response.codigoSeguimiento())
                .isEqualTo("RAM-20260710-0001");

        assertThat(response.estado())
                .isEqualTo(EstadoSolicitud.EN_PREPARACION);

        assertThat(response.descripcion())
                .isEqualTo("Envío preparado para despacho");

        assertThat(response.fechaEvento()).isNotNull();

        assertThat(response.usuario().id())
                .isEqualTo(20L);

        assertThat(response.usuario().rol().nombre())
                .isEqualTo("OPERADOR");

        verify(solicitudEnvioRepository).findById(500L);
        verify(usuarioRepository).findById(20L);
        verify(seguimientoRepository)
                .save(any(Seguimiento.class));
    }

    @Test
    @DisplayName("Debe guardar correctamente los datos del seguimiento")
    void debeGuardarDatosCorrectamente() {
        SeguimientoRequest request = new SeguimientoRequest(
                500L,
                EstadoSolicitud.EN_TRANSITO,
                "Envío despachado a sucursal de destino",
                20L
        );

        when(solicitudEnvioRepository.findById(500L))
                .thenReturn(Optional.of(solicitud));

        when(usuarioRepository.findById(20L))
                .thenReturn(Optional.of(operador));

        when(seguimientoRepository.save(any(Seguimiento.class)))
                .thenAnswer(invocation -> {
                    Seguimiento seguimiento = invocation.getArgument(0);
                    seguimiento.setId(1001L);
                    return seguimiento;
                });

        seguimientoService.crearSeguimiento(request);

        ArgumentCaptor<Seguimiento> captor =
                ArgumentCaptor.forClass(Seguimiento.class);

        verify(seguimientoRepository)
                .save(captor.capture());

        Seguimiento guardado = captor.getValue();

        assertThat(guardado.getSolicitudEnvio())
                .isEqualTo(solicitud);

        assertThat(guardado.getEstado())
                .isEqualTo(EstadoSolicitud.EN_TRANSITO);

        assertThat(guardado.getDescripcion())
                .isEqualTo("Envío despachado a sucursal de destino");

        assertThat(guardado.getUsuario())
                .isEqualTo(operador);

        assertThat(guardado.getFechaEvento())
                .isNotNull();
    }

    @Test
    @DisplayName("Debe permitir crear seguimiento con descripción nula")
    void debePermitirDescripcionNula() {
        SeguimientoRequest request = new SeguimientoRequest(
                500L,
                EstadoSolicitud.ENTREGADO,
                null,
                20L
        );

        when(solicitudEnvioRepository.findById(500L))
                .thenReturn(Optional.of(solicitud));

        when(usuarioRepository.findById(20L))
                .thenReturn(Optional.of(operador));

        when(seguimientoRepository.save(any(Seguimiento.class)))
                .thenAnswer(invocation -> {
                    Seguimiento seguimiento = invocation.getArgument(0);
                    seguimiento.setId(1002L);
                    return seguimiento;
                });

        SeguimientoResponse response =
                seguimientoService.crearSeguimiento(request);

        assertThat(response.descripcion()).isNull();
        assertThat(response.estado())
                .isEqualTo(EstadoSolicitud.ENTREGADO);
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando la solicitud no existe")
    void debeFallarCuandoSolicitudNoExiste() {
        SeguimientoRequest request = new SeguimientoRequest(
                999L,
                EstadoSolicitud.EN_TRANSITO,
                "Prueba",
                20L
        );

        when(solicitudEnvioRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                seguimientoService.crearSeguimiento(request)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Solicitud no encontrada");

        verifyNoInteractions(usuarioRepository);

        verify(seguimientoRepository, never())
                .save(any(Seguimiento.class));
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando el usuario no existe")
    void debeFallarCuandoUsuarioNoExiste() {
        SeguimientoRequest request = new SeguimientoRequest(
                500L,
                EstadoSolicitud.EN_TRANSITO,
                "Prueba",
                999L
        );

        when(solicitudEnvioRepository.findById(500L))
                .thenReturn(Optional.of(solicitud));

        when(usuarioRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                seguimientoService.crearSeguimiento(request)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Usuario no encontrado");

        verify(seguimientoRepository, never())
                .save(any(Seguimiento.class));
    }

    @Test
    @DisplayName("Debe listar seguimientos de una solicitud en el orden del repositorio")
    void debeListarSeguimientosPorSolicitud() {
        Seguimiento primero = crearSeguimiento(
                1L,
                EstadoSolicitud.PENDIENTE_APROBACION,
                "Solicitud creada",
                LocalDateTime.now().minusHours(5),
                cliente
        );

        Seguimiento segundo = crearSeguimiento(
                2L,
                EstadoSolicitud.APROBADO,
                "Solicitud aprobada",
                LocalDateTime.now().minusHours(4),
                operador
        );

        Seguimiento tercero = crearSeguimiento(
                3L,
                EstadoSolicitud.EN_PREPARACION,
                "Preparando envío",
                LocalDateTime.now().minusHours(3),
                operador
        );

        when(seguimientoRepository
                .findBySolicitudEnvioIdOrderByFechaEventoAsc(500L))
                .thenReturn(List.of(
                        primero,
                        segundo,
                        tercero
                ));

        List<SeguimientoResponse> resultado =
                seguimientoService.listarPorSolicitud(500L);

        assertThat(resultado).hasSize(3);

        assertThat(resultado)
                .extracting(SeguimientoResponse::estado)
                .containsExactly(
                        EstadoSolicitud.PENDIENTE_APROBACION,
                        EstadoSolicitud.APROBADO,
                        EstadoSolicitud.EN_PREPARACION
                );

        assertThat(resultado)
                .extracting(SeguimientoResponse::id)
                .containsExactly(1L, 2L, 3L);

        verify(seguimientoRepository)
                .findBySolicitudEnvioIdOrderByFechaEventoAsc(500L);
    }

    @Test
    @DisplayName("Debe devolver lista vacía cuando no existen seguimientos")
    void debeRetornarListaVacia() {
        when(seguimientoRepository
                .findBySolicitudEnvioIdOrderByFechaEventoAsc(500L))
                .thenReturn(List.of());

        List<SeguimientoResponse> resultado =
                seguimientoService.listarPorSolicitud(500L);

        assertThat(resultado).isEmpty();

        verify(seguimientoRepository)
                .findBySolicitudEnvioIdOrderByFechaEventoAsc(500L);
    }

    @Test
    @DisplayName("Debe mapear correctamente todos los campos del seguimiento")
    void debeMapearTodosLosCampos() {
        LocalDateTime fecha = LocalDateTime.now().minusMinutes(30);

        Seguimiento seguimiento = crearSeguimiento(
                50L,
                EstadoSolicitud.EN_TRANSITO,
                "En ruta hacia Santiago",
                fecha,
                operador
        );

        when(seguimientoRepository
                .findBySolicitudEnvioIdOrderByFechaEventoAsc(500L))
                .thenReturn(List.of(seguimiento));

        SeguimientoResponse response =
                seguimientoService
                        .listarPorSolicitud(500L)
                        .getFirst();

        assertThat(response.id())
                .isEqualTo(50L);

        assertThat(response.solicitudEnvioId())
                .isEqualTo(solicitud.getId());

        assertThat(response.codigoSeguimiento())
                .isEqualTo(solicitud.getCodigoSeguimiento());

        assertThat(response.estado())
                .isEqualTo(EstadoSolicitud.EN_TRANSITO);

        assertThat(response.descripcion())
                .isEqualTo("En ruta hacia Santiago");

        assertThat(response.fechaEvento())
                .isEqualTo(fecha);

        assertThat(response.usuario().id())
                .isEqualTo(operador.getId());

        assertThat(response.usuario().nombre())
                .isEqualTo(operador.getNombre());

        assertThat(response.usuario().apellido())
                .isEqualTo(operador.getApellido());

        assertThat(response.usuario().correo())
                .isEqualTo(operador.getCorreo());

        assertThat(response.usuario().telefono())
                .isEqualTo(operador.getTelefono());

        assertThat(response.usuario().direccion())
                .isEqualTo(operador.getDireccion());

        assertThat(response.usuario().activo())
                .isEqualTo(operador.getActivo());

        assertThat(response.usuario().entraId())
                .isEqualTo(operador.getEntraId());

        assertThat(response.usuario().rol().id())
                .isEqualTo(rolOperador.getId());

        assertThat(response.usuario().rol().nombre())
                .isEqualTo("OPERADOR");

        assertThat(response.usuario().fechaCreacion())
                .isEqualTo(operador.getFechaCreacion());

        assertThat(response.usuario().fechaActualizacion())
                .isEqualTo(operador.getFechaActualizacion());
    }

    @Test
    @DisplayName("Debe consultar el repositorio con el ID de solicitud recibido")
    void debeConsultarRepositorioConIdCorrecto() {
        when(seguimientoRepository
                .findBySolicitudEnvioIdOrderByFechaEventoAsc(777L))
                .thenReturn(List.of());

        seguimientoService.listarPorSolicitud(777L);

        verify(seguimientoRepository)
                .findBySolicitudEnvioIdOrderByFechaEventoAsc(777L);

        verifyNoMoreInteractions(seguimientoRepository);
    }

    private Seguimiento crearSeguimiento(
            Long id,
            EstadoSolicitud estado,
            String descripcion,
            LocalDateTime fecha,
            Usuario usuario
    ) {
        return Seguimiento.builder()
                .id(id)
                .solicitudEnvio(solicitud)
                .estado(estado)
                .descripcion(descripcion)
                .fechaEvento(fecha)
                .usuario(usuario)
                .build();
    }
}