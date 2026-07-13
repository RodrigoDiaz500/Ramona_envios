package cl.ramona.usuarioservice.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UsuarioRequest(

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
        String nombre,

        @NotBlank(message = "El apellido es obligatorio")
        @Size(max = 100, message = "El apellido no puede superar los 100 caracteres")
        String apellido,

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo debe tener un formato válido")
        @Size(max = 255, message = "El correo no puede superar los 255 caracteres")
        String correo,

        @Size(max = 20, message = "El teléfono no puede superar los 20 caracteres")
        String telefono,

        @Size(max = 255, message = "La dirección no puede superar los 255 caracteres")
        String direccion,

        String entraId,

        @NotNull(message = "El rol es obligatorio")
        Long roleId
) {
}