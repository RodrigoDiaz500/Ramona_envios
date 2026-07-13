package cl.ramona.incidenciaservice.controller;
import cl.ramona.incidenciaservice.dto.request.*; import cl.ramona.incidenciaservice.dto.response.*; import cl.ramona.incidenciaservice.enums.EstadoIncidencia; import cl.ramona.incidenciaservice.service.IncidenciaService; import jakarta.validation.Valid; import lombok.RequiredArgsConstructor; import org.springframework.web.bind.annotation.*; import java.util.List;
@RestController @RequestMapping("/api/incidencias") @RequiredArgsConstructor
public class IncidenciaController {
 private final IncidenciaService service;
 @PostMapping public ApiResponse<IncidenciaResponse> crear(@Valid @RequestBody IncidenciaRequest r){return ApiResponse.ok("Incidencia creada correctamente",service.crearIncidencia(r));}
 @GetMapping public ApiResponse<List<IncidenciaResponse>> listar(){return ApiResponse.ok("Incidencias obtenidas correctamente",service.listarIncidencias());}
 @GetMapping("/{id}") public ApiResponse<IncidenciaResponse> obtener(@PathVariable Long id){return ApiResponse.ok("Incidencia obtenida correctamente",service.obtenerPorId(id));}
 @GetMapping("/solicitud/{id}") public ApiResponse<List<IncidenciaResponse>> porSolicitud(@PathVariable("id") Long id){return ApiResponse.ok("Incidencias de la solicitud obtenidas correctamente",service.listarPorSolicitud(id));}
 @GetMapping("/estado/{estado}") public ApiResponse<List<IncidenciaResponse>> porEstado(@PathVariable EstadoIncidencia estado){return ApiResponse.ok("Incidencias por estado obtenidas correctamente",service.listarPorEstado(estado));}
 @PatchMapping("/{id}/estado") public ApiResponse<IncidenciaResponse> actualizar(@PathVariable Long id,@Valid @RequestBody ActualizarEstadoIncidenciaRequest r){return ApiResponse.ok("Estado de incidencia actualizado correctamente",service.actualizarEstado(id,r));}
}
