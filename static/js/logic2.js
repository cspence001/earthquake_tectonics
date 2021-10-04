// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
  console.log(data);
});

function createFeatures(earthquakeData) {
    
    function onEachLayer(feature) {
        return new L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
          radius: getRadius(feature.properties.mag),
          fillOpacity: 0.8,
          color: getColor(feature.geometry.coordinates[2]),
          fillColor: getColor(feature.geometry.coordinates[2])
        });
    }

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>Location: " + feature.properties.place +
        "</h3><hr><p><b>Date: </b>" + new Date(feature.properties.time) + "</p><p><b>Magnitude: </b>" + feature.properties.mag + "</p>" + "</p><p><b>Depth: </b>" + feature.geometry.coordinates[2] + "</p>");
    }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: onEachLayer
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var satmap = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Dark Map": darkmap,
    "Outdoors Map": satmap
  };


  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    Tectonic_Plates: tectonics
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [darkmap, satmap, earthquakes, tectonics]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend = L.control({
    position: 'bottomright'
});

/* Adding on the legend based off the color scheme we have */
legend.onAdd = function (color) {
    var div = L.DomUtil.create('div', 'info legend');
    depth = ["-10-10", "10-30", "30-50", "50-70", "70-90", "90+"];
    colors = ["#A3F600", "#DCF400", "#F7DB11", "#FDB72A", "#FCA35D", "#FF5F65"]
    div.innerHTML += "<h3>Depth</h3>"
    for (var i = 0; i < depth.length; i++) {
        div.innerHTML += '<i style="background:' + colors[i] + '"></i>' + depth[i] + '<br>';
    }
    return div;
}
legend.addTo(myMap);

}

function getColor(depth) {
    // Conditionals for magnitude
    if (depth >= 5) {
      return "#FF5F65";
    }
    else if (depth >= 4) {
      return "#FCA35D";
    }
    else if (depth>= 3) {
     return "#FDB72A";
    }
    else if (depth >= 2) {
      return "#F7DB11";
    }
    else if (depth >= 1) {
      return "#DCF400";
    }
    else {
      return "#A3F600";
    }
};

function getRadius(magnitude) {
    return magnitude ** 2;
  }


let tectonics = new L.layerGroup();
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json", function(geodata) {
    console.log(geodata);
    L.geoJSON(geodata, {
      style: {
        opacity:1,
        color: "#32a852",
        weight: 2.7
      }
    
    }).addTo(tectonics);
  });