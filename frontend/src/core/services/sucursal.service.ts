import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  habilitada: boolean;
  fechaCreacion: string;
}

export interface SucursalRequest {
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
}

@Injectable({
  providedIn: 'root'
})
export class SucursalService {

  private apiUrl = `${environment.apiUrl}/sucursales`;

  constructor(private http: HttpClient) {}

  listar(): Observable<ApiResponse<Sucursal[]>> {
    return this.http.get<ApiResponse<Sucursal[]>>(this.apiUrl);
  }

  crear(request: SucursalRequest): Observable<ApiResponse<Sucursal>> {
    return this.http.post<ApiResponse<Sucursal>>(this.apiUrl, request);
  }

  actualizar(id: number, request: SucursalRequest): Observable<ApiResponse<Sucursal>> {
    return this.http.put<ApiResponse<Sucursal>>(`${this.apiUrl}/${id}`, request);
  }

  cambiarEstado(id: number, habilitada: boolean): Observable<ApiResponse<Sucursal>> {
    return this.http.patch<ApiResponse<Sucursal>>(
      `${this.apiUrl}/${id}/habilitada?habilitada=${habilitada}`,
      {}
    );
  }
}