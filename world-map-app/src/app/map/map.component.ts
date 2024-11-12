import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from '../../environments/environment';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit, AfterViewInit {
  map!: mapboxgl.Map;

  ngOnInit(): void {
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
}
