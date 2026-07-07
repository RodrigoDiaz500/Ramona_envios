package cl.ramona.ramona_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "NOTIFICACIONES")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USUARIO_ID", nullable = false)
    private Usuario usuario;

    @Column(name = "TITULO", nullable = false, length = 150)
    private String titulo;

    @Lob
    @Column(name = "MENSAJE", nullable = false)
    private String mensaje;

    @Column(name = "LEIDA", nullable = false)
    private Boolean leida;

    @Column(name = "FECHA_CREACION")
    private LocalDateTime fechaCreacion;
}