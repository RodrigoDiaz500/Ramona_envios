package cl.ramona.authservice.service;

import cl.ramona.authservice.client.UsuarioClient;
import cl.ramona.authservice.dto.*;
import cl.ramona.authservice.exception.UsuarioDeshabilitadoException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AuthServiceTest {
    private UsuarioClient usuarioClient;
    private AuthService service;

    @BeforeEach
    void setUp() {
        usuarioClient = mock(UsuarioClient.class);
        service = new AuthService(usuarioClient);
        ReflectionTestUtils.setField(service, "defaultClientRoleId", 1L);
    }

    @Test
    void devuelveUsuarioExistentePorEntraId() {
        UsuarioResponse usuario = usuario(true, "oid-1");
        when(usuarioClient.buscarPorEntraId("oid-1")).thenReturn(Optional.of(usuario));
        UsuarioResponse result = service.obtenerPerfil(jwt(Map.of(
                "oid", "oid-1", "preferred_username", "a@b.cl", "name", "Ana Pérez")));
        assertEquals(1L, result.id());
        verify(usuarioClient, never()).crear(any());
    }

    @Test
    void vinculaUsuarioExistentePorCorreo() {
        UsuarioResponse sinEntra = usuario(true, null);
        UsuarioResponse actualizado = usuario(true, "oid-2");
        when(usuarioClient.buscarPorEntraId("oid-2")).thenReturn(Optional.empty());
        when(usuarioClient.buscarPorCorreo("a@b.cl")).thenReturn(Optional.of(sinEntra));
        when(usuarioClient.actualizar(eq(1L), any())).thenReturn(actualizado);
        UsuarioResponse result = service.obtenerPerfil(jwt(Map.of(
                "oid", "oid-2", "preferred_username", "a@b.cl", "name", "Ana Pérez")));
        assertEquals("oid-2", result.entraId());
        verify(usuarioClient).actualizar(eq(1L), any());
    }

    @Test
    void creaUsuarioCuandoNoExiste() {
        UsuarioResponse creado = usuario(true, "oid-3");
        when(usuarioClient.buscarPorEntraId("oid-3")).thenReturn(Optional.empty());
        when(usuarioClient.buscarPorCorreo("a@b.cl")).thenReturn(Optional.empty());
        when(usuarioClient.crear(any())).thenReturn(creado);
        UsuarioResponse result = service.obtenerPerfil(jwt(Map.of(
                "oid", "oid-3", "preferred_username", "a@b.cl", "name", "Ana María Pérez")));
        assertEquals("Ana", result.nombre());
        verify(usuarioClient).crear(argThat(r -> r.roleId().equals(1L) && r.apellido().equals("Pérez")));
    }

    @Test
    void rechazaUsuarioDeshabilitado() {
        when(usuarioClient.buscarPorEntraId("oid-4")).thenReturn(Optional.of(usuario(false, "oid-4")));
        assertThrows(UsuarioDeshabilitadoException.class, () -> service.obtenerPerfil(jwt(Map.of(
                "oid", "oid-4", "preferred_username", "a@b.cl"))));
    }

    @Test
    void rechazaTokenSinOid() {
        assertThrows(IllegalArgumentException.class, () -> service.obtenerPerfil(jwt(Map.of(
                "preferred_username", "a@b.cl"))));
    }

    @Test
    void usaEmailComoAlternativa() {
        when(usuarioClient.buscarPorEntraId("oid-5")).thenReturn(Optional.of(usuario(true, "oid-5")));
        UsuarioResponse result = service.obtenerPerfil(jwt(Map.of(
                "oid", "oid-5", "email", "a@b.cl")));
        assertEquals("a@b.cl", result.correo());
    }

    private UsuarioResponse usuario(boolean activo, String entraId) {
        return new UsuarioResponse(1L, "Ana", "Pérez", "a@b.cl", "", "", activo, entraId,
                new RolResponse(1L, "CLIENTE"), LocalDateTime.now(), LocalDateTime.now());
    }

    private Jwt jwt(Map<String, Object> claims) {
        return new Jwt("token", Instant.now(), Instant.now().plusSeconds(600), Map.of("alg", "none"), claims);
    }
}
