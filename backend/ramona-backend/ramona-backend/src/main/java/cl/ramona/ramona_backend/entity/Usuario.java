package cl.ramona.ramona_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "USUARIOS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "NOMBRE", nullable = false, length = 100)
    private String nombre;

    @Column(name = "APELLIDO", nullable = false, length = 100)
    private String apellido;

    @Column(name = "CORREO", nullable = false, unique = true, length = 255)
    private String correo;

    @Column(name = "TELEFONO", length = 20)
    private String telefono;

    @Column(name = "DIRECCION", length = 255)
    private String direccion;

    @Column(name = "ACTIVO", nullable = false)
    private Boolean activo;

    @Column(name = "ENTRA_ID", unique = true, length = 255)
    private String entraId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ROLE_ID", nullable = false)
    private Rol rol;

    @Column(name = "FECHA_CREACION")
    private LocalDateTime fechaCreacion;

    @Column(name = "FECHA_ACTUALIZACION")
    private LocalDateTime fechaActualizacion;
}