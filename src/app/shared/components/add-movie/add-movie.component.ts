import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseService } from '../../services/database.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { MovieInterface } from '../../interfaces/movie-interface';

@Component({
  selector: 'app-add-movie',
  templateUrl: './add-movie.component.html',
  styleUrl: './add-movie.component.scss'
})
export class AddMovieComponent {

  @Input() movie: MovieInterface | null = null;

  @Output() closeModal = new EventEmitter<void>();

  movieForm!: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private databaseService: DatabaseService,
    private storage: AngularFireStorage
  ) { }

  ngOnInit() {
    this.movieForm = this.fb.group({
      name: ['', Validators.required],
      rating: [0, Validators.required],
      analysis: ['', Validators.required],
      photo_path: ['']
    });

    // 🟡 SE FOR EDIÇÃO
    if (this.movie) {
      this.isEditMode = true;

      this.movieForm.patchValue({
        name: this.movie.name,
        rating: this.movie.rating,
        analysis: this.movie.analysis,
        photo_path: this.movie.photo_path
      });

      this.previewUrl = this.movie.photo_path || null;
    }
  }

  setRating(rating: number) {
    this.movieForm.patchValue({ rating });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit() {
    if (!this.movieForm.valid) return;

    const formData = this.movieForm.value;

    // 🔵 MODO EDITAR
    if (this.isEditMode && this.movie?.id) {
      this.databaseService
        .updateDocument('movies', this.movie.id, {
          name: formData.name,
          rating: formData.rating,
          analysis: formData.analysis
        })
        .then(() => {
          if (this.selectedFile) {
            this.uploadImage(this.movie!.id, true);
          } else {
            this.finishAction();
          }
        });

      return;
    }

    // 🟢 MODO ADICIONAR
    this.databaseService.addDocument('movies', {
      name: formData.name,
      rating: formData.rating,
      analysis: formData.analysis,
      photo_path: null
    }).then((docRef: any) => {
      if (this.selectedFile) {
        this.uploadImage(docRef.id, true);
      } else {
        this.finishAction();
      }
    });
  }


  uploadImage(movieId: string, shouldFinish = false) {
    if (!this.selectedFile) return;

    const filePath = `movies/${movieId}/cover.jpg`; // padronizado
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, this.selectedFile);

    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(url => {
          this.databaseService.updateDocument('movies', movieId, {
            photo_path: url
          }).then(() => {
            if (shouldFinish) {
              this.finishAction();
            }
          });
        });
      })
    ).subscribe();
  }

  finishAction() {
    this.resetForm();
    this.closeModal.emit();
  }


  resetForm() {
    this.movieForm.reset();
    this.selectedFile = null;
    this.previewUrl = null;
    this.isEditMode = false;
  }

  onClose() {
    this.closeModal.emit();
  }
}
