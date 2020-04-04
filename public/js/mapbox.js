export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiMDAwZXhjZWwiLCJhIjoiY2s4aW56OWM4MDM1YTNrcnc3eDZiYngzMyJ9.CdQ6duS7dAsrUzU6oVuHnw';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/000excel/ck8ionsyg15141iqcjywhugyg',
    scrollZoom: false,
    //   center: [-118.11, 34.11],
    //   zoom: 10,
    //intracrive: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    //Create Marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add PopUp
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extends map bound to include the current map
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
