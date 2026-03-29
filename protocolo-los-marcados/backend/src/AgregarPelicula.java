/**
 * Bloque 4/11: Clase de creación ("Agregar Película/Serie").
 * Centraliza la creación de objetos Multimedia con sus atributos.
 */
public class AgregarPelicula {
  private final CatalogoPeliculas catalogo;

  public AgregarPelicula(CatalogoPeliculas catalogo) {
    this.catalogo = catalogo;
  }

  public PeliculaM crearPelicula(String titulo, int anio, String genero, String descripcion, String posterDataUrl, String audioDataUrl, String streamingUrl, int duracionMin) {
    int id = catalogo.nextId();
    PeliculaM p = new PeliculaM(id, titulo, anio, genero, descripcion, posterDataUrl, audioDataUrl, streamingUrl, duracionMin);
    catalogo.agregar(p);
    return p;
  }

  public SerieM crearSerie(String titulo, int anio, String genero, String descripcion, String posterDataUrl, String audioDataUrl, String streamingUrl, int temporadas) {
    int id = catalogo.nextId();
    SerieM s = new SerieM(id, titulo, anio, genero, descripcion, posterDataUrl, audioDataUrl, streamingUrl, temporadas);
    catalogo.agregar(s);
    return s;
  }

  public AnimeM crearAnime(String titulo, int anio, String genero, String descripcion, String posterDataUrl, String audioDataUrl, String streamingUrl, int episodios) {
    int id = catalogo.nextId();
    AnimeM a = new AnimeM(id, titulo, anio, genero, descripcion, posterDataUrl, audioDataUrl, streamingUrl, episodios);
    catalogo.agregar(a);
    return a;
  }

  // Para edición: conserva el ID
  public Multimedia crearConId(int id, String tipo, String titulo, int anio, String genero, String descripcion, String posterDataUrl, String audioDataUrl, String streamingUrl, int duracionMin, int temporadas, int episodios) {
    if ("Serie".equalsIgnoreCase(tipo)) {
      return new SerieM(id, titulo, anio, genero, descripcion, posterDataUrl, audioDataUrl, streamingUrl, temporadas);
    }
    if ("Anime".equalsIgnoreCase(tipo)) {
      return new AnimeM(id, titulo, anio, genero, descripcion, posterDataUrl, audioDataUrl, streamingUrl, episodios);
    }
    return new PeliculaM(id, titulo, anio, genero, descripcion, posterDataUrl, audioDataUrl, streamingUrl, duracionMin);
  }
}

