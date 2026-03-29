import java.time.LocalDateTime;

public class ForumComment {
  private final int postId;
  private final String usuario;
  private final String texto;
  private final LocalDateTime creadoEn;

  public ForumComment(int postId, String usuario, String texto) {
    this.postId = postId;
    this.usuario = usuario;
    this.texto = texto;
    this.creadoEn = LocalDateTime.now();
  }

  public int getPostId() { return postId; }
  public String getUsuario() { return usuario; }
  public String getTexto() { return texto; }

  public String toJson() {
    return "{"
        + "\"postId\":" + postId + ","
        + "\"usuario\":\"" + esc(usuario) + "\","
        + "\"texto\":\"" + esc(texto) + "\","
        + "\"creadoEn\":\"" + esc(creadoEn.toString()) + "\""
        + "}";
  }

  private static String esc(String s) {
    if (s == null) return "";
    return s.replace("\\", "\\\\")
        .replace("\"", "\\\"")
        .replace("\n", "\\n")
        .replace("\r", "\\r")
        .replace("\t", "\\t");
  }
}

