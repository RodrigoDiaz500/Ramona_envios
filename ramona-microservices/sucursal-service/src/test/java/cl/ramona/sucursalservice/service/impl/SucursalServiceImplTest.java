package cl.ramona.sucursalservice.service.impl;

import cl.ramona.sucursalservice.dto.request.SucursalRequest;
import cl.ramona.sucursalservice.dto.response.SucursalResponse;
import cl.ramona.sucursalservice.entity.Sucursal;
import cl.ramona.sucursalservice.exception.ResourceNotFoundException;
import cl.ramona.sucursalservice.repository.SucursalRepository;
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
class SucursalServiceImplTest {

    @Mock
    private SucursalRepository sucursalRepository;

    private SucursalServiceImpl service;
    private Sucursal sucursal;

    @BeforeEach
    void setUp() {
        service = new SucursalServiceImpl(sucursalRepository);

        sucursal = Sucursal.builder()
                .id(5L)
                .nombre("Sucursal Centro")
                .direccion("Av. Principal 123")
                .ciudad("San Antonio")
                .telefono("352123456")
                .habilitada(true)
                .fechaCreacion(LocalDateTime.of(2026, 7, 13, 9, 0))
                .build();
    }

    @Test
    void listarSucursales_debeRetornarSucursalesMapeadas() {
        when(sucursalRepository.findAll()).thenReturn(List.of(sucursal));

        List<SucursalResponse> resultado = service.listarSucursales();

        assertEquals(1, resultado.size());
        assertEquals(5L, resultado.getFirst().id());
        assertEquals("Sucursal Centro", resultado.getFirst().nombre());
        assertTrue(resultado.getFirst().habilitada());
        verify(sucursalRepository).findAll();
    }

    @Test
    void crearSucursal_debeGuardarSucursalHabilitada() {
        SucursalRequest request = new SucursalRequest(
                "Sucursal Puerto",
                "Puerto 456",
                "San Antonio",
                "352999999"
        );

        when(sucursalRepository.save(any(Sucursal.class))).thenAnswer(invocation -> {
            Sucursal guardada = invocation.getArgument(0);
            guardada.setId(6L);
            return guardada;
        });

        SucursalResponse resultado = service.crearSucursal(request);

        assertEquals(6L, resultado.id());
        assertEquals("Sucursal Puerto", resultado.nombre());
        assertTrue(resultado.habilitada());
        verify(sucursalRepository).save(any(Sucursal.class));
    }

    @Test
    void actualizarSucursal_debeLanzarExcepcionCuandoNoExiste() {
        SucursalRequest request = new SucursalRequest(
                "Sucursal Nueva",
                "Calle 100",
                "Cartagena",
                null
        );

        when(sucursalRepository.findById(99L)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> service.actualizarSucursal(99L, request)
        );

        assertEquals("Sucursal no encontrada", exception.getMessage());
        verify(sucursalRepository, never()).save(any());
    }

    @Test
    void cambiarEstadoSucursal_debeDeshabilitarYGuardarSucursal() {
        when(sucursalRepository.findById(5L)).thenReturn(Optional.of(sucursal));
        when(sucursalRepository.save(sucursal)).thenReturn(sucursal);

        SucursalResponse resultado = service.cambiarEstadoSucursal(5L, false);

        assertFalse(resultado.habilitada());
        assertFalse(sucursal.getHabilitada());
        verify(sucursalRepository).save(sucursal);
    }
}
