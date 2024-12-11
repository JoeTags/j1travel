import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { environment } from '../environments/environments';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = environment.mapboxAccessToken;
}
