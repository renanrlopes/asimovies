import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserInterface } from '../interfaces/user-interface';
import { Observable } from 'rxjs';
import { compilePipeFromMetadata } from '@angular/compiler';
import { MovieInterface } from '../interfaces/movie-interface';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(private db: AngularFirestore) { }

  addDocument(collection: string, data: any) {
    return this.db.collection(collection).add(data);
  }

  getDocument(collection: string, id: string): Observable<any | undefined> {
    return this.db.collection(collection).doc(id).valueChanges();
  }

  getCollection(collection: string): Observable<any[]> {
    return this.db.collection(collection).valueChanges({ idField: 'id' })
  }

  getCollectionWithFilter(collection: string, field: string, value: string): Observable<any[]> {
    return this.db.collection(collection, ref => ref.where(field, '==', value)).valueChanges({ idField: 'id' });
  }

  updateDocument(collection: string, id: string, data: Partial<MovieInterface>): Promise<void> {
    return this.db.collection(collection).doc(id).update(data);
  }

  deleteDocument(collection: string, id: string): Promise<void> {
    return this.db.collection(collection).doc(id).delete();
  }
}