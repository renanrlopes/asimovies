import { Component } from '@angular/core';
import { MovieInterface } from '../../shared/interfaces/movie-interface';
import { DatabaseService } from '../../shared/services/database.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  // VARIÁVEIS

  showAddMovieModal: boolean = false; // controle de exibição do modal de adição de filme
  searchQuery: string = ''; // controle de pesquisa de filmes
  displayedMovies: MovieInterface[] = []; // filmes exibidos na tela
  movies: MovieInterface[] = [];
  limit: number = 4; // 4 filmes no maximo por vez
  currentOffset: number = 0; // controle de visualização de filmes
  selectedMovie: MovieInterface | null = null;

  constructor(private databaseService: DatabaseService) { }

  ngOnInit() {
    this.databaseService.getCollection('movies')
      .subscribe((movies: MovieInterface[]) => {
        console.log('MOVIES RAW:', movies);
        this.movies = movies;
        this.updateDisplayedMovies();
      });
  }

  updateDisplayedMovies() {
    this.displayedMovies = this.movies.slice(this.currentOffset, this.currentOffset + this.limit);
  }

  deleteMovie(id: string) {
    this.databaseService.deleteDocument('movies', id).then(() => {
      console.log("Documento excluído com sucesso.")
    }).catch(error => {
      console.log(error)
    })
  }

  editMovie(movie: MovieInterface) {
    this.selectedMovie = movie;
    this.showAddMovieModal = true;
  }


  toggleAddMovieModal() {
    this.showAddMovieModal = !this.showAddMovieModal;

    if (!this.showAddMovieModal) {
      this.selectedMovie = null;
    }
  }

  filterMovies(): void {
    const query = this.searchQuery.trim().toLowerCase();
    const sanitizedQuery = query.replace(/[\.\-]/g, '');

    if (sanitizedQuery === '') {
      // Se não houver pesquisa, exibe a página atual normalmente
      this.displayedMovies = this.movies.slice(this.currentOffset, this.currentOffset + this.limit);
    } else {
      // Filtra sobre todos os filmes
      const filteredMovies = this.movies.filter(movie => {
        const titleMatch = movie.name ? movie.name.toLowerCase().includes(sanitizedQuery) : false;
        return titleMatch;
      });

      // Reinicia o offset para começar da primeira página do resultado filtrado
      this.currentOffset = 0;
      this.displayedMovies = filteredMovies.slice(this.currentOffset, this.currentOffset + this.limit);
    }
  }

  // avançar no layout de filmes (4 por vez)
  showNext() {
    if (this.currentOffset + this.limit < this.movies.length) {
      this.currentOffset += this.limit;
      this.updateDisplayedMovies();
    }
  }

  showPrevious() {
    if (this.currentOffset - this.limit >= 0) {
      this.currentOffset -= this.limit;
      this.updateDisplayedMovies();
    }
  }

}

