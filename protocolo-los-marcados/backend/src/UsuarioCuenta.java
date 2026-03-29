/**
 * Bloque 9: Encapsulamiento. Credenciales privadas.
 * (En una app real se usarían hashes; aquí es demo académica.)
 */
public class UsuarioCuenta {
  private String username;
  private String password;

  public UsuarioCuenta(String username, String password) {
    this.username = username;
    this.password = password;
  }

  public String getUsername() {
    return username;
  }

  public boolean validar(String usr, String pwd) {
    if (usr == null || pwd == null) return false;
    return usr.equals(username) && pwd.equals(password);
  }

  // Package-private (sin modificador): usado solo por RepositorioUsuarios (demo).
  String passwordForStorage() {
    return password;
  }

  public String toJson() {
    return "{\"username\":\"" + esc(username) + "\"}";
  }

  private static String esc(String s) {
    if (s == null) return "";
    return s.replace("\\", "\\\\").replace("\"", "\\\"");
  }
}

