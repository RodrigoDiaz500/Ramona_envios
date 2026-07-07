import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Resena, ResenaService } from '../../../../core/services/resena.service';

@Component({
  selector: 'app-review-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-management.html',
  styleUrl: './review-management.scss'
})
export class ReviewManagement implements OnInit {

  reviews: Resena[] = [];
  loading = false;

  constructor(
    private resenaService: ResenaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarResenas();
  }

  cargarResenas(): void {
    this.loading = true;

    this.resenaService.listar().subscribe({
      next: (response) => {
        this.reviews = response.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar reseñas', error);
        this.reviews = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}