package cl.ramona.ramona_backend.service.impl;

import cl.ramona.ramona_backend.dto.request.SucursalRequest;
import cl.ramona.ramona_backend.dto.response.SucursalResponse;
import cl.ramona.ramona_backend.entity.Sucursal;
import cl.ramona.ramona_backend.exception.ResourceNotFoundException;
import cl.ramona.ramona_backend.repository.SucursalRepository;
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
class SucursalServiceImplTest {

    @Mock
    private SucursalRepository sucursalRepository;

    private SucursalServiceImpl sucursalService;

    private Sucursal sucursalExistente;

    @BeforeEach
    void setUp() {
        sucursalService = new SucursalServiceImpl(sucursalRepository);

        sucursalExistente = Sucursal.builder()
                .id(1L)
                .nombre("Sucursal San Antonio")
                .direccion("Barros Luco 123")
                .ciudad("San Antonio")
                .telefono("+5635 2223344")
                .habilitada(true)
                .fechaCreacion(LocalDateTime.now().minusDays(10))
                .build();
    }

    @Test
    @DisplayName("Debe listar todas las sucursales")
    void debeListarTodasLasSucursales() {
        Sucursal segundaSucursal = Sucursal.builder()
                .id(2L)
                .nombre("Sucursal Santiago")
                .direccion("Alameda 500")
                .ciudad("Santiago")
                .telefono("+562 22334455")
                .habilitada(true)
                .fechaCreacion(LocalDateTime.now().minusDays(5))
                .build();

        when(sucursalRepository.findAll())
                .thenReturn(List.of(
                        sucursalExistente,
                        segundaSucursal
                ));

        List<SucursalResponse> resultado =
                sucursalService.listarSucursales();

        assertThat(resultado).hasSize(2);

        assertThat(resultado)
                .extracting(SucursalResponse::nombre)
                .containsExactly(
                        "Sucursal San Antonio",
                        "Sucursal Santiago"
                );

        assertThat(resultado.get(0).habilitada())
                .isTrue();

        assertThat(resultado.get(1).ciudad())
                .isEqualTo("Santiago");

        verify(sucursalRepository).findAll();
    }

    @Test
    @DisplayName("Debe devolver una lista vacía cuando no existen sucursales")
    void debeRetornarListaVacia() {
        when(sucursalRepository.findAll())
                .thenReturn(List.of());

        List<SucursalResponse> resultado =
                sucursalService.listarSucursales();

        assertThat(resultado).isEmpty();

        verify(sucursalRepository).findAll();
    }

    @Test
    @DisplayName("Debe obtener una sucursal por ID")
    void debeObtenerSucursalPorId() {
        when(sucursalRepository.findById(1L))
                .thenReturn(Optional.of(sucursalExistente));

        SucursalResponse response =
                sucursalService.obtenerSucursalPorId(1L);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.nombre())
                .isEqualTo("Sucursal San Antonio");
        assertThat(response.direccion())
                .isEqualTo("Barros Luco 123");
        assertThat(response.ciudad())
                .isEqualTo("San Antonio");
        assertThat(response.telefono())
                .isEqualTo("+5635 2223344");
        assertThat(response.habilitada()).isTrue();
        assertThat(response.fechaCreacion())
                .isEqualTo(sucursalExistente.getFechaCreacion());

