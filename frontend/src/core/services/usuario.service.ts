import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ApiResponse } from './sucursal.service';

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  direccion: string;
  activo: boolean;
  entraId: string | null;
  rol: {
    id: number;
    nombre: string;
  };
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface UsuarioRequest {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  direccion: string;
  entraId: string | null;
  roleId: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  listar(): Observable<ApiResponse<Usuario[]>> {
    return this.http.get<ApiResponse<Usuario[]>>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(`${this.apiUrl}/${id}`);
  }

  actualizar(
    id: number,
    request: UsuarioRequest
  ): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  cambiarEstado(
    id: number,
    activo: boolean
  ): Observable<ApiResponse<Usuario>> {
    return this.http.patch<ApiResponse<Usuario>>(
      `${this.apiUrl}/${id}/activo?activo=${activo}`,
      {}
    );
  }

  cambiarRol(
    id: number,
    roleId: number
  ): Observable<ApiResponse<Usuario>> {
    return this.http.patch<ApiResponse<Usuario>>(
      `${this.apiUrl}/${id}/rol?roleId=${roleId}`,
      {}
    );
  }

}