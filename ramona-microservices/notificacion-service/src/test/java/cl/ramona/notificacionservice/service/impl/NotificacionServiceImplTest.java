package cl.ramona.notificacionservice.service.impl;

import cl.ramona.notificacionservice.client.UsuarioClient;
import cl.ramona.notificacionservice.dto.request.NotificacionRequest;
import cl.ramona.notificacionservice.dto.response.RolResponse;
import cl.ramona.notificacionservice.dto.response.UsuarioResponse;
import cl.ramona.notificacionservice.entity.Notificacion;
import cl.ramona.notificacionservice.exception.ResourceNotFoundException;
import cl.ramona.notificacionservice.repository.NotificacionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificacionServiceImplTest {

    @Mock
    private NotificacionRepository repository;

    @Mock
    private UsuarioClient usuarioClient;

    private NotificacionServiceImpl service;
    private UsuarioResponse usuario;

    @BeforeEach
    void setUp() {
        service = new NotificacionServiceImpl(repository, usuarioClient);
        usuario = new UsuarioResponse(
                10L, "Rodrigo", "Díaz", "rodrigo@test.cl",
                "999999999", "San Antonio", true, "entra-10",
                new RolResponse(1L, "CLIENTE"),
                LocalDateTime.of(2026, 1, 1, 10, 0),
                LocalDateTime.of(2026, 1, 2, 10, 0)
        );
    }

    @Test
    void crearDebeGuardarNotificacionNoLeidaYRetornarUsuarioCompleto() {
        NotificacionRequest request = new NotificacionRequest(10L, "  Envío creado  ", "  Tu envío fue creado  ");
        when(usuarioClient.obtenerPorId(10L)).thenReturn(usuario);
        when(repository.save(any(Notificacion.class))).thenAnswer(invocation -> {
            Notificacion entity = invocation.getArgument(0);
            entity.setId(1L);
            return entity;
        });

        var response = service.crear(request);

        ArgumentCaptor<Notificacion> captor = ArgumentCaptor.forClass(Notificacion.class);
        verify(repository).save(captor.capture());
        Notificacion saved = captor.getValue();
        assertEquals(10L, saved.getUsuarioId());
        assertEquals("Envío creado", saved.getTitulo());
        assertEquals("Tu envío fue creado", saved.getMensaje());
        assertFalse(saved.getLeida());
        assertNotNull(saved.getFechaCreacion());
        assertEquals(usuario, response.usuario());
    }

    @Test
    void crearDebePropagarErrorCuandoUsuarioNoExiste() {
        when(usuarioClient.obtenerPorId(99L))
                .thenThrow(new ResourceNotFoundException("Usuario no encontrado"));

        ResourceNotFoundException error = assertThrows(
                ResourceNotFoundException.class,
                () -> service.crear(new NotificacionRequest(99L, "Título", "Mensaje"))
        );

        assertEquals("Usuario no encontrado", error.getMessage());
        verify(repository, never()).save(any());
    }

    @Test
    void listarPorUsuarioDebeMapearResultadosConUsuarioCompleto() {
        when(usuarioClient.obtenerPorId(10L)).thenReturn(usuario);
        when(repository.findByUsuarioIdOrderByFechaCreacionDesc(10L)).thenReturn(List.of(
                Notificacion.builder().id(2L).usuarioId(10L).titulo("Dos").mensaje("M2").leida(false)
                        .fechaCreacion(LocalDateTime.of(2026, 7, 13, 10, 0)).build(),
                Notificacion.builder().id(1L).usuarioId(10L).titulo("Uno").mensaje("M1").leida(true)
                        .fechaCreacion(LocalDateTime.of(2026, 7, 13, 9, 0)).build()
        ));

        var result = service.listarPorUsuario(10L);

        assertEquals(2, result.size());
        assertEquals("Dos", result.getFirst().titulo());
        assertEquals(usuario, result.getFirst().usuario());
        verify(usuarioClient).obtenerPorId(10L);
    }

    @Test
    void listarPorUsuarioDebeRetornarListaVacia() {
        when(usuarioClient.obtenerPorId(10L)).thenReturn(usuario);
        when(repository.findByUsuarioIdOrderByFechaCreacionDesc(10L)).thenReturn(List.of());

        var result = service.listarPorUsuario(10L);

        assertTrue(result.isEmpty());
    }

    @Test
    void marcarComoLeidaDebeGuardarInclusoSiYaEstabaLeidaComoEnMonolito() {
        Notificacion entity = Notificacion.builder()
                .id(5L).usuarioId(10L).titulo("Aviso").mensaje("Mensaje")
                .leida(true).fechaCreacion(LocalDateTime.now()).build();
        when(repository.findById(5L)).thenReturn(Optional.of(entity));
        when(repository.save(entity)).thenReturn(entity);
        when(usuarioClient.obtenerPorId(10L)).thenReturn(usuario);

        var result = service.marcarComoLeida(5L);

        assertTrue(result.leida());
        verify(repository).save(entity);
        verify(usuarioClient).obtenerPorId(10L);
    }

    @Test
    void marcarComoLeidaDebeFallarCuandoNoExiste() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        ResourceNotFoundException error = assertThrows(
                ResourceNotFoundException.class,
                () -> service.marcarComoLeida(99L)
        );

        assertEquals("Notificación no encontrada", error.getMessage());
        verify(repository, never()).save(any());
    }

    @Test
    void contarNoLeidasDebeRetornarConteoSinConsultaExterna() {
        when(repository.countByUsuarioIdAndLeidaFalse(10L)).thenReturn(3L);

        long result = service.contarNoLeidas(10L);

        assertEquals(3L, result);
        verify(repository).countByUsuarioIdAndLeidaFalse(10L);
        verifyNoInteractions(usuarioClient);
    }
}
