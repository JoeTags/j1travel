// Replace 'YOUR_MAPBOX_ACCESS_TOKEN' with your actual token
mapboxgl.accessToken = 'pk.eyJ1Ijoiam9ldGFncyIsImEiOiJjbTJqb3dtcGgwODM5MmpwcHZ4c2h6dDRtIn0.bPNPVDTUWLLj7E6AKxJa-g';

// Initialize the Map
const map = new mapboxgl.Map({
  container: 'map', // Container ID
  style: 'mapbox://styles/mapbox/streets-v12', // Map style
  center: [0, 20], // Initial map center [lng, lat]
  zoom: 1.5 // Initial zoom level
});

// Add country boundaries when the map loads
map.on('load', () => {
  // Add a source for the country boundaries
  map.addSource('countries', {
    type: 'vector',
    url: 'mapbox://mapbox.country-boundaries-v1'
  });

  // Add a layer to display the country boundaries
  map.addLayer({
    'id': 'country-fills',
    'type': 'fill',
    'source': 'countries',
    'source-layer': 'country_boundaries',
    'layout': {},
    'paint': {
      'fill-color': '#627BC1',
      'fill-opacity': 0.5
    }
  });

  // Add a layer for country borders
  map.addLayer({
    'id': 'country-borders',
    'type': 'line',
    'source': 'countries',
    'source-layer': 'country_boundaries',
    'layout': {},
    'paint': {
      'line-color': '#000',
      'line-width': 1
    }
  });
});

// Change the cursor to a pointer when over countries
map.on('mouseenter', 'country-fills', () => {
  map.getCanvas().style.cursor = 'pointer';
});

// Change it back to default when not over countries
map.on('mouseleave', 'country-fills', () => {
  map.getCanvas().style.cursor = '';
});

// Add click event to display a popup
map.on('click', 'country-fills', (e) => {
  const country = e.features[0];
  const countryName = country.properties.name_en;
// Example with additional country data
const isoCode = country.properties.iso_3166_1_alpha_3;

new mapboxgl.Popup()
  .setLngLat(e.lngLat)
  .setHTML(`
    <h3>${countryName}</h3>
    <h4>Guide Name: Josh</h4>
    <p>ISO Code: ${isoCode}</p>
    
    
  `)
  .addTo(map);

});
