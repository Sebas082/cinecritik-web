/**
 * Bloque 9: Encapsulamiento y seguridad.
 * Credenciales privadas; solo se valida vía validar().
 */
public class GestorAcceso {
  // Bloque 9: private (datos sensibles)
  private String username;
  private String password;

  public GestorAcceso(String username, String password) {
    this.username = username;
    this.password = password;
  }

  // Bloque 9: método público de control
  public boolean validar(String usr, String pwd) {
    if (usr == null || pwd == null) return false;
    return usr.equals(this.username) && pwd.equals(this.password);
  }
}