        verify(sucursalRepository).findById(1L);
    }

    @Test
    @DisplayName("Debe lanzar excepción al buscar una sucursal inexistente")
    void debeFallarAlObtenerSucursalInexistente() {
        when(sucursalRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                sucursalService.obtenerSucursalPorId(999L)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Sucursal no encontrada");

        verify(sucursalRepository).findById(999L);
    }

    @Test
    @DisplayName("Debe crear una sucursal habilitada por defecto")
    void debeCrearSucursalCorrectamente() {
        SucursalRequest request = new SucursalRequest(
                "Sucursal Cartagena",
                "Avenida Cartagena 100",
                "Cartagena",
                "+5635 2456789"
        );

        when(sucursalRepository.save(any(Sucursal.class)))
                .thenAnswer(invocation -> {
                    Sucursal sucursal = invocation.getArgument(0);
                    sucursal.setId(3L);
                    sucursal.setFechaCreacion(LocalDateTime.now());
                    return sucursal;
                });

        SucursalResponse response =
                sucursalService.crearSucursal(request);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(3L);
        assertThat(response.nombre())
                .isEqualTo("Sucursal Cartagena");
        assertThat(response.direccion())
                .isEqualTo("Avenida Cartagena 100");
        assertThat(response.ciudad())
                .isEqualTo("Cartagena");
        assertThat(response.telefono())
                .isEqualTo("+5635 2456789");
        assertThat(response.habilitada()).isTrue();

        ArgumentCaptor<Sucursal> captor =
                ArgumentCaptor.forClass(Sucursal.class);

        verify(sucursalRepository)
                .save(captor.capture());

        Sucursal guardada = captor.getValue();

        assertThat(guardada.getNombre())
                .isEqualTo(request.nombre());

        assertThat(guardada.getDireccion())
                .isEqualTo(request.direccion());

        assertThat(guardada.getCiudad())
                .isEqualTo(request.ciudad());

        assertThat(guardada.getTelefono())
                .isEqualTo(request.telefono());

        assertThat(guardada.getHabilitada())
                .isTrue();
    }

    @Test
    @DisplayName("Debe permitir crear una sucursal sin teléfono")
    void debeCrearSucursalSinTelefono() {
        SucursalRequest request = new SucursalRequest(
                "Sucursal El Quisco",
                "Avenida Isidoro Dubournais 200",
                "El Quisco",
                null
        );

        when(sucursalRepository.save(any(Sucursal.class)))
                .thenAnswer(invocation -> {
                    Sucursal sucursal = invocation.getArgument(0);
                    sucursal.setId(4L);
                    return sucursal;
                });

        SucursalResponse response =
                sucursalService.crearSucursal(request);

        assertThat(response.id()).isEqualTo(4L);
        assertThat(response.telefono()).isNull();
        assertThat(response.habilitada()).isTrue();
    }

    @Test
    @DisplayName("Debe actualizar los datos de una sucursal")
    void debeActualizarSucursalCorrectamente() {
        SucursalRequest request = new SucursalRequest(
                "Sucursal San Antonio Centro",
                "Centenario 450",
                "San Antonio",
                "+5635 2998877"
        );

        when(sucursalRepository.findById(1L))
                .thenReturn(Optional.of(sucursalExistente));

        when(sucursalRepository.save(any(Sucursal.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        SucursalResponse response =
                sucursalService.actualizarSucursal(
                        1L,
                        request
                );

        assertThat(response.nombre())
                .isEqualTo("Sucursal San Antonio Centro");

        assertThat(response.direccion())
                .isEqualTo("Centenario 450");

        assertThat(response.ciudad())
                .isEqualTo("San Antonio");

        assertThat(response.telefono())
                .isEqualTo("+5635 2998877");

        assertThat(response.habilitada())
                .isTrue();

        assertThat(sucursalExistente.getNombre())
                .isEqualTo(request.nombre());

        assertThat(sucursalExistente.getDireccion())
                .isEqualTo(request.direccion());

        verify(sucursalRepository)
                .save(sucursalExistente);
    }

    @Test
    @DisplayName("Debe conservar el estado al actualizar una sucursal")
    void debeConservarEstadoAlActualizar() {
        sucursalExistente.setHabilitada(false);

        SucursalRequest request = new SucursalRequest(
                "Sucursal Actualizada",
                "Nueva Dirección 123",
                "San Antonio",
                null
        );

        when(sucursalRepository.findById(1L))
                .thenReturn(Optional.of(sucursalExistente));

        when(sucursalRepository.save(any(Sucursal.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        SucursalResponse response =
                sucursalService.actualizarSucursal(
                        1L,
                        request
                );

        assertThat(response.habilitada()).isFalse();
    }

    @Test
    @DisplayName("Debe lanzar excepción al actualizar una sucursal inexistente")
    void debeFallarAlActualizarSucursalInexistente() {
        SucursalRequest request = new SucursalRequest(
                "Sucursal inexistente",
                "Dirección",
                "Ciudad",
                "123"
        );

        when(sucursalRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                sucursalService.actualizarSucursal(
                        999L,
                        request
                )
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Sucursal no encontrada");

        verify(sucursalRepository, never())
                .save(any(Sucursal.class));
    }

    @Test
    @DisplayName("Debe deshabilitar una sucursal")
    void debeDeshabilitarSucursal() {
        when(sucursalRepository.findById(1L))
                .thenReturn(Optional.of(sucursalExistente));

        when(sucursalRepository.save(any(Sucursal.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        SucursalResponse response =
                sucursalService.cambiarEstadoSucursal(
                        1L,
                        false
                );

        assertThat(response.habilitada()).isFalse();
        assertThat(sucursalExistente.getHabilitada()).isFalse();

        verify(sucursalRepository)
                .save(sucursalExistente);
    }

    @Test
    @DisplayName("Debe habilitar una sucursal")
    void debeHabilitarSucursal() {
        sucursalExistente.setHabilitada(false);

        when(sucursalRepository.findById(1L))
                .thenReturn(Optional.of(sucursalExistente));

        when(sucursalRepository.save(any(Sucursal.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        SucursalResponse response =
                sucursalService.cambiarEstadoSucursal(
                        1L,
                        true
                );

        assertThat(response.habilitada()).isTrue();
        assertThat(sucursalExistente.getHabilitada()).isTrue();

        verify(sucursalRepository)
                .save(sucursalExistente);
    }

    @Test
    @DisplayName("Debe lanzar excepción al cambiar estado de una sucursal inexistente")
    void debeFallarAlCambiarEstadoDeSucursalInexistente() {
        when(sucursalRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                sucursalService.cambiarEstadoSucursal(
                        999L,
                        false
                )
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Sucursal no encontrada");

        verify(sucursalRepository, never())
                .save(any(Sucursal.class));
    }

    @Test
    @DisplayName("Debe eliminar una sucursal existente")
    void debeEliminarSucursal() {
        when(sucursalRepository.findById(1L))
                .thenReturn(Optional.of(sucursalExistente));

        sucursalService.eliminarSucursal(1L);

        verify(sucursalRepository)
                .findById(1L);

        verify(sucursalRepository)
                .delete(sucursalExistente);
    }

    @Test
    @DisplayName("Debe lanzar excepción al eliminar una sucursal inexistente")
    void debeFallarAlEliminarSucursalInexistente() {
        when(sucursalRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                sucursalService.eliminarSucursal(999L)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Sucursal no encontrada");

        verify(sucursalRepository, never())
                .delete(any(Sucursal.class));
    }

    @Test
    @DisplayName("Debe mapear todos los campos de la sucursal")
    void debeMapearTodosLosCampos() {
        when(sucursalRepository.findById(1L))
                .thenReturn(Optional.of(sucursalExistente));

        SucursalResponse response =
                sucursalService.obtenerSucursalPorId(1L);

        assertThat(response.id())
                .isEqualTo(sucursalExistente.getId());

        assertThat(response.nombre())
                .isEqualTo(sucursalExistente.getNombre());

        assertThat(response.direccion())
                .isEqualTo(sucursalExistente.getDireccion());

        assertThat(response.ciudad())
                .isEqualTo(sucursalExistente.getCiudad());

        assertThat(response.telefono())
                .isEqualTo(sucursalExistente.getTelefono());

        assertThat(response.habilitada())
                .isEqualTo(sucursalExistente.getHabilitada());

        assertThat(response.fechaCreacion())
                .isEqualTo(sucursalExistente.getFechaCreacion());
    }
}