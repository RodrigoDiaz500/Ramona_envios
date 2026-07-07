import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ApiResponse } from './sucursal.service';

export interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaCreacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionApiService {

  private apiUrl = `${environment.apiUrl}/notificaciones`;

  constructor(private http: HttpClient) {}

  listarPorUsuario(usuarioId: number): Observable<ApiResponse<Notificacion[]>> {
    return this.http.get<ApiResponse<Notificacion[]>>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  marcarComoLeida(id: number): Observable<ApiResponse<Notificacion>> {
    return this.http.patch<ApiResponse<Notificacion>>(`${this.apiUrl}/${id}/leida`, {});
  }
}