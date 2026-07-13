package cl.ramona.solicitudservice.entity;
import cl.ramona.solicitudservice.enums.EstadoSolicitud;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Entity
@Table(name="SOLICITUDES_ENVIO")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SolicitudEnvio {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(name="CODIGO_SEGUIMIENTO",nullable=false,unique=true,length=30) private String codigoSeguimiento;
 @Column(name="USUARIO_ID",nullable=false) private Long usuarioId;
 @Column(name="SUCURSAL_ORIGEN_ID",nullable=false) private Long sucursalOrigenId;
 @Column(name="SUCURSAL_DESTINO_ID",nullable=false) private Long sucursalDestinoId;
 @Column(name="DESCRIPCION",length=500) private String descripcion;
 @Column(name="PESO",precision=10,scale=2) private BigDecimal peso;
 @Column(name="VALOR_DECLARADO",precision=12,scale=2) private BigDecimal valorDeclarado;
 @Enumerated(EnumType.STRING) @Column(name="ESTADO",nullable=false,length=50) private EstadoSolicitud estado;
 @Column(name="DESTINATARIO_NOMBRE",nullable=false,length=150) private String destinatarioNombre;
 @Column(name="DESTINATARIO_RUT_DNI",nullable=false,length=20) private String destinatarioRutDni;
 @Column(name="DESTINATARIO_TELEFONO",nullable=false,length=20) private String destinatarioTelefono;
 @Column(name="FECHA_CREACION") private LocalDateTime fechaCreacion;
 @Column(name="FECHA_APROBACION") private LocalDateTime fechaAprobacion;
 @Column(name="APROBADO_POR") private Long aprobadoPorId;
}
