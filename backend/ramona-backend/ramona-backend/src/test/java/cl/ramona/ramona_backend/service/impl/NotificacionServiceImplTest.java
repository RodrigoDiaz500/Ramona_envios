package cl.ramona.ramona_backend.service.impl;

import cl.ramona.ramona_backend.dto.request.NotificacionRequest;
import cl.ramona.ramona_backend.dto.response.NotificacionResponse;
import cl.ramona.ramona_backend.entity.Notificacion;
import cl.ramona.ramona_backend.entity.Rol;
import cl.ramona.ramona_backend.entity.Usuario;
import cl.ramona.ramona_backend.exception.ResourceNotFoundException;
import cl.ramona.ramona_backend.repository.NotificacionRepository;
import cl.ramona.ramona_backend.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificacionServiceImplTest {

    @Mock
    private NotificacionRepository notificacionRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    private NotificacionServiceImpl notificacionService;

    private Rol rolCliente;
    private Usuario usuario;
    private Notificacion notificacion;

    @BeforeEach
    void setUp() {
        notificacionService = new NotificacionServiceImpl(
                notificacionRepository,
                usuarioRepository
        );

        rolCliente = Rol.builder()
                .id(1L)
                .nombre("CLIENTE")
                .build();

        usuario = Usuario.builder()
                .id(10L)
                .nombre("Carlos")
                .apellido("Díaz")
                .correo("carlos@correo.cl")
                .telefono("+569 1111 2222")
                .direccion("San Antonio")
                .activo(true)
                .entraId("entra-id-carlos")
                .rol(rolCliente)
                .fechaCreacion(LocalDateTime.now().minusDays(10))
                .fechaActualizacion(LocalDateTime.now().minusDays(1))
                .build();

        notificacion = Notificacion.builder()
                .id(100L)
                .usuario(usuario)
                .titulo("Estado actualizado")
                .mensaje("Tu envío cambió a EN_TRANSITO")
                .leida(false)
                .fechaCreacion(LocalDateTime.now().minusHours(2))
                .build();
    }

    @Test
    @DisplayName("Debe crear una notificación correctamente")
    void debeCrearNotificacionCorrectamente() {
        NotificacionRequest request = new NotificacionRequest(
                10L,
                "Solicitud creada",
                "Tu solicitud fue creada correctamente"
        );

        when(usuarioRepository.findById(10L))
                .thenReturn(Optional.of(usuario));

        when(notificacionRepository.save(any(Notificacion.class)))
                .thenAnswer(invocation -> {
                    Notificacion guardada = invocation.getArgument(0);
                    guardada.setId(101L);
                    return guardada;
                });

        NotificacionResponse response =
                notificacionService.crearNotificacion(request);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(101L);
        assertThat(response.titulo())
                .isEqualTo("Solicitud creada");
        assertThat(response.mensaje())
                .isEqualTo("Tu solicitud fue creada correctamente");
        assertThat(response.leida()).isFalse();
        assertThat(response.fechaCreacion()).isNotNull();

        assertThat(response.usuario().id())
                .isEqualTo(10L);

        assertThat(response.usuario().correo())
                .isEqualTo("carlos@correo.cl");

        assertThat(response.usuario().rol().nombre())
                .isEqualTo("CLIENTE");

        verify(usuarioRepository).findById(10L);
        verify(notificacionRepository)
                .save(any(Notificacion.class));
    }

    @Test
    @DisplayName("Debe crear una notificación con estado no leída")
    void debeCrearNotificacionComoNoLeida() {
        NotificacionRequest request = new NotificacionRequest(
                10L,
                "Nueva notificación",
                "Mensaje de prueba"
        );

        when(usuarioRepository.findById(10L))
                .thenReturn(Optional.of(usuario));

        when(notificacionRepository.save(any(Notificacion.class)))
                .thenAnswer(invocation -> {
                    Notificacion guardada = invocation.getArgument(0);
                    guardada.setId(102L);
                    return guardada;
                });

        notificacionService.crearNotificacion(request);

        ArgumentCaptor<Notificacion> captor =
                ArgumentCaptor.forClass(Notificacion.class);

        verify(notificacionRepository)
                .save(captor.capture());

        Notificacion guardada = captor.getValue();

        assertThat(guardada.getUsuario())
                .isEqualTo(usuario);

        assertThat(guardada.getTitulo())
                .isEqualTo("Nueva notificación");

        assertThat(guardada.getMensaje())
                .isEqualTo("Mensaje de prueba");

        assertThat(guardada.getLeida())
                .isFalse();

        assertThat(guardada.getFechaCreacion())
                .isNotNull();
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando el usuario no existe al crear notificación")
    void debeFallarCuandoUsuarioNoExiste() {
        NotificacionRequest request = new NotificacionRequest(
                999L,
                "Título",
                "Mensaje"
        );

        when(usuarioRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                notificacionService.crearNotificacion(request)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Usuario no encontrado");

        verify(notificacionRepository, never())
                .save(any(Notificacion.class));
    }

    @Test
    @DisplayName("Debe listar notificaciones de un usuario")
    void debeListarNotificacionesPorUsuario() {
        Notificacion segunda = Notificacion.builder()
                .id(101L)
                .usuario(usuario)
                .titulo("Solicitud creada")
                .mensaje("Solicitud registrada")
                .leida(true)
                .fechaCreacion(LocalDateTime.now().minusHours(4))
                .build();

        when(notificacionRepository
                .findByUsuarioIdOrderByFechaCreacionDesc(10L))
                .thenReturn(List.of(
                        notificacion,
                        segunda
                ));

        List<NotificacionResponse> resultado =
                notificacionService.listarPorUsuario(10L);

        assertThat(resultado).hasSize(2);

        assertThat(resultado.get(0).id())
                .isEqualTo(100L);

        assertThat(resultado.get(0).titulo())
                .isEqualTo("Estado actualizado");

        assertThat(resultado.get(1).id())
                .isEqualTo(101L);

        assertThat(resultado.get(1).leida())
                .isTrue();

        verify(notificacionRepository)
                .findByUsuarioIdOrderByFechaCreacionDesc(10L);
    }

    @Test
    @DisplayName("Debe mantener el orden retornado por el repositorio")
    void debeMantenerOrdenDescendente() {
        Notificacion reciente = Notificacion.builder()
                .id(200L)
                .usuario(usuario)
                .titulo("Reciente")
                .mensaje("Primera")
                .leida(false)
                .fechaCreacion(LocalDateTime.now())
                .build();

        Notificacion antigua = Notificacion.builder()
                .id(201L)
                .usuario(usuario)
                .titulo("Antigua")
                .mensaje("Segunda")
                .leida(false)
                .fechaCreacion(LocalDateTime.now().minusDays(1))
                .build();

        when(notificacionRepository
                .findByUsuarioIdOrderByFechaCreacionDesc(10L))
                .thenReturn(List.of(
                        reciente,
                        antigua
                ));

        List<NotificacionResponse> resultado =
                notificacionService.listarPorUsuario(10L);

        assertThat(resultado)
                .extracting(NotificacionResponse::titulo)
                .containsExactly(
                        "Reciente",
                        "Antigua"
                );
    }

    @Test
    @DisplayName("Debe retornar lista vacía cuando el usuario no tiene notificaciones")
    void debeRetornarListaVacia() {
        when(notificacionRepository
                .findByUsuarioIdOrderByFechaCreacionDesc(10L))
                .thenReturn(List.of());

        List<NotificacionResponse> resultado =
                notificacionService.listarPorUsuario(10L);

        assertThat(resultado).isEmpty();

        verify(notificacionRepository)
                .findByUsuarioIdOrderByFechaCreacionDesc(10L);
    }

    @Test
    @DisplayName("Debe marcar una notificación como leída")
    void debeMarcarNotificacionComoLeida() {
        when(notificacionRepository.findById(100L))
                .thenReturn(Optional.of(notificacion));

        when(notificacionRepository.save(any(Notificacion.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        NotificacionResponse response =
                notificacionService.marcarComoLeida(100L);

        assertThat(response.leida()).isTrue();
        assertThat(notificacion.getLeida()).isTrue();

        verify(notificacionRepository)
                .findById(100L);

        verify(notificacionRepository)
                .save(notificacion);
    }

    @Test
    @DisplayName("Debe mantener como leída una notificación ya leída")
    void debeMantenerNotificacionYaLeida() {
        notificacion.setLeida(true);

        when(notificacionRepository.findById(100L))
                .thenReturn(Optional.of(notificacion));

        when(notificacionRepository.save(any(Notificacion.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        NotificacionResponse response =
                notificacionService.marcarComoLeida(100L);

        assertThat(response.leida()).isTrue();

        verify(notificacionRepository)
                .save(notificacion);
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando la notificación no existe")
    void debeFallarCuandoNotificacionNoExiste() {
        when(notificacionRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                notificacionService.marcarComoLeida(999L)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Notificación no encontrada");

        verify(notificacionRepository, never())
                .save(any(Notificacion.class));
    }

    @Test
    @DisplayName("Debe contar notificaciones no leídas")
    void debeContarNotificacionesNoLeidas() {
        when(notificacionRepository
                .countByUsuarioIdAndLeidaFalse(10L))
                .thenReturn(4L);

        long resultado =
                notificacionService.contarNoLeidas(10L);

        assertThat(resultado).isEqualTo(4L);

        verify(notificacionRepository)
                .countByUsuarioIdAndLeidaFalse(10L);
    }

    @Test
    @DisplayName("Debe retornar cero cuando no existen notificaciones no leídas")
    void debeRetornarCeroCuandoNoHayNoLeidas() {
        when(notificacionRepository
                .countByUsuarioIdAndLeidaFalse(10L))
                .thenReturn(0L);

        long resultado =
                notificacionService.contarNoLeidas(10L);

        assertThat(resultado).isZero();
    }

    @Test
    @DisplayName("Debe mapear correctamente todos los campos de la notificación")
    void debeMapearTodosLosCampos() {
        when(notificacionRepository
                .findByUsuarioIdOrderByFechaCreacionDesc(10L))
                .thenReturn(List.of(notificacion));

        NotificacionResponse response =
                notificacionService
                        .listarPorUsuario(10L)
                        .getFirst();

        assertThat(response.id())
                .isEqualTo(notificacion.getId());

        assertThat(response.titulo())
                .isEqualTo(notificacion.getTitulo());

        assertThat(response.mensaje())
                .isEqualTo(notificacion.getMensaje());

        assertThat(response.leida())
                .isEqualTo(notificacion.getLeida());

        assertThat(response.fechaCreacion())
                .isEqualTo(notificacion.getFechaCreacion());

        assertThat(response.usuario().id())
                .isEqualTo(usuario.getId());

        assertThat(response.usuario().nombre())
                .isEqualTo(usuario.getNombre());

        assertThat(response.usuario().apellido())
                .isEqualTo(usuario.getApellido());

        assertThat(response.usuario().correo())
                .isEqualTo(usuario.getCorreo());

        assertThat(response.usuario().telefono())
                .isEqualTo(usuario.getTelefono());

        assertThat(response.usuario().direccion())
                .isEqualTo(usuario.getDireccion());

        assertThat(response.usuario().activo())
                .isEqualTo(usuario.getActivo());

        assertThat(response.usuario().entraId())
                .isEqualTo(usuario.getEntraId());

        assertThat(response.usuario().rol().id())
                .isEqualTo(rolCliente.getId());

        assertThat(response.usuario().rol().nombre())
                .isEqualTo("CLIENTE");
    }
}