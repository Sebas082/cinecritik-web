public class FanaticoCine extends Espectador implements Revisable {
  public FanaticoCine(String nombre) {
    super(nombre);
    this.nivelCinefilo = "CINEFILO";
  }

  @Override
  public String darOpinion() {
    return "Se emociona muchísimo con las referencias intertextuales a otros universos.";
  }

  @Override
  public String analizarPelicula() {
    return darOpinion();
  }

  @Override
  public int calificarRecomendacion() {
    return 5; // Fácil de complacer
  }
}
