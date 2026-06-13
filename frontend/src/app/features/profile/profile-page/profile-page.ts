import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss'
})
export class ProfilePage {

  user = {

    firstName: 'Rodrigo',

    lastName: 'Díaz',

    email: 'rodrigo@ramonaenvios.cl',

    phone: '+56 9 1234 5678',

    address: 'San Antonio, Chile'

  };

  saveProfile(): void {

    console.log('Perfil actualizado', this.user);

  }

}