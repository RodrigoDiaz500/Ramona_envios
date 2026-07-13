package cl.ramona.solicitudservice.service.impl;
import cl.ramona.solicitudservice.client.*;
import cl.ramona.solicitudservice.dto.request.*;
import cl.ramona.solicitudservice.dto.response.*;
import cl.ramona.solicitudservice.entity.SolicitudEnvio;
import cl.ramona.solicitudservice.enums.EstadoSolicitud;
import cl.ramona.solicitudservice.exception.ResourceNotFoundException;
import cl.ramona.solicitudservice.repository.SolicitudEnvioRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
@ExtendWith(MockitoExtension.class)
class SolicitudEnvioServiceImplTest {
 @Mock SolicitudEnvioRepository repository; @Mock UsuarioClient usuarioClient; @Mock SucursalClient sucursalClient; @Mock EventPublisher publisher;
 private SolicitudEnvioServiceImpl service;
 private final Clock clock=Clock.fixed(Instant.parse("2026-07-13T12:00:00Z"),ZoneOffset.UTC);
 private final UsuarioResponse usuario=new UsuarioResponse(10L,"Ana","Pérez","ana@test.cl","+56911111111","Calle 1",true,null,new RolResponse(1L,"CLIENTE"),null,null);
 private final UsuarioResponse operador=new UsuarioResponse(20L,"Omar","Rojas","op@test.cl","+56922222222","Calle 2",true,null,new RolResponse(2L,"OPERADOR"),null,null);
 private final SucursalResponse origen=new SucursalResponse(1L,"San Antonio","Dir 1","San Antonio","1",true,null);
 private final SucursalResponse destino=new SucursalResponse(2L,"Santiago","Dir 2","Santiago","2",true,null);
 @BeforeEach void setUp(){ service=new SolicitudEnvioServiceImpl(repository,usuarioClient,sucursalClient,publisher,clock); }
 private CrearSolicitudRequest crearRequest(){ return new CrearSolicitudRequest(10L,1L,2L,"Caja",new BigDecimal("2.50"),new BigDecimal("50000"),"Juan Soto","12.345.678-9","+56912345678"); }
 private SolicitudEnvio entidad(){ return SolicitudEnvio.builder().id(100L).codigoSeguimiento("RAM-000001").usuarioId(10L).sucursalOrigenId(1L).sucursalDestinoId(2L).descripcion("Caja").peso(new BigDecimal("2.50")).valorDeclarado(new BigDecimal("50000")).estado(EstadoSolicitud.PENDIENTE_APROBACION).destinatarioNombre("Juan Soto").destinatarioRutDni("12.345.678-9").destinatarioTelefono("+56912345678").fechaCreacion(LocalDateTime.of(2026,7,13,12,0)).build(); }
 private void mockReferencias(){ when(usuarioClient.obtener(10L)).thenReturn(usuario); when(sucursalClient.obtener(1L)).thenReturn(origen); when(sucursalClient.obtener(2L)).thenReturn(destino); }
 @Test void crearSolicitudGuardaPendienteYPublicaEventos(){
  mockReferencias(); when(repository.existsByCodigoSeguimiento(anyString())).thenReturn(false); when(repository.save(any())).thenAnswer(i->{SolicitudEnvio s=i.getArgument(0);s.setId(100L);return s;});
  var r=service.crearSolicitud(crearRequest());
  assertAll(()->assertEquals(100L,r.id()),()->assertEquals(EstadoSolicitud.PENDIENTE_APROBACION,r.estado()),()->assertEquals(usuario,r.usuario()),()->assertEquals(origen,r.sucursalOrigen()),()->assertEquals(LocalDateTime.of(2026,7,13,12,0),r.fechaCreacion()));
  verify(publisher).publicarSeguimiento(any()); verify(publisher).publicarNotificacion(any());
 }
 @Test void crearFallaSiOrigenDeshabilitado(){
  when(usuarioClient.obtener(10L)).thenReturn(usuario); when(sucursalClient.obtener(1L)).thenReturn(new SucursalResponse(1L,"X","D","C","1",false,null)); when(sucursalClient.obtener(2L)).thenReturn(destino);
  var ex=assertThrows(IllegalArgumentException.class,()->service.crearSolicitud(crearRequest())); assertEquals("La sucursal de origen no está habilitada",ex.getMessage()); verify(repository,never()).save(any());
 }
 @Test void crearFallaSiSucursalesSonIguales(){
  when(usuarioClient.obtener(10L)).thenReturn(usuario); when(sucursalClient.obtener(1L)).thenReturn(origen); when(sucursalClient.obtener(2L)).thenReturn(new SucursalResponse(1L,"Otra","D","C","2",true,null));
  assertThrows(IllegalArgumentException.class,()->service.crearSolicitud(crearRequest())); verify(repository,never()).save(any());
 }
 @Test void obtenerPorIdRetornaRespuestaCompleta(){
  var e=entidad(); when(repository.findById(100L)).thenReturn(Optional.of(e)); mockReferencias();
  var r=service.obtenerPorId(100L); assertAll(()->assertEquals("RAM-000001",r.codigoSeguimiento()),()->assertEquals("San Antonio",r.sucursalOrigen().ciudad()),()->assertEquals("Juan Soto",r.destinatarioNombre()));
 }
 @Test void obtenerPorIdFallaCuandoNoExiste(){
  when(repository.findById(99L)).thenReturn(Optional.empty()); assertThrows(ResourceNotFoundException.class,()->service.obtenerPorId(99L));
 }
 @Test void listarPorUsuarioMapeaTodosLosRegistros(){
  var a=entidad(); var b=entidad(); b.setId(101L); b.setCodigoSeguimiento("RAM-000002"); when(repository.findByUsuarioId(10L)).thenReturn(List.of(a,b)); mockReferencias();
  var result=service.listarPorUsuario(10L); assertEquals(2,result.size()); assertEquals("RAM-000002",result.get(1).codigoSeguimiento());
 }
 @Test void aprobarExigeUsuarioAprobador(){
  when(repository.findById(100L)).thenReturn(Optional.of(entidad())); var req=new CambiarEstadoSolicitudRequest(EstadoSolicitud.APROBADO,null);
  assertThrows(IllegalArgumentException.class,()->service.cambiarEstado(100L,req)); verify(repository,never()).save(any());
 }
 @Test void aprobarGuardaFechaYPublicaEventos(){
  var e=entidad(); when(repository.findById(100L)).thenReturn(Optional.of(e)); when(usuarioClient.obtener(20L)).thenReturn(operador); when(repository.save(any())).thenAnswer(i->i.getArgument(0)); mockReferencias();
  var r=service.cambiarEstado(100L,new CambiarEstadoSolicitudRequest(EstadoSolicitud.APROBADO,20L));
  assertAll(()->assertEquals(EstadoSolicitud.APROBADO,r.estado()),()->assertEquals(20L,e.getAprobadoPorId()),()->assertEquals(LocalDateTime.of(2026,7,13,12,0),e.getFechaAprobacion())); verify(publisher).publicarSeguimiento(any()); verify(publisher).publicarNotificacion(any());
 }
 @Test void cambiarEstadoSinResponsableUsaUsuarioSolicitante(){
  var e=entidad(); when(repository.findById(100L)).thenReturn(Optional.of(e)); when(repository.save(any())).thenAnswer(i->i.getArgument(0)); mockReferencias();
  var r=service.cambiarEstado(100L,new CambiarEstadoSolicitudRequest(EstadoSolicitud.EN_TRANSITO,null));
  assertEquals(EstadoSolicitud.EN_TRANSITO,r.estado()); verify(usuarioClient,atLeastOnce()).obtener(10L);
 }
}
