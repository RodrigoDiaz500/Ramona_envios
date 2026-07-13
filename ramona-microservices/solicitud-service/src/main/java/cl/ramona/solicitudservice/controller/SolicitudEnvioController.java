package cl.ramona.solicitudservice.controller;
import cl.ramona.solicitudservice.dto.request.*;
import cl.ramona.solicitudservice.dto.response.*;
import cl.ramona.solicitudservice.service.SolicitudEnvioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/solicitudes") @RequiredArgsConstructor
public class SolicitudEnvioController {
 private final SolicitudEnvioService service;
 @PostMapping public ApiResponse<SolicitudEnvioResponse> crear(@Valid @RequestBody CrearSolicitudRequest r){ return ApiResponse.ok("Solicitud creada correctamente",service.crearSolicitud(r)); }
 @GetMapping public ApiResponse<List<SolicitudEnvioResponse>> listar(){ return ApiResponse.ok("Solicitudes obtenidas correctamente",service.listarSolicitudes()); }
 @GetMapping("/{id}") public ApiResponse<SolicitudEnvioResponse> obtener(@PathVariable Long id){ return ApiResponse.ok("Solicitud obtenida correctamente",service.obtenerPorId(id)); }
 @GetMapping("/codigo/{codigo}") public ApiResponse<SolicitudEnvioResponse> codigo(@PathVariable String codigo){ return ApiResponse.ok("Solicitud obtenida correctamente",service.obtenerPorCodigo(codigo)); }
 @GetMapping("/usuario/{usuarioId}") public ApiResponse<List<SolicitudEnvioResponse>> usuario(@PathVariable Long usuarioId){ return ApiResponse.ok("Solicitudes del usuario obtenidas correctamente",service.listarPorUsuario(usuarioId)); }
 @PatchMapping("/{id}/estado") public ApiResponse<SolicitudEnvioResponse> estado(@PathVariable Long id,@Valid @RequestBody CambiarEstadoSolicitudRequest r){ return ApiResponse.ok("Estado de la solicitud actualizado correctamente",service.cambiarEstado(id,r)); }
}
