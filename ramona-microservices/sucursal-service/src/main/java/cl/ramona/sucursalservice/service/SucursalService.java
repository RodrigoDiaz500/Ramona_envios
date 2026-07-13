package cl.ramona.sucursalservice.service;

import cl.ramona.sucursalservice.dto.request.SucursalRequest;
import cl.ramona.sucursalservice.dto.response.SucursalResponse;

import java.util.List;

public interface SucursalService {

    List<SucursalResponse> listarSucursales();

    SucursalResponse obtenerSucursalPorId(Long id);

    SucursalResponse crearSucursal(SucursalRequest request);

    SucursalResponse actualizarSucursal(Long id, SucursalRequest request);

    SucursalResponse cambiarEstadoSucursal(Long id, Boolean habilitada);

    void eliminarSucursal(Long id);
}