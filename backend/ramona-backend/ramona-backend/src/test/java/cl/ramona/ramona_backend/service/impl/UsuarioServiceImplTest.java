package cl.ramona.ramona_backend.service.impl;

import cl.ramona.ramona_backend.dto.request.UsuarioRequest;
import cl.ramona.ramona_backend.dto.response.UsuarioResponse;
import cl.ramona.ramona_backend.entity.Rol;
import cl.ramona.ramona_backend.entity.Usuario;
import cl.ramona.ramona_backend.exception.ResourceNotFoundException;
import cl.ramona.ramona_backend.repository.RolRepository;
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
class UsuarioServiceImplTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private RolRepository rolRepository;

    private UsuarioServiceImpl usuarioService;

    private Rol rolCliente;
    private Rol rolOperador;
    private Rol rolAdmin;

    private Usuario usuarioExistente;

    @BeforeEach
    void setUp() {
        usuarioService = new UsuarioServiceImpl(
                usuarioRepository,
                rolRepository
        );

        rolCliente = Rol.builder()
                .id(1L)
                .nombre("CLIENTE")
                .build();

        rolOperador = Rol.builder()
                .id(2L)
                .nombre("OPERADOR")
                .build();

        rolAdmin = Rol.builder()
                .id(3L)
                .nombre("ADMIN")
                .build();

        usuarioExistente = Usuario.builder()
                .id(10L)
                .nombre("Rodrigo")
                .apellido("Díaz")
                .correo("rodrigo@correo.cl")
                .telefono("+569 1111 2222")
                .direccion("San Antonio")
                .activo(true)
                .entraId("entra-id-10")
                .rol(rolCliente)
                .fechaCreacion(LocalDateTime.now().minusDays(10))
                .fechaActualizacion(LocalDateTime.now().minusDays(1))
                .build();
    }

    @Test
    @DisplayName("Debe listar todos los usuarios")
    void debeListarTodosLosUsuarios() {
        Usuario segundoUsuario = Usuario.builder()
                .id(20L)
                .nombre("Ana")
                .apellido("Pérez")
                .correo("ana@correo.cl")
                .telefono("+569 3333 4444")
                .direccion("Santiago")
                .activo(true)
                .entraId("entra-id-20")
                .rol(rolOperador)
                .fechaCreacion(LocalDateTime.now().minusDays(5))
                .fechaActualizacion(LocalDateTime.now())
                .build();

        when(usuarioRepository.findAll())
                .thenReturn(List.of(
                        usuarioExistente,
                        segundoUsuario
                ));

        List<UsuarioResponse> resultado =
                usuarioService.listarUsuarios();

        assertThat(resultado).hasSize(2);

        assertThat(resultado)
                .extracting(UsuarioResponse::correo)
                .containsExactly(
                        "rodrigo@correo.cl",
                        "ana@correo.cl"
                );

        assertThat(resultado.get(0).rol().nombre())
                .isEqualTo("CLIENTE");

        assertThat(resultado.get(1).rol().nombre())
                .isEqualTo("OPERADOR");

        verify(usuarioRepository).findAll();
    }

    @Test
    @DisplayName("Debe retornar una lista vacía cuando no existen usuarios")
    void debeRetornarListaVacia() {
        when(usuarioRepository.findAll())
                .thenReturn(List.of());

        List<UsuarioResponse> resultado =
                usuarioService.listarUsuarios();

        assertThat(resultado).isEmpty();

        verify(usuarioRepository).findAll();
    }

    @Test
    @DisplayName("Debe obtener un usuario por ID")
    void debeObtenerUsuarioPorId() {
        when(usuarioRepository.findById(10L))
                .thenReturn(Optional.of(usuarioExistente));

        UsuarioResponse response =
                usuarioService.obtenerUsuarioPorId(10L);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.nombre()).isEqualTo("Rodrigo");
        assertThat(response.apellido()).isEqualTo("Díaz");
        assertThat(response.correo()).isEqualTo("rodrigo@correo.cl");
        assertThat(response.activo()).isTrue();
        assertThat(response.entraId()).isEqualTo("entra-id-10");
        assertThat(response.rol().id()).isEqualTo(1L);
        assertThat(response.rol().nombre()).isEqualTo("CLIENTE");

        verify(usuarioRepository).findById(10L);
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando el usuario no existe")
    void debeFallarCuandoUsuarioNoExiste() {
        when(usuarioRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                usuarioService.obtenerUsuarioPorId(999L)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Usuario no encontrado");

        verify(usuarioRepository).findById(999L);
    }

    @Test
    @DisplayName("Debe crear un usuario correctamente")
    void debeCrearUsuarioCorrectamente() {
        UsuarioRequest request = new UsuarioRequest(
                "Carlos",
                "González",
                "carlos@correo.cl",
                "+569 5555 6666",
                "Valparaíso",
                "entra-carlos",
                1L
        );

        when(usuarioRepository.existsByCorreo("carlos@correo.cl"))
                .thenReturn(false);

        when(rolRepository.findById(1L))
                .thenReturn(Optional.of(rolCliente));

        when(usuarioRepository.save(any(Usuario.class)))
                .thenAnswer(invocation -> {
                    Usuario usuario = invocation.getArgument(0);
                    usuario.setId(30L);
                    usuario.setFechaCreacion(LocalDateTime.now());
                    usuario.setFechaActualizacion(LocalDateTime.now());
                    return usuario;
                });

        UsuarioResponse response =
                usuarioService.crearUsuario(request);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(30L);
        assertThat(response.nombre()).isEqualTo("Carlos");
        assertThat(response.apellido()).isEqualTo("González");
        assertThat(response.correo()).isEqualTo("carlos@correo.cl");
        assertThat(response.telefono()).isEqualTo("+569 5555 6666");
        assertThat(response.direccion()).isEqualTo("Valparaíso");
        assertThat(response.entraId()).isEqualTo("entra-carlos");
        assertThat(response.activo()).isTrue();
        assertThat(response.rol().nombre()).isEqualTo("CLIENTE");

        ArgumentCaptor<Usuario> captor =
                ArgumentCaptor.forClass(Usuario.class);

        verify(usuarioRepository)
                .save(captor.capture());

        Usuario usuarioGuardado = captor.getValue();

        assertThat(usuarioGuardado.getActivo()).isTrue();
        assertThat(usuarioGuardado.getRol()).isEqualTo(rolCliente);

        verify(usuarioRepository)
                .existsByCorreo("carlos@correo.cl");

        verify(rolRepository)
                .findById(1L);
    }

    @Test
    @DisplayName("Debe rechazar la creación cuando el correo ya existe")
    void debeRechazarCorreoDuplicadoAlCrear() {
        UsuarioRequest request = new UsuarioRequest(
                "Rodrigo",
                "Díaz",
                "rodrigo@correo.cl",
                "+569 1111 2222",
                "San Antonio",
                "entra-id-10",
                1L
        );

        when(usuarioRepository.existsByCorreo("rodrigo@correo.cl"))
                .thenReturn(true);

        assertThatThrownBy(() ->
                usuarioService.crearUsuario(request)
        )
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Ya existe un usuario con ese correo");

        verify(usuarioRepository)
                .existsByCorreo("rodrigo@correo.cl");

        verifyNoInteractions(rolRepository);

        verify(usuarioRepository, never())
                .save(any(Usuario.class));
    }

    @Test
    @DisplayName("Debe lanzar excepción al crear cuando el rol no existe")
    void debeFallarAlCrearCuandoRolNoExiste() {
        UsuarioRequest request = new UsuarioRequest(
                "Carlos",
                "González",
                "carlos@correo.cl",
                "+569 5555 6666",
                "Valparaíso",
                "entra-carlos",
                999L
        );

        when(usuarioRepository.existsByCorreo("carlos@correo.cl"))
                .thenReturn(false);

        when(rolRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                usuarioService.crearUsuario(request)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Rol no encontrado");

        verify(usuarioRepository, never())
                .save(any(Usuario.class));
    }

    @Test
    @DisplayName("Debe actualizar todos los datos de un usuario")
    void debeActualizarUsuarioCorrectamente() {
        UsuarioRequest request = new UsuarioRequest(
                "Rodrigo Andrés",
                "Díaz Vallejos",
                "nuevo@correo.cl",
                "+569 7777 8888",
                "Cartagena",
                "nuevo-entra-id",
                2L
        );

        when(usuarioRepository.findById(10L))
                .thenReturn(Optional.of(usuarioExistente));

        when(rolRepository.findById(2L))
                .thenReturn(Optional.of(rolOperador));

        when(usuarioRepository.save(any(Usuario.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        UsuarioResponse response =
                usuarioService.actualizarUsuario(
                        10L,
                        request
                );

        assertThat(response.nombre())
                .isEqualTo("Rodrigo Andrés");

        assertThat(response.apellido())
                .isEqualTo("Díaz Vallejos");

        assertThat(response.correo())
                .isEqualTo("nuevo@correo.cl");

        assertThat(response.telefono())
                .isEqualTo("+569 7777 8888");

        assertThat(response.direccion())
                .isEqualTo("Cartagena");

        assertThat(response.entraId())
                .isEqualTo("nuevo-entra-id");

        assertThat(response.rol().nombre())
                .isEqualTo("OPERADOR");

        assertThat(response.activo()).isTrue();

        verify(usuarioRepository)
                .save(usuarioExistente);
    }

    @Test
    @DisplayName("Debe lanzar excepción al actualizar un usuario inexistente")
    void debeFallarAlActualizarUsuarioInexistente() {
        UsuarioRequest request = new UsuarioRequest(
                "Nombre",
                "Apellido",
                "correo@correo.cl",
                null,
                null,
                null,
                1L
        );

        when(usuarioRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                usuarioService.actualizarUsuario(
                        999L,
                        request
                )
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Usuario no encontrado");

        verifyNoInteractions(rolRepository);

        verify(usuarioRepository, never())
                .save(any(Usuario.class));
    }

    @Test
    @DisplayName("Debe lanzar excepción al actualizar cuando el rol no existe")
    void debeFallarAlActualizarCuandoRolNoExiste() {
        UsuarioRequest request = new UsuarioRequest(
                "Rodrigo",
                "Díaz",
                "rodrigo@correo.cl",
                "+569 1111 2222",
                "San Antonio",
                "entra-id-10",
                999L
        );

        when(usuarioRepository.findById(10L))
                .thenReturn(Optional.of(usuarioExistente));

        when(rolRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                usuarioService.actualizarUsuario(
                        10L,
                        request
                )
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Rol no encontrado");

        verify(usuarioRepository, never())
                .save(any(Usuario.class));
    }

    @Test
    @DisplayName("Debe cambiar el rol de un usuario")
    void debeCambiarRolUsuario() {
        when(usuarioRepository.findById(10L))
                .thenReturn(Optional.of(usuarioExistente));

        when(rolRepository.findById(3L))
                .thenReturn(Optional.of(rolAdmin));

        when(usuarioRepository.save(any(Usuario.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        UsuarioResponse response =
                usuarioService.cambiarRolUsuario(
                        10L,
                        3L
                );

        assertThat(response.rol().id()).isEqualTo(3L);
        assertThat(response.rol().nombre()).isEqualTo("ADMIN");

        assertThat(usuarioExistente.getRol())
                .isEqualTo(rolAdmin);

        verify(usuarioRepository)
                .save(usuarioExistente);
    }

    @Test
    @DisplayName("Debe lanzar excepción al cambiar a un rol inexistente")
    void debeFallarAlCambiarRolInexistente() {
        when(usuarioRepository.findById(10L))
                .thenReturn(Optional.of(usuarioExistente));

        when(rolRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                usuarioService.cambiarRolUsuario(
                        10L,
                        999L
                )
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Rol no encontrado");

        verify(usuarioRepository, never())
                .save(any(Usuario.class));
    }

    @Test
    @DisplayName("Debe lanzar excepción al cambiar rol de usuario inexistente")
    void debeFallarAlCambiarRolDeUsuarioInexistente() {
        when(usuarioRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                usuarioService.cambiarRolUsuario(
                        999L,
                        3L
                )
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Usuario no encontrado");

        verifyNoInteractions(rolRepository);

        verify(usuarioRepository, never())
                .save(any(Usuario.class));
    }

    @Test
    @DisplayName("Debe deshabilitar un usuario")
    void debeDeshabilitarUsuario() {
        when(usuarioRepository.findById(10L))
                .thenReturn(Optional.of(usuarioExistente));

        when(usuarioRepository.save(any(Usuario.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        UsuarioResponse response =
                usuarioService.cambiarEstadoUsuario(
                        10L,
                        false
                );

        assertThat(response.activo()).isFalse();
        assertThat(usuarioExistente.getActivo()).isFalse();

        verify(usuarioRepository)
                .save(usuarioExistente);
    }

    @Test
    @DisplayName("Debe habilitar un usuario")
    void debeHabilitarUsuario() {
        usuarioExistente.setActivo(false);

        when(usuarioRepository.findById(10L))
                .thenReturn(Optional.of(usuarioExistente));

        when(usuarioRepository.save(any(Usuario.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        UsuarioResponse response =
                usuarioService.cambiarEstadoUsuario(
                        10L,
                        true
                );

        assertThat(response.activo()).isTrue();
        assertThat(usuarioExistente.getActivo()).isTrue();

        verify(usuarioRepository)
                .save(usuarioExistente);
    }

    @Test
    @DisplayName("Debe lanzar excepción al cambiar estado de usuario inexistente")
    void debeFallarAlCambiarEstadoUsuarioInexistente() {
        when(usuarioRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                usuarioService.cambiarEstadoUsuario(
                        999L,
                        false
                )
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Usuario no encontrado");

        verify(usuarioRepository, never())
                .save(any(Usuario.class));
    }

    @Test
    @DisplayName("Debe eliminar un usuario existente")
    void debeEliminarUsuario() {
        when(usuarioRepository.findById(10L))
                .thenReturn(Optional.of(usuarioExistente));

        usuarioService.eliminarUsuario(10L);

        verify(usuarioRepository)
                .delete(usuarioExistente);

        verify(usuarioRepository)
                .findById(10L);
    }

    @Test
    @DisplayName("Debe lanzar excepción al eliminar un usuario inexistente")
    void debeFallarAlEliminarUsuarioInexistente() {
        when(usuarioRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                usuarioService.eliminarUsuario(999L)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Usuario no encontrado");

        verify(usuarioRepository, never())
                .delete(any(Usuario.class));
    }

    @Test
    @DisplayName("Debe mapear correctamente todos los campos del usuario")
    void debeMapearCorrectamenteUsuarioResponse() {
        when(usuarioRepository.findById(10L))
                .thenReturn(Optional.of(usuarioExistente));

        UsuarioResponse response =
                usuarioService.obtenerUsuarioPorId(10L);

        assertThat(response.id())
                .isEqualTo(usuarioExistente.getId());

        assertThat(response.nombre())
                .isEqualTo(usuarioExistente.getNombre());

        assertThat(response.apellido())
                .isEqualTo(usuarioExistente.getApellido());

        assertThat(response.correo())
                .isEqualTo(usuarioExistente.getCorreo());

        assertThat(response.telefono())
                .isEqualTo(usuarioExistente.getTelefono());

        assertThat(response.direccion())
                .isEqualTo(usuarioExistente.getDireccion());

        assertThat(response.activo())
                .isEqualTo(usuarioExistente.getActivo());

        assertThat(response.entraId())
                .isEqualTo(usuarioExistente.getEntraId());

        assertThat(response.rol().id())
                .isEqualTo(usuarioExistente.getRol().getId());

        assertThat(response.rol().nombre())
                .isEqualTo(usuarioExistente.getRol().getNombre());

        assertThat(response.fechaCreacion())
                .isEqualTo(usuarioExistente.getFechaCreacion());

        assertThat(response.fechaActualizacion())
                .isEqualTo(usuarioExistente.getFechaActualizacion());
    }
}