import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss'
})
export class UserManagement {

  searchText = '';

  users = [

    {
      name: 'Rodrigo Díaz',
      email: 'rodrigo@email.com',
      role: 'CLIENTE',
      active: true
    },

    {
      name: 'María Pérez',
      email: 'maria@email.com',
      role: 'OPERADOR',
      active: true
    },

    {
      name: 'Juan Soto',
      email: 'juan@email.com',
      role: 'ADMIN',
      active: false
    }

  ];

}