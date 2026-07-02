package cl.ramona.ramona_backend.service;

import cl.ramona.ramona_backend.dto.request.SucursalRequest;
import cl.ramona.ramona_backend.dto.response.SucursalResponse;

import java.util.List;

public interface SucursalService {

    List<SucursalResponse> listarSucursales();

    SucursalResponse obtenerSucursalPorId(Long id);

    SucursalResponse crearSucursal(SucursalRequest request);

    SucursalResponse actualizarSucursal(Long id, SucursalRequest request);

    SucursalResponse cambiarEstadoSucursal(Long id, Boolean habilitada);

    void eliminarSucursal(Long id);
}