/**
 * Bloques 5 y 6: Herencia (Serie hereda de Multimedia).
 * Bloque 7: Polimorfismo (mensajeMetraje distinto).
 */
public class SerieM extends Multimedia {
  private int temporadas;

  public SerieM(int id, String titulo, int anio, String genero, String descripcion, String posterDataUrl, String audioDataUrl, String streamingUrl, int temporadas) {
    super(id, titulo, anio, genero, descripcion, posterDataUrl, audioDataUrl, streamingUrl);
    this.temporadas = temporadas;
  }

  public int getTemporadas() { return temporadas; }

  @Override
  public void ejecutarAccion() {
    System.out.println("Abriendo serie: " + titulo);
  }

  @Override
  public String mensajeMetraje() {
    // Bloque 7: polimorfismo (Serie)
    return "Episodios incompletos. Temporadas registradas: " + temporadas + ".";
  }

  @Override
  protected String getType() {
    return "Serie";
  }

  @Override
  public String toJson() {
    String base = super.toJson();
    return base.substring(0, base.length() - 1) + ",\"temporadas\":" + temporadas + "}";
  }
}

