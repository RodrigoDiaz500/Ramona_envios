package cl.ramona.authservice.exception;

public class UsuarioDeshabilitadoException extends RuntimeException {
    public UsuarioDeshabilitadoException() {
        super("Tu usuario se encuentra deshabilitado, por lo que no tienes acceso a Ramona Express.");
    }
}
