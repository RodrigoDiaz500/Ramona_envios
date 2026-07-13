package cl.ramona.incidenciaservice.entity;
import cl.ramona.incidenciaservice.enums.EstadoIncidencia;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity @Table(name="INCIDENCIAS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Incidencia {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(name="SOLICITUD_ENVIO_ID",nullable=false) private Long solicitudEnvioId;
 @Column(name="TITULO",nullable=false,length=150) private String titulo;
 @Lob @Column(name="DESCRIPCION",nullable=false) private String descripcion;
 @Enumerated(EnumType.STRING) @Column(name="ESTADO",nullable=false,length=50) private EstadoIncidencia estado;
 @Column(name="CREADA_POR",nullable=false) private Long creadaPorId;
 @Column(name="ASIGNADA_A") private Long asignadaAId;
 @Column(name="FECHA_CREACION") private LocalDateTime fechaCreacion;
 @Column(name="FECHA_ACTUALIZACION") private LocalDateTime fechaActualizacion;
}
