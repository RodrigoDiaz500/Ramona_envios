package cl.ramona.ramona_backend.entity;

import cl.ramona.ramona_backend.enums.EstadoIncidencia;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "INCIDENCIAS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incidencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SOLICITUD_ENVIO_ID", nullable = false)
    private SolicitudEnvio solicitudEnvio;

    @Column(name = "TITULO", nullable = false, length = 150)
    private String titulo;

    @Lob
    @Column(name = "DESCRIPCION", nullable = false)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(name = "ESTADO", nullable = false, length = 50)
    private EstadoIncidencia estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CREADA_POR", nullable = false)
    private Usuario creadaPor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ASIGNADA_A")
    private Usuario asignadaA;

    @Column(name = "FECHA_CREACION")
    private LocalDateTime fechaCreacion;

    @Column(name = "FECHA_ACTUALIZACION")
    private LocalDateTime fechaActualizacion;
}