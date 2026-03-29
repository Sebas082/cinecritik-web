public class CriticoExperto extends Espectador implements Revisable {
  public CriticoExperto(String nombre) {
    super(nombre);
    this.nivelCinefilo = "EXPERTO";
  }

  @Override
  public String darOpinion() {
    return "Analiza exhaustivamente el guion, la iluminación y la paleta de colores de la cinta.";
  }

  @Override
  public String analizarPelicula() {
    return darOpinion();
  }

  @Override
  public int calificarRecomendacion() {
    return 4; // Opinión exigente
  }
}
