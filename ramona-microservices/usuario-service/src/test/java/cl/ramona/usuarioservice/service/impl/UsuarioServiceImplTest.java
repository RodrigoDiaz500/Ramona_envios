package cl.ramona.usuarioservice.service.impl;

import cl.ramona.usuarioservice.dto.request.UsuarioRequest;
import cl.ramona.usuarioservice.dto.response.UsuarioResponse;
import cl.ramona.usuarioservice.entity.Rol;
import cl.ramona.usuarioservice.entity.Usuario;
import cl.ramona.usuarioservice.repository.RolRepository;
import cl.ramona.usuarioservice.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceImplTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private RolRepository rolRepository;

    private UsuarioServiceImpl service;
    private Rol rolCliente;
    private Usuario usuario;

    @BeforeEach
    void setUp() {
        service = new UsuarioServiceImpl(usuarioRepository, rolRepository);

        rolCliente = Rol.builder()
                .id(1L)
                .nombre("CLIENTE")
                .build();

        usuario = Usuario.builder()
                .id(10L)
                .nombre("Rodrigo")
                .apellido("Diaz")
                .correo("rodrigo@example.com")
                .telefono("912345678")
                .direccion("San Antonio")
                .entraId("entra-123")
                .activo(true)
                .rol(rolCliente)
                .fechaCreacion(LocalDateTime.of(2026, 7, 13, 10, 0))
                .fechaActualizacion(LocalDateTime.of(2026, 7, 13, 10, 30))
                .build();
    }

    @Test
    void listarUsuarios_debeRetornarUsuariosMapeados() {
        when(usuarioRepository.findAll()).thenReturn(List.of(usuario));

        List<UsuarioResponse> resultado = service.listarUsuarios();

        assertEquals(1, resultado.size());
        assertEquals(10L, resultado.getFirst().id());
        assertEquals("rodrigo@example.com", resultado.getFirst().correo());
        assertEquals("CLIENTE", resultado.getFirst().rol().nombre());
        verify(usuarioRepository).findAll();
    }

    @Test
    void crearUsuario_debeGuardarUsuarioActivoConRol() {
        UsuarioRequest request = new UsuarioRequest(
                "Rodrigo",
                "Diaz",
                "rodrigo@example.com",
                "912345678",
                "San Antonio",
                "entra-123",
                1L
        );

        when(usuarioRepository.existsByCorreo(request.correo())).thenReturn(false);
        when(rolRepository.findById(1L)).thenReturn(Optional.of(rolCliente));
        when(usuarioRepository.saveAndFlush(any(Usuario.class)))
        .thenAnswer(invocation -> {
            Usuario guardado = invocation.getArgument(0);
            guardado.setId(10L);
            return guardado;
        });

        UsuarioResponse resultado = service.crearUsuario(request);

        assertEquals(10L, resultado.id());
        assertEquals("Rodrigo", resultado.nombre());
        assertTrue(resultado.activo());
        assertEquals("CLIENTE", resultado.rol().nombre());
        verify(usuarioRepository).saveAndFlush(any(Usuario.class));
    }

    @Test
    void crearUsuario_debeRechazarCorreoDuplicado() {
        UsuarioRequest request = new UsuarioRequest(
                "Rodrigo",
                "Diaz",
                "rodrigo@example.com",
                null,
                null,
                null,
                1L
        );

        when(usuarioRepository.existsByCorreo(request.correo())).thenReturn(true);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.crearUsuario(request)
        );

        assertEquals("Ya existe un usuario con ese correo", exception.getMessage());
        verify(usuarioRepository, never()).saveAndFlush(any());
        verifyNoInteractions(rolRepository);
    }

    @Test
    void cambiarEstadoUsuario_debeDesactivarYGuardarUsuario() {
        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.saveAndFlush(usuario)).thenReturn(usuario);

        UsuarioResponse resultado = service.cambiarEstadoUsuario(10L, false);

        assertFalse(resultado.activo());
        assertFalse(usuario.getActivo());
        verify(usuarioRepository).saveAndFlush(usuario);
    }
}
