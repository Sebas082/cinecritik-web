public class UsuarioCasual extends Espectador implements Revisable {
  public UsuarioCasual(String nombre) {
    super(nombre);
    this.nivelCinefilo = "ESPECTADOR_CASUAL";
  }

  @Override
  public String darOpinion() {
    return "Ve la película mientras usa el celular, se ríe en las partes equivocadas.";
  }

  @Override
  public String analizarPelicula() {
    return darOpinion();
  }

  @Override
  public int calificarRecomendacion() {
    return 3; // Neutral
  }
}
