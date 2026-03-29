import java.sql.*;

public class Scrub {
    public static void main(String[] args) throws Exception {
        Class.forName("org.sqlite.JDBC");
        // Path adjusted to root context
        String url = "jdbc:sqlite:backend/data/cinecritik.db";
        try (Connection conn = DriverManager.getConnection(url)) {
            String title = "Archivos Clasificados";
            // 1. Delete votes
            String q1 = "DELETE FROM foro_votos WHERE post_id IN (SELECT id FROM foro_posts WHERE multimedia_titulo = ?)";
            try (PreparedStatement ps = conn.prepareStatement(q1)) {
                ps.setString(1, title);
                ps.executeUpdate();
            }
            // 2. Delete comments
            String q2 = "DELETE FROM foro_comentarios WHERE post_id IN (SELECT id FROM foro_posts WHERE multimedia_titulo = ?)";
            try (PreparedStatement ps = conn.prepareStatement(q2)) {
                ps.setString(1, title);
                ps.executeUpdate();
            }
            // 3. Delete posts
            String q3 = "DELETE FROM foro_posts WHERE multimedia_titulo = ?";
            try (PreparedStatement ps = conn.prepareStatement(q3)) {
                ps.setString(1, title);
                int r = ps.executeUpdate();
                System.out.println("Eliminados " + r + " posts.");
            }
        }
    }
}
