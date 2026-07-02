package cl.ramona.ramona_backend.entity;

import cl.ramona.ramona_backend.enums.EstadoSolicitud;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "SEGUIMIENTOS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seguimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SOLICITUD_ENVIO_ID", nullable = false)
    private SolicitudEnvio solicitudEnvio;

    @Enumerated(EnumType.STRING)
    @Column(name = "ESTADO", nullable = false, length = 50)
    private EstadoSolicitud estado;

    @Column(name = "DESCRIPCION", length = 255)
    private String descripcion;

    @Column(name = "FECHA_EVENTO")
    private LocalDateTime fechaEvento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USUARIO_ID", nullable = false)
    private Usuario usuario;
}