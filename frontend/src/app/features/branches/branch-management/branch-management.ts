import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-branch-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './branch-management.html',
  styleUrl: './branch-management.scss'
})
export class BranchManagement {

  branches = [

    {
      name: 'Sucursal Central',
      city: 'Santiago',
      active: true
    },

    {
      name: 'Sucursal San Antonio',
      city: 'San Antonio',
      active: true
    },

    {
      name: 'Sucursal Cartagena',
      city: 'Cartagena',
      active: false
    }

  ];

}