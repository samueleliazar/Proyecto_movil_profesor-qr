import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  constructor(private auth: AngularFireAuth, private firestore: AngularFirestore) {}

  async registerUser(nombre: string, apellido: string, correo: string, contrasena: string) {
    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(correo, contrasena);
      const user = userCredential.user;

      if (user) {
        await user.updateProfile({ displayName: nombre });
        
        // Guardar datos adicionales en Firestore
        await this.firestore.collection('users').doc(user.uid).set({
          nombre: nombre,
          apellido: apellido,
          correo: correo,
          uid: user.uid, 
        });
      }

      return userCredential;
    } catch (error) {
      throw error; 
    }
  }

  async sendPasswordResetEmail(correo: string): Promise<void> {
    try {
      await this.auth.sendPasswordResetEmail(correo);
      console.log('Correo de recuperación enviado');
    } catch (error) {
      console.error('Error al enviar el correo de recuperación', error);
      throw error;
    }
  }

  async login(correo: string, contrasena: string): Promise<void> {
    try {
      await this.auth.signInWithEmailAndPassword(correo, contrasena);
      console.log('Inicio de sesión exitoso');
    } catch (error) {
      console.error('Error en el inicio de sesión', error);
      throw error;
    }
  }
  async getCurrentUserData(): Promise<any> {
    const currentUser = await this.auth.currentUser;
    if (currentUser) {
      const userDoc = await this.firestore.collection('users').doc(currentUser.uid).get().toPromise();
      return userDoc?.data();
    }
    return null;
  }
  // Método para cerrar sesión
  logout(): Promise<void> {
    return this.auth.signOut();
  }
  async loginWithEmail(correo: string, contrasena: string): Promise<any> {
    return await this.auth.signInWithEmailAndPassword(correo, contrasena);
  } 
  


  getUserById(studentId: string): Observable<any> {
    return this.firestore.collection('usuarios').doc(studentId).get().pipe(
      catchError(error => {
        console.error('Error al obtener usuario', error);
        throw error; 
      })
    );
  }

  getUser(): Promise<firebase.User | null> {
    return new Promise((resolve, reject) => {
      this.auth.authState.subscribe(user => {
        if (user) {
          resolve(user);  
        } else {
          resolve(null);  
        }
      }, error => {
        reject(error); 
      });
    });
  }
}
