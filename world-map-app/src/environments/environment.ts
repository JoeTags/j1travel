require('dotenv').config();
export const environment = {
  production: false,
  mapboxAccessToken:
    'pk.eyJ1Ijoiam9ldGFncyIsImEiOiJjbTJqb3dtcGgwODM5MmpwcHZ4c2h6dDRtIn0.bPNPVDTUWLLj7E6AKxJa-g',
  firebase: {
    apiKey: 'AIzaSyCXxA4Hu9PIqwWNjqPtO8vgLeWbwC0f_qI',
    authDomain: 'j1travel-b0bd6.firebaseapp.com',
    databaseURL: 'https://j1travel-b0bd6-default-rtdb.firebaseio.com',
    projectId: 'j1travel-b0bd6',
    storageBucket: 'j1travel-b0bd6.firebasestorage.app',
    messagingSenderId: '673576407154',
    appId: '1:673576407154:web:a49b36afe4f98f96b632eb',
    measurementId: 'G-LCTFMGJN1C',
  },
  key: 'AIzaSyB4cyyCB1CHCjPkNTxFQVG3wgf5aF9WQP8',
  stripe: process.env['STRIPE_SECRET'],
  publishable: process.env['STRIPE_PUBLISHABLE'],
};
