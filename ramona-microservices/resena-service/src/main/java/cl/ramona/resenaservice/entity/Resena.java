package cl.ramona.resenaservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "RESENAS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Resena {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "SOLICITUD_ENVIO_ID", nullable = false, unique = true)
    private Long solicitudEnvioId;

    @Column(name = "USUARIO_ID", nullable = false)
    private Long usuarioId;

    @Column(name = "CALIFICACION", nullable = false)
    private Integer calificacion;

    @Lob
    @Column(name = "COMENTARIO")
    private String comentario;

    @Column(name = "FECHA_CREACION", nullable = false)
    private LocalDateTime fechaCreacion;
}
