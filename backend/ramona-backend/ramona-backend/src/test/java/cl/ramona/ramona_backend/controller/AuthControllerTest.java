package cl.ramona.ramona_backend.controller;

import cl.ramona.ramona_backend.dto.response.ApiResponse;
import cl.ramona.ramona_backend.dto.response.UsuarioResponse;
import cl.ramona.ramona_backend.entity.Rol;
import cl.ramona.ramona_backend.entity.Usuario;
import cl.ramona.ramona_backend.repository.RolRepository;
import cl.ramona.ramona_backend.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private RolRepository rolRepository;

    @Mock
    private Jwt jwt;

    private AuthController authController;

    private Rol rolCliente;

    @BeforeEach
    void setUp() {
        authController = new AuthController(
                usuarioRepository,
                rolRepository
        );

        rolCliente = Rol.builder()
                .id(1L)
                .nombre("CLIENTE")
                .build();
    }

    @Test
    @DisplayName("Debe retornar 200 cuando el usuario existe por Entra ID y está activo")
    void debeRetornarUsuarioExistenteActivo() {

        Usuario usuario = crearUsuarioActivo();

        when(jwt.getClaimAsString("oid"))
                .thenReturn("entra-id-123");

        when(jwt.getClaimAsString("preferred_username"))
                .thenReturn("cliente@correo.cl");

        when(jwt.getClaimAsString("name"))
                .thenReturn("Rodrigo Diaz");

        when(usuarioRepository.findByEntraId("entra-id-123"))
                .thenReturn(Optional.of(usuario));

        ResponseEntity<?> response =
                authController.me(jwt);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isInstanceOf(ApiResponse.class);

        ApiResponse<?> apiResponse =
                (ApiResponse<?>) response.getBody();

        assertThat(apiResponse)
                .isNotNull();

        assertThat(apiResponse.success())
                .isTrue();

        assertThat(apiResponse.message())
                .isEqualTo("Usuario autenticado correctamente");

        assertThat(apiResponse.data())
                .isInstanceOf(UsuarioResponse.class);

        UsuarioResponse usuarioResponse =
                (UsuarioResponse) apiResponse.data();

        assertThat(usuarioResponse.id())
                .isEqualTo(3L);

        assertThat(usuarioResponse.correo())
                .isEqualTo("cliente@correo.cl");

        assertThat(usuarioResponse.activo())
                .isTrue();

        assertThat(usuarioResponse.rol().nombre())
                .isEqualTo("CLIENTE");

        verify(usuarioRepository)
                .findByEntraId("entra-id-123");

        verify(usuarioRepository, never())
                .findByCorreo(anyString());

        verify(usuarioRepository, never())
                .save(any(Usuario.class));
    }

    @Test
    @DisplayName("Debe retornar 403 cuando el usuario está deshabilitado")
    void debeRetornarForbiddenCuandoUsuarioEstaDeshabilitado() {

        Usuario usuario = crearUsuarioActivo();
        usuario.setActivo(false);

        when(jwt.getClaimAsString("oid"))
                .thenReturn("entra-id-123");

        when(jwt.getClaimAsString("preferred_username"))
                .thenReturn("cliente@correo.cl");

        when(jwt.getClaimAsString("name"))
                .thenReturn("Rodrigo Diaz");

        when(usuarioRepository.findByEntraId("entra-id-123"))
                .thenReturn(Optional.of(usuario));

        ResponseEntity<?> response =
                authController.me(jwt);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.FORBIDDEN);

        assertThat(response.getBody())
                .isInstanceOf(Map.class);

        @SuppressWarnings("unchecked")
        Map<String, String> body =
                (Map<String, String>) response.getBody();

        assertThat(body)
                .containsEntry(
                        "message",
                        "Tu usuario se encuentra deshabilitado, " +
                                "por lo que no tienes acceso a Ramona Express."
                );

        verify(usuarioRepository)
                .findByEntraId("entra-id-123");

        verify(usuarioRepository, never())
                .save(any(Usuario.class));
    }

    @Test
    @DisplayName("Debe sincronizar el Entra ID cuando encuentra al usuario por correo")
    void debeSincronizarUsuarioExistentePorCorreo() {

        Usuario usuarioExistente = Usuario.builder()
                .id(4L)
                .nombre("Rodrigo")
                .apellido("Diaz")
                .correo("rodrigo@correo.cl")
                .telefono("")
                .direccion("")
                .activo(true)
                .entraId(null)
                .rol(rolCliente)
                .fechaCreacion(LocalDateTime.now().minusDays(5))
                .fechaActualizacion(null)
                .build();

        when(jwt.getClaimAsString("oid"))
                .thenReturn("nuevo-entra-id");

        when(jwt.getClaimAsString("preferred_username"))
                .thenReturn("rodrigo@correo.cl");

        when(jwt.getClaimAsString("name"))
                .thenReturn("Rodrigo Diaz");

        when(usuarioRepository.findByEntraId("nuevo-entra-id"))
                .thenReturn(Optional.empty());

        when(usuarioRepository.findByCorreo("rodrigo@correo.cl"))
                .thenReturn(Optional.of(usuarioExistente));

        when(usuarioRepository.save(any(Usuario.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<?> response =
                authController.me(jwt);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        ArgumentCaptor<Usuario> captor =
                ArgumentCaptor.forClass(Usuario.class);

        verify(usuarioRepository)
                .save(captor.capture());

        Usuario usuarioGuardado =
                captor.getValue();

        assertThat(usuarioGuardado.getEntraId())
                .isEqualTo("nuevo-entra-id");

        assertThat(usuarioGuardado.getFechaActualizacion())
                .isNotNull();

        assertThat(usuarioGuardado.getCorreo())
                .isEqualTo("rodrigo@correo.cl");

        verify(rolRepository, never())
                .findByNombre(anyString());
    }

    @Test
    @DisplayName("Debe crear automáticamente un usuario nuevo con rol CLIENTE")
    void debeCrearNuevoUsuarioConRolCliente() {

        when(jwt.getClaimAsString("oid"))
                .thenReturn("entra-nuevo-001");

        when(jwt.getClaimAsString("preferred_username"))
                .thenReturn("nuevo@correo.cl");

        when(jwt.getClaimAsString("name"))
                .thenReturn("Juan Perez");

        when(usuarioRepository.findByEntraId("entra-nuevo-001"))
                .thenReturn(Optional.empty());

        when(usuarioRepository.findByCorreo("nuevo@correo.cl"))
                .thenReturn(Optional.empty());

        when(rolRepository.findByNombre("CLIENTE"))
                .thenReturn(Optional.of(rolCliente));

        when(usuarioRepository.save(any(Usuario.class)))
                .thenAnswer(invocation -> {
                    Usuario usuario =
                            invocation.getArgument(0);

                    usuario.setId(10L);

                    return usuario;
                });

        ResponseEntity<?> response =
                authController.me(jwt);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        ArgumentCaptor<Usuario> captor =
                ArgumentCaptor.forClass(Usuario.class);

        verify(usuarioRepository)
                .save(captor.capture());

        Usuario usuarioCreado =
                captor.getValue();

        assertThat(usuarioCreado.getId())
                .isEqualTo(10L);

        assertThat(usuarioCreado.getNombre())
                .isEqualTo("Juan");

        assertThat(usuarioCreado.getApellido())
                .isEqualTo("Perez");

        assertThat(usuarioCreado.getCorreo())
                .isEqualTo("nuevo@correo.cl");

        assertThat(usuarioCreado.getEntraId())
                .isEqualTo("entra-nuevo-001");

        assertThat(usuarioCreado.getTelefono())
                .isEmpty();

        assertThat(usuarioCreado.getDireccion())
                .isEmpty();

        assertThat(usuarioCreado.getActivo())
                .isTrue();

        assertThat(usuarioCreado.getRol())
                .isEqualTo(rolCliente);

        assertThat(usuarioCreado.getFechaCreacion())
                .isNotNull();

        assertThat(usuarioCreado.getFechaActualizacion())
                .isNotNull();

        ApiResponse<?> body =
                (ApiResponse<?>) response.getBody();

        assertThat(body)
                .isNotNull();

        UsuarioResponse usuarioResponse =
                (UsuarioResponse) body.data();

        assertThat(usuarioResponse.rol().nombre())
                .isEqualTo("CLIENTE");
    }

    @Test
    @DisplayName("Debe usar valores por defecto cuando el nombre de Microsoft está vacío")
    void debeUsarNombrePorDefectoCuandoNombreMicrosoftEstaVacio() {

        when(jwt.getClaimAsString("oid"))
                .thenReturn("entra-sin-nombre");

        when(jwt.getClaimAsString("preferred_username"))
                .thenReturn("sin-nombre@correo.cl");

        when(jwt.getClaimAsString("name"))
                .thenReturn("");

        when(usuarioRepository.findByEntraId("entra-sin-nombre"))
                .thenReturn(Optional.empty());

        when(usuarioRepository.findByCorreo("sin-nombre@correo.cl"))
                .thenReturn(Optional.empty());

        when(rolRepository.findByNombre("CLIENTE"))
                .thenReturn(Optional.of(rolCliente));

        when(usuarioRepository.save(any(Usuario.class)))
                .thenAnswer(invocation -> {
                    Usuario usuario =
                            invocation.getArgument(0);

                    usuario.setId(20L);

                    return usuario;
                });

        ResponseEntity<?> response =
                authController.me(jwt);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        ArgumentCaptor<Usuario> captor =
                ArgumentCaptor.forClass(Usuario.class);

        verify(usuarioRepository)
                .save(captor.capture());

        Usuario usuarioCreado =
                captor.getValue();

        assertThat(usuarioCreado.getNombre())
                .isEqualTo("Usuario");

        assertThat(usuarioCreado.getApellido())
                .isEqualTo("Microsoft");
    }

    @Test
    @DisplayName("Debe usar Microsoft como apellido cuando el nombre contiene una sola palabra")
    void debeUsarApellidoMicrosoftCuandoNombreTieneUnaPalabra() {

        when(jwt.getClaimAsString("oid"))
                .thenReturn("entra-mononimo");

        when(jwt.getClaimAsString("preferred_username"))
                .thenReturn("usuario@correo.cl");

        when(jwt.getClaimAsString("name"))
                .thenReturn("Rodrigo");

        when(usuarioRepository.findByEntraId("entra-mononimo"))
                .thenReturn(Optional.empty());

        when(usuarioRepository.findByCorreo("usuario@correo.cl"))
                .thenReturn(Optional.empty());

        when(rolRepository.findByNombre("CLIENTE"))
                .thenReturn(Optional.of(rolCliente));

        when(usuarioRepository.save(any(Usuario.class)))
                .thenAnswer(invocation -> {
                    Usuario usuario =
                            invocation.getArgument(0);

                    usuario.setId(21L);

                    return usuario;
                });

        authController.me(jwt);

        ArgumentCaptor<Usuario> captor =
                ArgumentCaptor.forClass(Usuario.class);

        verify(usuarioRepository)
                .save(captor.capture());

        Usuario usuarioCreado =
                captor.getValue();

        assertThat(usuarioCreado.getNombre())
                .isEqualTo("Rodrigo");

        assertThat(usuarioCreado.getApellido())
                .isEqualTo("Microsoft");
    }

    @Test
    @DisplayName("Debe lanzar error 500 cuando no existe el rol CLIENTE")
    void debeLanzarErrorCuandoNoExisteRolCliente() {

        when(jwt.getClaimAsString("oid"))
                .thenReturn("entra-sin-rol");

        when(jwt.getClaimAsString("preferred_username"))
                .thenReturn("usuario@correo.cl");

        when(jwt.getClaimAsString("name"))
                .thenReturn("Usuario Prueba");

        when(usuarioRepository.findByEntraId("entra-sin-rol"))
                .thenReturn(Optional.empty());

        when(usuarioRepository.findByCorreo("usuario@correo.cl"))
                .thenReturn(Optional.empty());

        when(rolRepository.findByNombre("CLIENTE"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> authController.me(jwt))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(exception -> {
                    ResponseStatusException responseException =
                            (ResponseStatusException) exception;

                    assertThat(responseException.getStatusCode())
                            .isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);

                    assertThat(responseException.getReason())
                            .isEqualTo(
                                    "No existe el rol CLIENTE en la base de datos"
                            );
                });

        verify(usuarioRepository, never())
                .save(any(Usuario.class));
    }

    private Usuario crearUsuarioActivo() {
        return Usuario.builder()
                .id(3L)
                .nombre("Rodrigo")
                .apellido("Diaz")
                .correo("cliente@correo.cl")
                .telefono("+569 1234 5678")
                .direccion("San Antonio")
                .activo(true)
                .entraId("entra-id-123")
                .rol(rolCliente)
                .fechaCreacion(LocalDateTime.now().minusDays(10))
                .fechaActualizacion(LocalDateTime.now())
                .build();
    }
}