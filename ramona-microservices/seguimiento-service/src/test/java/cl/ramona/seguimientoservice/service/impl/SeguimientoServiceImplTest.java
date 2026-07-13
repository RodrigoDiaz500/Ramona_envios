package cl.ramona.seguimientoservice.service.impl;

import cl.ramona.seguimientoservice.client.SolicitudClient;
import cl.ramona.seguimientoservice.client.UsuarioClient;
import cl.ramona.seguimientoservice.dto.request.SeguimientoRequest;
import cl.ramona.seguimientoservice.dto.response.*;
import cl.ramona.seguimientoservice.entity.Seguimiento;
import cl.ramona.seguimientoservice.enums.EstadoSolicitud;
import cl.ramona.seguimientoservice.exception.ResourceNotFoundException;
import cl.ramona.seguimientoservice.repository.SeguimientoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.*;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SeguimientoServiceImplTest {
    @Mock SeguimientoRepository repository;
    @Mock SolicitudClient solicitudClient;
    @Mock UsuarioClient usuarioClient;
    private SeguimientoServiceImpl service;
    private final Clock clock = Clock.fixed(Instant.parse("2026-07-13T12:00:00Z"), ZoneOffset.UTC);
    private final UsuarioResponse usuario = new UsuarioResponse(2L,"Ana","Pérez","ana@test.cl",null,null,true,"entra",new RolResponse(2L,"OPERADOR"),null,null);

    @BeforeEach void setUp() { service = new SeguimientoServiceImpl(repository, solicitudClient, usuarioClient, clock); }

    @Test void crearGuardaYRetornaSeguimientoCompleto() {
        when(solicitudClient.obtenerPorId(10L)).thenReturn(new SolicitudResumenResponse(10L,"RAM-001"));
        when(usuarioClient.obtenerPorId(2L)).thenReturn(usuario);
        when(repository.save(any())).thenAnswer(inv -> { Seguimiento s = inv.getArgument(0); s.setId(5L); return s; });
        var r = service.crearSeguimiento(new SeguimientoRequest(10L, EstadoSolicitud.EN_TRANSITO,"En ruta",2L));
        assertAll(() -> assertEquals(5L,r.id()), () -> assertEquals("RAM-001",r.codigoSeguimiento()), () -> assertEquals(usuario,r.usuario()), () -> assertEquals(LocalDateTime.of(2026,7,13,12,0),r.fechaEvento()));
        verify(repository).save(any(Seguimiento.class));
    }

    @Test void crearFallaCuandoSolicitudNoExiste() {
        when(solicitudClient.obtenerPorId(99L)).thenThrow(new ResourceNotFoundException("Solicitud no encontrada"));
        assertThrows(ResourceNotFoundException.class, () -> service.crearSeguimiento(new SeguimientoRequest(99L,EstadoSolicitud.APROBADO,"x",1L)));
        verify(repository,never()).save(any());
    }

    @Test void crearFallaCuandoUsuarioNoExiste() {
        when(solicitudClient.obtenerPorId(10L)).thenReturn(new SolicitudResumenResponse(10L,"RAM-001"));
        when(usuarioClient.obtenerPorId(99L)).thenThrow(new ResourceNotFoundException("Usuario no encontrado"));
        assertThrows(ResourceNotFoundException.class, () -> service.crearSeguimiento(new SeguimientoRequest(10L,EstadoSolicitud.APROBADO,"x",99L)));
        verify(repository,never()).save(any());
    }

    @Test void listarRetornaOrdenDelRepositorio() {
        when(solicitudClient.obtenerPorId(10L)).thenReturn(new SolicitudResumenResponse(10L,"RAM-001"));
        when(usuarioClient.obtenerPorId(anyLong())).thenReturn(usuario);
        var a = Seguimiento.builder().id(1L).solicitudEnvioId(10L).estado(EstadoSolicitud.PENDIENTE_APROBACION).descripcion("Creada").fechaEvento(LocalDateTime.of(2026,7,13,10,0)).usuarioId(1L).build();
        var b = Seguimiento.builder().id(2L).solicitudEnvioId(10L).estado(EstadoSolicitud.APROBADO).descripcion("Aprobada").fechaEvento(LocalDateTime.of(2026,7,13,11,0)).usuarioId(2L).build();
        when(repository.findBySolicitudEnvioIdOrderByFechaEventoAsc(10L)).thenReturn(List.of(a,b));
        var result = service.listarPorSolicitud(10L);
        assertEquals(2,result.size());
        assertEquals(EstadoSolicitud.PENDIENTE_APROBACION,result.get(0).estado());
        assertEquals(EstadoSolicitud.APROBADO,result.get(1).estado());
    }

    @Test void listarVacioEsValido() {
        when(solicitudClient.obtenerPorId(10L)).thenReturn(new SolicitudResumenResponse(10L,"RAM-001"));
        when(repository.findBySolicitudEnvioIdOrderByFechaEventoAsc(10L)).thenReturn(List.of());
        assertTrue(service.listarPorSolicitud(10L).isEmpty());
    }

    @Test void listarFallaCuandoSolicitudNoExiste() {
        when(solicitudClient.obtenerPorId(55L)).thenThrow(new ResourceNotFoundException("Solicitud no encontrada"));
        assertThrows(ResourceNotFoundException.class, () -> service.listarPorSolicitud(55L));
        verify(repository,never()).findBySolicitudEnvioIdOrderByFechaEventoAsc(anyLong());
    }
}
