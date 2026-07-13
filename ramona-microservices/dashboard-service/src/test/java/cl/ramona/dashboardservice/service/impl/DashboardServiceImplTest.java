package cl.ramona.dashboardservice.service.impl;
import cl.ramona.dashboardservice.client.*;
import cl.ramona.dashboardservice.dto.response.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
@ExtendWith(MockitoExtension.class)
class DashboardServiceImplTest {
    @Mock SolicitudClient solicitudClient;
    @Mock UsuarioClient usuarioClient;
    @Mock SucursalClient sucursalClient;
    @Mock IncidenciaClient incidenciaClient;
    @Mock ResenaClient resenaClient;
    DashboardServiceImpl service;
    @BeforeEach void setUp(){ service = new DashboardServiceImpl(solicitudClient,usuarioClient,sucursalClient,incidenciaClient,resenaClient); }
    private SolicitudResumen solicitud(long id, String estado, int dia){
        return new SolicitudResumen(id,"RAM-"+id,estado,new SucursalResumen(1L,"Origen","San Antonio"),
                new SucursalResumen(2L,"Destino","Santiago"),"Cliente "+id, LocalDateTime.of(2026,7,dia,10,0));
    }
    private void defaults(){ when(usuarioClient.contar()).thenReturn(4L); when(sucursalClient.contar()).thenReturn(3L); when(resenaClient.promedio()).thenReturn(new BigDecimal("4.5")); }
    @Test void obtieneResumenCompleto(){
        when(solicitudClient.listar()).thenReturn(List.of(solicitud(1,"PENDIENTE_APROBACION",1),solicitud(2,"EN_TRANSITO",2),solicitud(3,"ENTREGADO",3),solicitud(4,"RECHAZADO",4)));
        when(incidenciaClient.listar()).thenReturn(List.of(new IncidenciaResumen(1L,"ABIERTA"),new IncidenciaResumen(2L,"RESUELTA"))); defaults();
        DashboardResponse r=service.obtenerResumen();
        assertEquals(4,r.totalSolicitudes()); assertEquals(1,r.pendientes()); assertEquals(1,r.enTransito()); assertEquals(1,r.entregadas()); assertEquals(1,r.rechazadas()); assertEquals(1,r.incidenciasAbiertas()); assertEquals(new BigDecimal("4.5"),r.promedioResenas());
    }
    @Test void ordenaUltimasSolicitudesPorFechaDescendente(){
        when(solicitudClient.listar()).thenReturn(List.of(solicitud(1,"APROBADO",1),solicitud(3,"APROBADO",3),solicitud(2,"APROBADO",2))); when(incidenciaClient.listar()).thenReturn(List.of()); defaults();
        DashboardResponse r=service.obtenerResumen(); assertEquals(List.of(3L,2L,1L),r.ultimasSolicitudes().stream().map(UltimaSolicitudResponse::id).toList());
    }
    @Test void limitaUltimasSolicitudesACinco(){
        when(solicitudClient.listar()).thenReturn(List.of(solicitud(1,"APROBADO",1),solicitud(2,"APROBADO",2),solicitud(3,"APROBADO",3),solicitud(4,"APROBADO",4),solicitud(5,"APROBADO",5),solicitud(6,"APROBADO",6))); when(incidenciaClient.listar()).thenReturn(List.of()); defaults();
        DashboardResponse r=service.obtenerResumen(); assertEquals(5,r.ultimasSolicitudes().size()); assertEquals(6L,r.ultimasSolicitudes().getFirst().id());
    }
    @Test void cuentaSoloIncidenciasAbiertasIgnorandoMayusculas(){
        when(solicitudClient.listar()).thenReturn(List.of()); when(incidenciaClient.listar()).thenReturn(List.of(new IncidenciaResumen(1L,"abierta"),new IncidenciaResumen(2L,"ABIERTA"),new IncidenciaResumen(3L,"CERRADA"))); defaults();
        assertEquals(2,service.obtenerResumen().incidenciasAbiertas());
    }
    @Test void soportaSucursalNulaEnUltimaSolicitud(){
        SolicitudResumen s=new SolicitudResumen(1L,"RAM-1","APROBADO",null,null,"Cliente",LocalDateTime.now()); when(solicitudClient.listar()).thenReturn(List.of(s)); when(incidenciaClient.listar()).thenReturn(List.of()); defaults();
        UltimaSolicitudResponse ultima=service.obtenerResumen().ultimasSolicitudes().getFirst(); assertNull(ultima.origen()); assertNull(ultima.destino());
    }
}
