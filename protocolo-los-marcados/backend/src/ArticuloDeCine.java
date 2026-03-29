public class ArticuloDeCine implements Revisable {
  @Override
  public String analizarPelicula() {
    return "Trama muy profunda con giros argumentales espectaculares y una fotografía premiada.";
  }

  @Override
  public int calificarRecomendacion() {
    return 5; // Puntaje máximo 5 estrellas
  }
}
