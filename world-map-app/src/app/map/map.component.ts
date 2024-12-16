import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
} from '@angular/fire/auth';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as mapboxgl from 'mapbox-gl';
import { catchError, from, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environments';
import { AgentService } from '../agent-portal/agent.service';
import { Agent } from '../interfaces/agent.model';
@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HttpClientModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit {
  map!: mapboxgl.Map;
  agents: Agent[] = [];
  user: any = null;
  constructor(
    private router: Router,
    private agentService: AgentService,
    private http: HttpClient
  ) {} //private agentService: AgentService

  ngOnInit(): void {
    (mapboxgl as any).accessToken = environment.mapboxAccessToken;
    // this.agentService.getAgents();
    // console.log('Agents loaded:', this.agents);
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User authenticated:', user.uid);
        console.log('Current User UID:', auth.currentUser?.uid);
        this.user = user;
        this.loadAgentsAndAddMarkers();
      } else {
        console.log('No user authenticated. Signing in anonymously...');
        signInAnonymously(auth).then((cred) => {
          console.log('Anonymous sign-in successful:', cred.user.uid);
          this.user = cred.user;
        });
      }
    });
  }

  private loadAgentsAndAddMarkers(): void {
    this.agentService.getAgents().subscribe((agents) => {
      console.log('Agents:', agents);

      // Map through agents and resolve their locations
      const locationPromises = agents.map((agent) =>
        this.getLocationFromAddress(agent.city, agent.country)
          .toPromise()
          .then((location) => {
            agent.location = location; // Add resolved location to agent
            return agent;
          })
      );

      Promise.all(locationPromises).then((resolvedAgents) => {
        this.agents = resolvedAgents; // Save updated agents with locations
        this.addAgentMarkers(); // Add markers to the map
      });
    });
  }

  addAgentMarkers(): void {
    if (!this.map) {
      console.error('Map is not initialized.');
      return;
    }

    if (!this.agents || this.agents.length === 0) {
      console.warn('No agents available to add markers.');
      return;
    }

    this.agents.forEach((agent) => {
      if (agent.location?.latitude && agent.location?.longitude) {
        console.log('Adding marker for agent:', agent);

        const marker = new mapboxgl.Marker()
          .setLngLat([agent.location.longitude, agent.location.latitude])
          .setPopup(
            new mapboxgl.Popup().setHTML(`
                <h3>${agent.name || 'Unknown Agent'}</h3>
                <p>${agent.description || 'No description available'}</p>
                ${
                  agent.photo
                    ? `<img src="${agent.photo}" alt="${agent.name}" width="100" />`
                    : ''
                }
              `)
          )
          .addTo(this.map);
      } else {
        console.warn('Invalid location for agent:', agent);
      }
    });
  }

  ngAfterViewInit(): void {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [0, 20],
      zoom: 1.5,
    });

    this.map.on('load', () => {
      this.addCountryLayers();
      this.addMapInteractivity();
    });
  }

  private authenticateUser(): Observable<void> {
    const auth = getAuth();
    return new Observable<void>((observer) => {
      onAuthStateChanged(
        auth,
        (user) => {
          if (user) {
            console.log('User authenticated:', user.uid);
            this.user = user;
            observer.next(); // Emit success
            observer.complete(); // Complete the Observable
          } else {
            console.log('No user authenticated. Signing in anonymously...');
            from(signInAnonymously(auth))
              .pipe(
                tap((cred) => {
                  console.log('Anonymous sign-in successful:', cred.user.uid);
                  this.user = cred.user;
                  observer.next(); // Emit success after sign-in
                  observer.complete(); // Complete the Observable
                }),
                catchError((error) => {
                  console.error('Error during anonymous sign-in:', error);
                  observer.error(error); // Emit error
                  return of(); // Return empty observable to avoid unhandled errors
                })
              )
              .subscribe();
          }
        },
        (error) => {
          console.error('Error in onAuthStateChanged:', error);
          observer.error(error); // Emit error if `onAuthStateChanged` fails
        }
      );
    });
  }

  // private authenticateUser(): Observable<void> {
  //   const auth = getAuth();
  //   onAuthStateChanged(auth, (user) => {
  //     if (user) {
  //       console.log('User authenticated:', user.uid);
  //       this.user = user;
  //     } else {
  //       console.log('No user authenticated. Signing in anonymously...');
  //       signInAnonymously(auth).then((cred) => {
  //         console.log('Anonymous sign-in successful:', cred.user.uid);
  //         this.user = cred.user;
  //       });
  //     }
  //   });
  // }

  addCountryLayers(): void {
    // Add a source for the country boundaries
    this.map.addSource('countries', {
      type: 'vector',
      url: 'mapbox://mapbox.country-boundaries-v1',
    });

    // Add a layer to display the country boundaries
    this.map.addLayer({
      id: 'country-fills',
      type: 'fill',
      source: 'countries',
      'source-layer': 'country_boundaries',
      paint: {
        'fill-color': '#627BC1',
        'fill-opacity': 0.5,
      },
    });

    // Add a layer for country borders
    this.map.addLayer({
      id: 'country-borders',
      type: 'line',
      source: 'countries',
      'source-layer': 'country_boundaries',
      paint: {
        'line-color': '#000',
        'line-width': 1,
      },
    });

    this.addMapInteractivity();
  }

  addMapInteractivity(): void {
    // Change the cursor to a pointer when over countries
    this.map.on('mouseenter', 'country-fills', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to default when not over countries
    this.map.on('mouseleave', 'country-fills', () => {
      this.map.getCanvas().style.cursor = '';
    });

    // Add click event to display a popup
    this.map.on('click', 'country-fills', (e) => {
      const features = this.map.queryRenderedFeatures(e.point, {
        layers: ['country-fills'],
      });
      if (features && features.length > 0) {
        const country = features[0];
        if (country.properties && country.properties['name_en']) {
          const countryName = country.properties['name_en'];

          // Create a popup at the clicked location
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`<h3>${countryName}</h3><p>Custom content here.</p>`)
            .addTo(this.map);
        } else {
          console.warn('Country properties are null or name_en is undefined.');
        }
      } else {
        console.warn('No features found at the clicked location.');
      }
    });
  }

  // addAgentMarkers(): void {
  //   this.agents.forEach((agent) => {
  //     console.log('agent:', agent);
  //     const marker = new mapboxgl.Marker()
  //       .setLngLat([agent.location.longitude, agent.location.latitude])
  //       .setPopup(
  //         new mapboxgl.Popup().setHTML(`
  //           <h3>${agent.name}</h3>
  //           <p>${agent.description}</p>
  //           <img src="${agent.photoUrl}" alt="${agent.name}" width="100" />
  //         `)
  //       )
  //       .addTo(this.map);
  //   });
  // }

  private getLocationFromAddress(
    city: string,
    country: string
  ): Observable<{ latitude: number; longitude: number }> {
    const address = `${city}, ${country}`;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      address
    )}.json?access_token=${environment.mapboxAccessToken}`;

    return this.http.get<any>(url).pipe(
      map((res) => {
        const [longitude, latitude] = res.features[0].center;
        return { latitude, longitude };
      }),
      catchError((error) => {
        console.error('Error fetching location:', error);
        return of({ latitude: 0, longitude: 0 });
      })
    );
  }

  goToAgentPortal(): void {
    this.router.navigate(['/agent-portal']);
  }
}
