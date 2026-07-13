package cl.ramona.seguimientoservice.entity;
import cl.ramona.seguimientoservice.enums.EstadoSolicitud;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity @Table(name="SEGUIMIENTOS") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Seguimiento {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(name="SOLICITUD_ENVIO_ID", nullable=false) private Long solicitudEnvioId;
 @Enumerated(EnumType.STRING) @Column(name="ESTADO", nullable=false, length=50) private EstadoSolicitud estado;
 @Column(name="DESCRIPCION", length=255) private String descripcion;
 @Column(name="FECHA_EVENTO") private LocalDateTime fechaEvento;
 @Column(name="USUARIO_ID", nullable=false) private Long usuarioId;
}
