import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, Sucursal } from './sucursal.service';

export interface CrearSolicitudRequest {
  usuarioId: number;
  sucursalOrigenId: number;
  sucursalDestinoId: number;
  descripcion: string;
  peso: number;
  valorDeclarado: number;
  destinatarioNombre: string;
  destinatarioRutDni: string;
  destinatarioTelefono: string;
}

export interface SolicitudEnvio {
  id: number;
  codigoSeguimiento: string;
  estado: string;
  descripcion: string;
  peso: number;
  valorDeclarado: number;
  sucursalOrigen: Sucursal;
  sucursalDestino: Sucursal;
  destinatarioNombre: string;
  destinatarioRutDni: string;
  destinatarioTelefono: string;
  fechaCreacion: string;
}

export interface CambiarEstadoSolicitudRequest {
  estado: string;
  aprobadoPorId?: number;
}


@Injectable({
  providedIn: 'root'
})
export class SolicitudService {

  private apiUrl = `${environment.apiUrl}/solicitudes`;

  constructor(private http: HttpClient) {}

  crear(request: CrearSolicitudRequest): Observable<ApiResponse<SolicitudEnvio>> {
    return this.http.post<ApiResponse<SolicitudEnvio>>(this.apiUrl, request);
  }

  listar(): Observable<ApiResponse<SolicitudEnvio[]>> {
    return this.http.get<ApiResponse<SolicitudEnvio[]>>(this.apiUrl);
  }

  buscarPorCodigo(codigo: string) {
  return this.http.get<ApiResponse<SolicitudEnvio>>(`${this.apiUrl}/codigo/${codigo}`);
  } 

  listarPorUsuario(usuarioId: number): Observable<ApiResponse<SolicitudEnvio[]>> {
  return this.http.get<ApiResponse<SolicitudEnvio[]>>(`${this.apiUrl}/usuario/${usuarioId}`);
  }


  cambiarEstado(id: number, request: CambiarEstadoSolicitudRequest) {
    return this.http.patch<ApiResponse<SolicitudEnvio>>(
      `${this.apiUrl}/${id}/estado`,
      request
    );
  }

  
}