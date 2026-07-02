package cl.ramona.ramona_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "SUCURSALES")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sucursal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "NOMBRE", nullable = false, length = 100)
    private String nombre;

    @Column(name = "DIRECCION", nullable = false, length = 255)
    private String direccion;

    @Column(name = "CIUDAD", nullable = false, length = 100)
    private String ciudad;

    @Column(name = "TELEFONO", length = 20)
    private String telefono;

    @Column(name = "HABILITADA", nullable = false)
    private Boolean habilitada;

    @Column(name = "FECHA_CREACION")
    private LocalDateTime fechaCreacion;
}