package cl.ramona.resenaservice.service.impl;

import cl.ramona.resenaservice.client.SolicitudClient;
import cl.ramona.resenaservice.client.UsuarioClient;
import cl.ramona.resenaservice.dto.request.ResenaRequest;
import cl.ramona.resenaservice.dto.response.SolicitudResumen;
import cl.ramona.resenaservice.dto.response.UsuarioResumen;
import cl.ramona.resenaservice.dto.response.RolResponse;
import cl.ramona.resenaservice.entity.Resena;
import cl.ramona.resenaservice.exception.ResourceNotFoundException;
import cl.ramona.resenaservice.repository.ResenaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResenaServiceImplTest {
    @Mock ResenaRepository repository;
    @Mock SolicitudClient solicitudClient;
    @Mock UsuarioClient usuarioClient;

    private ResenaServiceImpl service;
    private final Clock clock = Clock.fixed(Instant.parse("2026-07-13T12:00:00Z"), ZoneOffset.UTC);
    private final SolicitudResumen solicitud = new SolicitudResumen(100L, "RAM-000100", "ENTREGADO");
    private final UsuarioResumen usuario = new UsuarioResumen(10L, "Rodrigo", "Díaz", "r@test.cl", null, null, true, null, new RolResponse(1L, "CLIENTE"), null, null);

    @BeforeEach
    void setUp() {
        service = new ResenaServiceImpl(repository, solicitudClient, usuarioClient, clock);
    }

    @Test
    void crearGuardaYRetornaResena() {
        ResenaRequest request = new ResenaRequest(100L, 10L, 5, "Excelente");
        when(repository.existsBySolicitudEnvioId(100L)).thenReturn(false);
        when(solicitudClient.obtenerPorId(100L)).thenReturn(solicitud);
        when(usuarioClient.obtenerPorId(10L)).thenReturn(usuario);
        when(repository.save(any(Resena.class))).thenAnswer(invocation -> {
            Resena value = invocation.getArgument(0);
            value.setId(1L);
            return value;
        });

        var response = service.crear(request);

        assertEquals(1L, response.id());
        assertEquals("RAM-000100", response.codigoSeguimiento());
        assertEquals("Rodrigo", response.usuario().nombre());
        assertEquals("Díaz", response.usuario().apellido());
        assertEquals(5, response.calificacion());
        ArgumentCaptor<Resena> captor = ArgumentCaptor.forClass(Resena.class);
        verify(repository).save(captor.capture());
        assertEquals(LocalDateTime.of(2026, 7, 13, 12, 0), captor.getValue().getFechaCreacion());
    }

    @Test
    void crearRechazaSolicitudDuplicada() {
        when(repository.existsBySolicitudEnvioId(100L)).thenReturn(true);
        var ex = assertThrows(IllegalArgumentException.class,
                () -> service.crear(new ResenaRequest(100L, 10L, 5, "OK")));
        assertEquals("Esta solicitud ya tiene una reseña", ex.getMessage());
        verifyNoInteractions(solicitudClient, usuarioClient);
        verify(repository, never()).save(any());
    }

    @Test
    void crearRechazaEnvioNoEntregado() {
        when(repository.existsBySolicitudEnvioId(100L)).thenReturn(false);
        when(solicitudClient.obtenerPorId(100L))
                .thenReturn(new SolicitudResumen(100L, "RAM-000100", "EN_TRANSITO"));

        var ex = assertThrows(IllegalArgumentException.class,
                () -> service.crear(new ResenaRequest(100L, 10L, 4, "Bien")));

        assertEquals("Solo se pueden reseñar envíos entregados", ex.getMessage());
        verifyNoInteractions(usuarioClient);
        verify(repository, never()).save(any());
    }

    @Test
    void listarPorUsuarioValidaUsuarioYMapeaResultados() {
        Resena entity = Resena.builder().id(1L).solicitudEnvioId(100L).usuarioId(10L)
                .calificacion(4).comentario("Bien").fechaCreacion(LocalDateTime.now(clock)).build();
        when(usuarioClient.obtenerPorId(10L)).thenReturn(usuario);
        when(repository.findByUsuarioIdOrderByFechaCreacionDesc(10L)).thenReturn(List.of(entity));
        when(solicitudClient.obtenerPorId(100L)).thenReturn(solicitud);

        var result = service.listarPorUsuario(10L);

        assertEquals(1, result.size());
        assertEquals("RAM-000100", result.getFirst().codigoSeguimiento());
        verify(usuarioClient, times(2)).obtenerPorId(10L);
    }

    @Test
    void obtenerPorSolicitudLanzaNotFound() {
        when(repository.findBySolicitudEnvioId(999L)).thenReturn(Optional.empty());

        var ex = assertThrows(ResourceNotFoundException.class,
                () -> service.obtenerPorSolicitud(999L));

        assertEquals("Reseña no encontrada para esta solicitud", ex.getMessage());
    }

    @Test
    void promedioRetornaValorDelRepositorio() {
        when(repository.promedioCalificacion()).thenReturn(new BigDecimal("4.25"));
        assertEquals(new BigDecimal("4.25"), service.promedioCalificacion());
    }
}
