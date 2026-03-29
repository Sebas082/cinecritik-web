/**
 * Bloques 5/6/7: Anime hereda de Multimedia y responde distinto (polimorfismo).
 */
public class AnimeM extends Multimedia {
  private int episodios;

  public AnimeM(int id, String titulo, int anio, String genero, String descripcion, String posterDataUrl, String audioDataUrl, String streamingUrl, int episodios) {
    super(id, titulo, anio, genero, descripcion, posterDataUrl, audioDataUrl, streamingUrl);
    this.episodios = episodios;
  }

  public int getEpisodios() { return episodios; }

  @Override
  public void ejecutarAccion() {
    System.out.println("Ejecutando anime: " + titulo);
  }

  @Override
  public String mensajeMetraje() {
    return "Subtítulos corruptos. Episodios detectados: " + episodios + ".";
  }

  @Override
  protected String getType() {
    return "Anime";
  }

  @Override
  public String toJson() {
    String base = super.toJson();
    return base.substring(0, base.length() - 1) + ",\"episodios\":" + episodios + "}";
  }
}

