import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from './sucursal.service';

export interface Seguimiento {
  id: number;
  solicitudEnvioId: number;
  codigoSeguimiento: string;
  estado: string;
  descripcion: string;
  fechaEvento: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeguimientoService {

  private apiUrl = `${environment.apiUrl}/seguimientos`;

  constructor(private http: HttpClient) {}

  listarPorSolicitud(solicitudId: number): Observable<ApiResponse<Seguimiento[]>> {
    return this.http.get<ApiResponse<Seguimiento[]>>(`${this.apiUrl}/solicitud/${solicitudId}`);
  }
}