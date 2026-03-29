import java.sql.*;
import java.util.*;

public class Scrub {
    public static void main(String[] args) throws Exception {
        Class.forName("org.sqlite.JDBC");
        String url = "jdbc:sqlite:data/cinecritik.db";
        try (Connection conn = DriverManager.getConnection(url)) {
            // Eliminar votos de posts con ese título
            String subquery = "SELECT id FROM foro_posts WHERE multimedia_titulo = 'Archivos Clasificados'";
            
            // Borrar votos
            try (PreparedStatement ps = conn.prepareStatement("DELETE FROM foro_votos WHERE post_id IN (" + subquery + ")")) {
                ps.executeUpdate();
            }
            // Borrar comentarios
            try (PreparedStatement ps = conn.prepareStatement("DELETE FROM foro_comentarios WHERE post_id IN (" + subquery + ")")) {
                ps.executeUpdate();
            }
            // Borrar posts
            try (PreparedStatement ps = conn.prepareStatement("DELETE FROM foro_posts WHERE multimedia_titulo = 'Archivos Clasificados'")) {
                int rows = ps.executeUpdate();
                System.out.println("Eliminados " + rows + " posts de 'Archivos Clasificados'.");
            }
        }
    }
}
