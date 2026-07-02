package cl.ramona.ramona_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "RESENAS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resena {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SOLICITUD_ENVIO_ID", nullable = false, unique = true)
    private SolicitudEnvio solicitudEnvio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USUARIO_ID", nullable = false)
    private Usuario usuario;

    @Column(name = "CALIFICACION", nullable = false)
    private Integer calificacion;

    @Lob
    @Column(name = "COMENTARIO")
    private String comentario;

    @Column(name = "FECHA_CREACION")
    private LocalDateTime fechaCreacion;
}