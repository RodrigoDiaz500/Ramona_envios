import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ApiResponse } from './sucursal.service';

export interface Incidencia {
  id: number;
  solicitudEnvioId: number;
  codigoSeguimiento: string;
  titulo: string;
  descripcion: string;
  estado: 'ABIERTA' | 'EN_PROCESO' | 'RESUELTA' | 'CERRADA';
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface IncidenciaRequest {
  solicitudEnvioId: number;
  titulo: string;
  descripcion: string;
  creadaPorId: number;
  asignadaAId?: number | null;
}

export interface ActualizarEstadoIncidenciaRequest {
  estado: string;
  asignadaAId?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class IncidenciaService {

  private apiUrl = `${environment.apiUrl}/incidencias`;

  constructor(private http: HttpClient) {}

  listar(): Observable<ApiResponse<Incidencia[]>> {
    return this.http.get<ApiResponse<Incidencia[]>>(this.apiUrl);
  }

  crear(request: IncidenciaRequest): Observable<ApiResponse<Incidencia>> {
    return this.http.post<ApiResponse<Incidencia>>(this.apiUrl, request);
  }

  actualizarEstado(
    id: number,
    request: ActualizarEstadoIncidenciaRequest
  ): Observable<ApiResponse<Incidencia>> {
    return this.http.patch<ApiResponse<Incidencia>>(
      `${this.apiUrl}/${id}/estado`,
      request
    );
  }
}