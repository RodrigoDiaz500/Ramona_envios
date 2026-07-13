package cl.ramona.solicitudservice.service.impl;
import cl.ramona.solicitudservice.client.*;
import cl.ramona.solicitudservice.dto.request.*;
import cl.ramona.solicitudservice.dto.response.*;
import cl.ramona.solicitudservice.entity.SolicitudEnvio;
import cl.ramona.solicitudservice.enums.EstadoSolicitud;
import cl.ramona.solicitudservice.exception.ResourceNotFoundException;
import cl.ramona.solicitudservice.repository.SolicitudEnvioRepository;
import cl.ramona.solicitudservice.service.SolicitudEnvioService;
import cl.ramona.solicitudservice.util.CodigoSeguimientoGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.*;
import java.util.List;
@Service @RequiredArgsConstructor
public class SolicitudEnvioServiceImpl implements SolicitudEnvioService {
 private final SolicitudEnvioRepository repository; private final UsuarioClient usuarioClient; private final SucursalClient sucursalClient; private final EventPublisher eventPublisher; private final Clock clock;
 @Override public SolicitudEnvioResponse crearSolicitud(CrearSolicitudRequest request){
  UsuarioResponse usuario=usuarioClient.obtener(request.usuarioId());
  SucursalResponse origen=sucursalClient.obtener(request.sucursalOrigenId());
  SucursalResponse destino=sucursalClient.obtener(request.sucursalDestinoId());
  validarSucursales(origen,destino);
  SolicitudEnvio entity=SolicitudEnvio.builder().codigoSeguimiento(generarCodigoUnico()).usuarioId(usuario.id()).sucursalOrigenId(origen.id()).sucursalDestinoId(destino.id()).descripcion(request.descripcion()).peso(request.peso()).valorDeclarado(request.valorDeclarado()).estado(EstadoSolicitud.PENDIENTE_APROBACION).destinatarioNombre(request.destinatarioNombre()).destinatarioRutDni(request.destinatarioRutDni()).destinatarioTelefono(request.destinatarioTelefono()).fechaCreacion(LocalDateTime.now(clock)).build();
  SolicitudEnvio saved=repository.save(entity);
  eventPublisher.publicarSeguimiento(new SeguimientoEventoRequest(saved.getId(),saved.getEstado(),"Solicitud creada y pendiente de aprobación",usuario.id()));
  eventPublisher.publicarNotificacion(new NotificacionEventoRequest(usuario.id(),"Solicitud creada","Tu envío "+saved.getCodigoSeguimiento()+" fue creado correctamente y está pendiente de aprobación."));
  return toResponse(saved,usuario,origen,destino,null);
 }
 @Override public List<SolicitudEnvioResponse> listarSolicitudes(){ return repository.findAll().stream().map(this::toResponse).toList(); }
 @Override public SolicitudEnvioResponse obtenerPorId(Long id){ return toResponse(buscar(id)); }
 @Override public SolicitudEnvioResponse obtenerPorCodigo(String codigo){ return toResponse(repository.findByCodigoSeguimiento(codigo).orElseThrow(()->new ResourceNotFoundException("Solicitud no encontrada con ese código"))); }
 @Override public List<SolicitudEnvioResponse> listarPorUsuario(Long usuarioId){ return repository.findByUsuarioId(usuarioId).stream().map(this::toResponse).toList(); }
 @Override public SolicitudEnvioResponse cambiarEstado(Long id,CambiarEstadoSolicitudRequest request){
  SolicitudEnvio s=buscar(id); Long actorId=resolverActor(s,request); UsuarioResponse actor=usuarioClient.obtener(actorId);
  s.setEstado(request.estado()); if(request.estado()==EstadoSolicitud.APROBADO){ s.setAprobadoPorId(actorId); s.setFechaAprobacion(LocalDateTime.now(clock)); }
  SolicitudEnvio saved=repository.save(s);
  eventPublisher.publicarSeguimiento(new SeguimientoEventoRequest(saved.getId(),saved.getEstado(),"Estado actualizado a "+saved.getEstado().name(),actorId));
  eventPublisher.publicarNotificacion(new NotificacionEventoRequest(saved.getUsuarioId(),"Estado actualizado","Tu envío "+saved.getCodigoSeguimiento()+" cambió a "+saved.getEstado().name()));
  return toResponse(saved);
 }
 private void validarSucursales(SucursalResponse o,SucursalResponse d){ if(!Boolean.TRUE.equals(o.habilitada())) throw new IllegalArgumentException("La sucursal de origen no está habilitada"); if(!Boolean.TRUE.equals(d.habilitada())) throw new IllegalArgumentException("La sucursal de destino no está habilitada"); if(o.id().equals(d.id())) throw new IllegalArgumentException("La sucursal de origen y destino no pueden ser la misma"); }
 private Long resolverActor(SolicitudEnvio s,CambiarEstadoSolicitudRequest r){ if(r.estado()==EstadoSolicitud.APROBADO && r.aprobadoPorId()==null) throw new IllegalArgumentException("Debe indicar el usuario que aprueba la solicitud"); return r.aprobadoPorId()!=null?r.aprobadoPorId():s.getUsuarioId(); }
 private SolicitudEnvio buscar(Long id){ return repository.findById(id).orElseThrow(()->new ResourceNotFoundException("Solicitud no encontrada")); }
 private String generarCodigoUnico(){ String c; do{ c=CodigoSeguimientoGenerator.generar(); }while(repository.existsByCodigoSeguimiento(c)); return c; }
 private SolicitudEnvioResponse toResponse(SolicitudEnvio s){ UsuarioResponse u=usuarioClient.obtener(s.getUsuarioId()); SucursalResponse o=sucursalClient.obtener(s.getSucursalOrigenId()); SucursalResponse d=sucursalClient.obtener(s.getSucursalDestinoId()); UsuarioResponse a=s.getAprobadoPorId()!=null?usuarioClient.obtener(s.getAprobadoPorId()):null; return toResponse(s,u,o,d,a); }
 private SolicitudEnvioResponse toResponse(SolicitudEnvio s,UsuarioResponse u,SucursalResponse o,SucursalResponse d,UsuarioResponse a){ return new SolicitudEnvioResponse(s.getId(),s.getCodigoSeguimiento(),u,o,d,s.getDescripcion(),s.getPeso(),s.getValorDeclarado(),s.getEstado(),s.getDestinatarioNombre(),s.getDestinatarioRutDni(),s.getDestinatarioTelefono(),s.getFechaCreacion(),s.getFechaAprobacion(),a); }
}
