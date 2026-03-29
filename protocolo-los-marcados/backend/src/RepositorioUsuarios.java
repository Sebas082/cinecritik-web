import java.nio.file.Path;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class RepositorioUsuarios {
    public RepositorioUsuarios(Path file) {
        // La compatibilidad con el fallback original se mantiene en la firma,
        // pero ahora usamos la Base de Datos gestionada por DataStore.
    }

    public synchronized boolean existe(String username) {
        String key = norm(username);
        if (key.isEmpty()) return false;
        String sql = "SELECT 1 FROM usuarios WHERE username = ?";
        try (Connection conn = DataStore.getConnection(); PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, key);
            ResultSet rs = pstmt.executeQuery();
            return rs.next();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public synchronized boolean registrar(String username, String password) {
        if (username == null || password == null) return false;
        String key = norm(username);
        if (key.isEmpty()) return false;

        if (existe(key)) return false;

        String sql = "INSERT INTO usuarios (username, password) VALUES (?, ?)";
        try (Connection conn = DataStore.getConnection(); PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, key);
            pstmt.setString(2, password);
            pstmt.executeUpdate();
            return true;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public synchronized boolean validar(String username, String password) {
        String key = norm(username);
        if (key.isEmpty()) return false;

        String sql = "SELECT password FROM usuarios WHERE username = ?";
        try (Connection conn = DataStore.getConnection(); PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, key);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                String dbPass = rs.getString("password");
                return dbPass != null && dbPass.equals(password);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private static String norm(String username) {
        if (username == null) return "";
        return username.trim().toLowerCase();
    }
}
