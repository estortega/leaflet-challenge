// Create the 'basemap' tile layer that will be the background of our map.
let basemap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
});

// OPTIONAL: Step 2
// Create the 'street' tile layer as a second background of the map
let street = L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors, HOT"
});

// Create the map object with center and zoom options.
let map = L.map("map", {
  center: [20, 0],
  zoom: 2,
  layers: [basemap]
});

// Then add the 'basemap' tile layer to the map.
basemap.addTo(map);
// OPTIONAL: Step 2
// Create the layer groups, base maps, and overlays for our two sets of data, earthquakes and tectonic_plates.
// Add a control to the map that will allow the user to change which layers are visible.
let earthquakes = new L.LayerGroup();
let tectonic_plates = new L.LayerGroup();

let baseMaps = {
  "Base Map": basemap,
  "Street Map": street
};

let overlays = {
  "Earthquakes": earthquakes,
  "Tectonic Plates": tectonic_plates
};

L.control.layers(baseMaps, overlays, {
  collapsed: false
}).addTo(map);

// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // This function returns the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude and depth of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
    function styleInfo(feature) {
      return {
        opacity: 1,
        fillOpacity: 1,
        fillColor: getColor(feature.geometry.coordinates[2]), // depth
        color: "#000000",
        radius: getRadius(feature.properties.mag),
        stroke: true,
        weight: 0.5
      };
    }
  }

  // This function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
    return depth > 90 ? "#d73027" :
    depth > 70 ? "#fc8d59" :
    depth > 50 ? "#fee08b" :
    depth > 30 ? "#d9ef8b" :
    depth > 10 ? "#91cf60" :
                 "#1a9850";
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    return magnitude === 0 ? 1 : magnitude * 4;
  }

  // Add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    // Turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        `Magnitude: ${feature.properties.mag}<br>Location: ${feature.properties.place}<br>Depth: ${feature.geometry.coordinates[2]}`
      );
    }
  // OPTIONAL: Step 2
  // Add the data to the earthquake layer instead of directly to the map.
}).addTo(earthquakes);

earthquakes.addTo(map);

  // Create a legend control object.
  let legend = L.control({
    position: "bottomright"
  });

  // Then add all the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");

    // Initialize depth intervals and colors for the legend
    let depths = [-10, 10, 30, 50, 70, 90];
    let colors = [
      "#1a9850",
      "#91cf60",
      "#d9ef8b",
      "#fee08b",
      "#fc8d59",
      "#d73027"
    ];

    // Loop through our depth intervals to generate a label with a colored square for each interval.
    for (let i = 0; i < depths.length; i++) {
      div.innerHTML +=
        `<i style="background:${colors[i]}"></i> ` +
        `${depths[i]}${depths[i + 1] ? "&ndash;" + depths[i + 1] + "<br>" : "+"}`;
    }

    return div;
  };

  // Finally, add the legend to the map.
  legend.addTo(map);

  // OPTIONAL: Step 2
  // Make a request to get our Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
    // Save the geoJSON data, along with style information, to the tectonic_plates layer.
    L.geoJson(plate_data, {
      color: "orange",
      weight: 2
    }).addTo(tectonic_plates);

    // Then add the tectonic_plates layer to the map.
    tectonic_plates.addTo(map);
  });
});
