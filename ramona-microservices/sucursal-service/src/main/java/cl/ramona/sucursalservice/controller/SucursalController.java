package cl.ramona.sucursalservice.controller;

import cl.ramona.sucursalservice.dto.request.SucursalRequest;
import cl.ramona.sucursalservice.dto.response.ApiResponse;
import cl.ramona.sucursalservice.dto.response.SucursalResponse;
import cl.ramona.sucursalservice.service.SucursalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sucursales")
@RequiredArgsConstructor
public class SucursalController {

    private final SucursalService sucursalService;

    @GetMapping
    public ApiResponse<List<SucursalResponse>> listarSucursales() {
        return ApiResponse.ok("Sucursales obtenidas correctamente", sucursalService.listarSucursales());
    }

    @GetMapping("/{id}")
    public ApiResponse<SucursalResponse> obtenerSucursalPorId(@PathVariable Long id) {
        return ApiResponse.ok("Sucursal obtenida correctamente", sucursalService.obtenerSucursalPorId(id));
    }

    @PostMapping
    public ApiResponse<SucursalResponse> crearSucursal(@Valid @RequestBody SucursalRequest request) {
        return ApiResponse.ok("Sucursal creada correctamente", sucursalService.crearSucursal(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<SucursalResponse> actualizarSucursal(
            @PathVariable Long id,
            @Valid @RequestBody SucursalRequest request
    ) {
        return ApiResponse.ok("Sucursal actualizada correctamente", sucursalService.actualizarSucursal(id, request));
    }

    @PatchMapping("/{id}/habilitada")
    public ApiResponse<SucursalResponse> cambiarEstadoSucursal(
            @PathVariable Long id,
            @RequestParam Boolean habilitada
    ) {
        return ApiResponse.ok("Estado de la sucursal actualizado correctamente", sucursalService.cambiarEstadoSucursal(id, habilitada));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminarSucursal(@PathVariable Long id) {
        sucursalService.eliminarSucursal(id);
        return ApiResponse.ok("Sucursal eliminada correctamente", null);
    }
}