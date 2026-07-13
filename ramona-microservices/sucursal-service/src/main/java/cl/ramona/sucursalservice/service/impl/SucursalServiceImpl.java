package cl.ramona.sucursalservice.service.impl;

import cl.ramona.sucursalservice.dto.request.SucursalRequest;
import cl.ramona.sucursalservice.dto.response.SucursalResponse;
import cl.ramona.sucursalservice.entity.Sucursal;
import cl.ramona.sucursalservice.exception.ResourceNotFoundException;
import cl.ramona.sucursalservice.repository.SucursalRepository;
import cl.ramona.sucursalservice.service.SucursalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SucursalServiceImpl implements SucursalService {

    private final SucursalRepository sucursalRepository;

    @Override
    public List<SucursalResponse> listarSucursales() {
        return sucursalRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public SucursalResponse obtenerSucursalPorId(Long id) {
        return toResponse(buscarSucursal(id));
    }

    @Override
    public SucursalResponse crearSucursal(SucursalRequest request) {
        Sucursal sucursal = Sucursal.builder()
                .nombre(request.nombre())
                .direccion(request.direccion())
                .ciudad(request.ciudad())
                .telefono(request.telefono())
                .habilitada(true)
                .build();

        return toResponse(sucursalRepository.save(sucursal));
    }

    @Override
    public SucursalResponse actualizarSucursal(Long id, SucursalRequest request) {
        Sucursal sucursal = buscarSucursal(id);

        sucursal.setNombre(request.nombre());
        sucursal.setDireccion(request.direccion());
        sucursal.setCiudad(request.ciudad());
        sucursal.setTelefono(request.telefono());

        return toResponse(sucursalRepository.save(sucursal));
    }

    @Override
    public SucursalResponse cambiarEstadoSucursal(Long id, Boolean habilitada) {
        Sucursal sucursal = buscarSucursal(id);
        sucursal.setHabilitada(habilitada);
        return toResponse(sucursalRepository.save(sucursal));
    }

    @Override
    public void eliminarSucursal(Long id) {
        Sucursal sucursal = buscarSucursal(id);
        sucursalRepository.delete(sucursal);
    }

    private Sucursal buscarSucursal(Long id) {
        return sucursalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal no encontrada"));
    }

    private SucursalResponse toResponse(Sucursal sucursal) {
        return new SucursalResponse(
                sucursal.getId(),
                sucursal.getNombre(),
                sucursal.getDireccion(),
                sucursal.getCiudad(),
                sucursal.getTelefono(),
                sucursal.getHabilitada(),
                sucursal.getFechaCreacion()
        );
    }
}