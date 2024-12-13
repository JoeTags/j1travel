import { Injectable } from '@angular/core';
import {
  Storage,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from '@angular/fire/storage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  constructor(private storage: Storage) {}

  uploadFile(path: string, file: File): Observable<string> {
    return new Observable((observer) => {
      const storageRef = ref(this.storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        null,
        (error) => observer.error(error),
        async () => {
          try {
            const downloadUrl = await getDownloadURL(storageRef);
            observer.next(downloadUrl);
            observer.complete();
          } catch (err) {
            observer.error(err);
          }
        }
      );
    });
  }
}
