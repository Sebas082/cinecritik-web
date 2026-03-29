/**
 * Bloques 5 y 6: Herencia (Pelicula hereda de Multimedia).
 * Bloque 7: Polimorfismo (mensajeMetraje distinto).
 */
public class PeliculaM extends Multimedia {
  private int duracionMin;

  public PeliculaM(int id, String titulo, int anio, String genero, String descripcion, String posterDataUrl, String audioDataUrl, String streamingUrl, int duracionMin) {
    super(id, titulo, anio, genero, descripcion, posterDataUrl, audioDataUrl, streamingUrl);
    this.duracionMin = duracionMin;
  }

  public int getDuracionMin() { return duracionMin; }

  @Override
  public void ejecutarAccion() {
    // Bloque 8: acción “concreta” de la abstracción
    System.out.println("Reproduciendo película: " + titulo);
  }

  @Override
  public String mensajeMetraje() {
    // Bloque 7: polimorfismo (Pelicula)
    return "La cinta se corta en el minuto 13. Duración: " + duracionMin + " min.";
  }

  @Override
  protected String getType() {
    return "Pelicula";
  }

  @Override
  public String toJson() {
    // extiende JSON base con técnico
    String base = super.toJson();
    // insertar antes del cierre
    return base.substring(0, base.length() - 1) + ",\"duracionMin\":" + duracionMin + "}";
  }
}

