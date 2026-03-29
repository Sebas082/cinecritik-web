import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Parser JSON mínimo para {"username":"...","password":"..."}.
 * (Sin librerías externas por simplicidad del entregable.)
 */
public final class JsonLite {
  private JsonLite() {}

  public static String getString(String json, String key) {
    if (json == null || key == null) return "";
    String k = Pattern.quote(key);
    Pattern p = Pattern.compile("\"" + k + "\"\\s*:\\s*\"(.*?)\"", Pattern.DOTALL);
    Matcher m = p.matcher(json);
    if (!m.find()) return "";
    return unescape(m.group(1));
  }

  public static int getInt(String json, String key, int fallback) {
    if (json == null || key == null) return fallback;
    String k = Pattern.quote(key);
    Pattern p = Pattern.compile("\"" + k + "\"\\s*:\\s*(-?\\d+)", Pattern.DOTALL);
    Matcher m = p.matcher(json);
    if (!m.find()) return fallback;
    try {
      return Integer.parseInt(m.group(1));
    } catch (NumberFormatException e) {
      return fallback;
    }
  }

  public static boolean hasKey(String json, String key) {
    if (json == null || key == null) return false;
    String k = Pattern.quote(key);
    Pattern p = Pattern.compile("\"" + k + "\"\\s*:", Pattern.DOTALL);
    return p.matcher(json).find();
  }

  private static String unescape(String s) {
    return s
        .replace("\\n", "\n")
        .replace("\\r", "\r")
        .replace("\\t", "\t")
        .replace("\\\"", "\"")
        .replace("\\\\", "\\");
  }
}

