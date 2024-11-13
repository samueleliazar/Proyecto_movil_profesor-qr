import { Timestamp } from "firebase/firestore";

export interface Asistencia {
    date: null ;
    ramo: string;
    studentId: string;
}
interface RamoData {
    nombre: string;
    ramo: string;  // O cualquier otra propiedad que esté en tu documento
  }
