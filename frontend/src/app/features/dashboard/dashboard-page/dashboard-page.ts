import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  DashboardResponse,
  DashboardService
} from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss'
})
export class DashboardPage implements OnInit {

  dashboard?: DashboardResponse;
  loading = false;

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDashboard();
  }

  cargarDashboard(): void {
    this.loading = true;

    this.dashboardService.obtenerResumen().subscribe({
      next: (response) => {
        this.dashboard = response.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar dashboard', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  porcentaje(valor: number): number {
    if (!this.dashboard || this.dashboard.totalSolicitudes === 0) return 0;
    return Math.round((valor / this.dashboard.totalSolicitudes) * 100);
  }

  estadoTexto(estado: string): string {
    return estado.replaceAll('_', ' ');
  }
}