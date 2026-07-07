import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ApiResponse } from './sucursal.service';

export interface ResenaRequest {
  solicitudEnvioId: number;
  usuarioId: number;
  calificacion: number;
  comentario: string;
}

export interface Resena {
  id: number;
  codigoSeguimiento: string;
  usuarioNombre: string;
  calificacion: number;
  comentario: string;
  fechaCreacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResenaService {

  private apiUrl = `${environment.apiUrl}/resenas`;

  constructor(private http: HttpClient) {}

  listar(): Observable<ApiResponse<Resena[]>> {
    return this.http.get<ApiResponse<Resena[]>>(this.apiUrl);
  }

  crear(request: ResenaRequest): Observable<ApiResponse<Resena>> {
    return this.http.post<ApiResponse<Resena>>(this.apiUrl, request);
  }
}