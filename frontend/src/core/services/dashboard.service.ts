import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ApiResponse } from './sucursal.service';

export interface DashboardResponse {
  totalSolicitudes: number;
  pendientes: number;
  aprobadas: number;
  enPreparacion: number;
  enTransito: number;
  entregadas: number;
  rechazadas: number;
  totalUsuarios: number;
  totalSucursales: number;
  incidenciasAbiertas: number;
  promedioResenas: number;
  ultimasSolicitudes: {
    id: number;
    codigoSeguimiento: string;
    estado: string;
    origen: string;
    destino: string;
    destinatario: string;
  }[];
}
@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  obtenerResumen(): Observable<ApiResponse<DashboardResponse>> {
    return this.http.get<ApiResponse<DashboardResponse>>(this.apiUrl);
  }

  
}