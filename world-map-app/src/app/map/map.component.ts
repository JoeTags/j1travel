import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as mapboxgl from 'mapbox-gl';
import { environment } from '../../environments/environment';
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
  constructor(private router: Router, private agentService: AgentService) {} //private agentService: AgentService

  ngOnInit(): void {
    this.agentService.getAgents().subscribe((agents) => {
      this.agents = agents;
      console.log('agent:', this.agents);
      this.addAgentMarkers();
    });

    // Set your Mapbox access token
    (mapboxgl as any).accessToken = environment.mapboxAccessToken;
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

  addAgentMarkers(): void {
    this.agents.forEach((agent) => {
      const marker = new mapboxgl.Marker()
        .setLngLat([agent.location.longitude, agent.location.latitude])
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <h3>${agent.name}</h3>
            <p>${agent.description}</p>
            <img src="${agent.photoUrl}" alt="${agent.name}" width="100" />
          `)
        )
        .addTo(this.map);
    });
  }

  goToAgentPortal(): void {
    this.router.navigate(['/agent-portal']);
  }
}
