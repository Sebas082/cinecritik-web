import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Bloque 4 y 11: Gestión de colecciones + estructura de datos.
 * Contiene una lista de Multimedia (polimórfica).
 */
public class CatalogoPeliculas {
  // Bloque 11: colección (lista)
  private final List<Multimedia> items = new ArrayList<Multimedia>();
  private int nextId = 1;

  public int nextId() {
    return nextId++;
  }

  // Ajusta el siguiente ID después de cargar desde archivo.
  public void ajustarNextId(int siguiente) {
    if (siguiente > 0) {
      this.nextId = siguiente;
    }
  }

  public void agregar(Multimedia m) {
    items.add(m);
  }

  public boolean actualizar(Multimedia m) {
    for (int i = 0; i < items.size(); i++) {
      if (items.get(i).getId() == m.getId()) {
        items.set(i, m);
        return true;
      }
    }
    return false;
  }

  public boolean eliminarPorId(int id) {
    for (int i = 0; i < items.size(); i++) {
      if (items.get(i).getId() == id) {
        items.remove(i);
        return true;
      }
    }
    return false;
  }

  public List<Multimedia> listar() {
    return Collections.unmodifiableList(items);
  }

  public Multimedia buscarPorId(int id) {
    for (Multimedia m : items) {
      if (m.getId() == id) return m;
    }
    return null;
  }
}

