function main() {
    const client = new carto.Client({
    apiKey: 'XI8_L_AuNk3TqStmClmYfg',
    username: 'agilvarry'
  });
  
  var select = document.getElementById("select"),
  //array of trailheads
  arr = ['Riverside Walk Trailhead', 'Weeping Rock Trailhead', 'West Rim Trailhead', 'Grotto Trailhead', 'Emerald Pools Trailhead', 'Archeology Trailhead', 
  'Chinle Trailhead', 'Watchman Trailhead', 'Hop Valley Trailhead', 'Wildcat Canyon Trailhead', 'Lava Point Trailhead', 'Taylor Creek Trailhead', 
  'Lee Pass Trailhead', 'Timber Creek Overlook Trailhead', 'Left Fork Trailhead', ' Grapevine Trailhead', 'Right Fork Trailhead', 'Coalpits Wash', 
  'Huber Wash', 'Dalton Wash', 'East Rim Trailhead', 'Stave Spring Trailhead', 'Orderville Canyon Trailhead', 'East Mesa Trailhead', 
  "Barney's Trailhead", 'Lava Point Campground', 'Canyon Overlook Trailhead', 'Court of the Patriarchs Trailhead'];
  arr.sort()

let map = new L.Map('map', {
  center: [37.29, -113.02],
  zoomControl: false,
  zoom: 11,
  maxzoom: 15
});
//special zoom with home button
var zoomHome = L.Control.zoomHome();
zoomHome.addTo(map);
 
// Adding Voyager Basemap
const main = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png', {
  maxZoom: 15
}).addTo(map);

// Adding Voyager Labels
const labels = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png', {
  maxZoom: 18,
  zIndex: 10
}).addTo(map);
//custom mapbox tiles
const wes = L.tileLayer('https://api.mapbox.com/styles/v1/agilvarry/cjapm97ck36sh2rqoibdx95g5/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWdpbHZhcnJ5IiwiYSI6ImNqNmZqaWV6dTBoYXAzMm11NDJhbmFsaW0ifQ.XaYLUqcCpgz6Y17ygK4lZA',{
  maxZoom: 18
});

//initiate filters
let lengthFilter = new carto.filter.Range('miles', { lte: 15, gte: 0 });
let horseFilter = new carto.filter.Category('horse_use', { in: ['Allowed'] });
let trailheadFilter = new carto.filter.Category('name', {in: arr});

// //zion boundary
const boundaryDataset = new carto.source.Dataset(`zion`);
const boundaryStyle = new carto.style.CartoCSS('#layer {polygon-opacity: 0; line-width: 2; line-color: rgba(75,94,38,.9); line-opacity: 1; }');
const zionBoundary = new carto.layer.Layer(boundaryDataset, boundaryStyle);

//trails
const trailDataset = new carto.source.Dataset(`zion_trans_trail_ln`);
var trailStyle = new carto.style.CartoCSS('#layer {line-width: 2; line-color: #594316; line-opacity: 1 }');
trailDataset.addFilters([ lengthFilter, horseFilter ]);
const zionTrail = new carto.layer.Layer(trailDataset, trailStyle, {featureClickColumns: ['name', 'miles', 'horse_use']});

//trailheads
const trailheadDataset = new carto.source.Dataset('zion_trans_trailhead_pt');
var trailheadStyle = new carto.style.CartoCSS('#layer {marker-width: 10; marker-fill: #594316; marker-fill-opacity: 0.9; marker-allow-overlap: true; marker-line-width: 1; marker-line-color: #FFF; marker-line-opacity: 1;}');
trailheadDataset.addFilter(trailheadFilter);
const trailHeads = new carto.layer.Layer(trailheadDataset,trailheadStyle, {featureClickColumns: ['name']});
//viewpoints data
let viewpointsData = new carto.source.Dataset('viewpoints');
var viewstyle =  new carto.style.CartoCSS('#layer {marker-width: 10; marker-fill: #d35b7b; marker-fill-opacity: 0.9; marker-allow-overlap: true; marker-line-width: 1; marker-line-color: #FFF; marker-line-opacity: 1;}');
let viewPoints = new carto.layer.Layer(viewpointsData,viewstyle, {featureClickColumns: ['name','description','viewname']});

client.addLayers([zionBoundary, zionTrail, trailHeads,viewPoints]);

var sidebar = L.control.sidebar('sidebar').addTo(map);
sidebar.open('layerSelect');


viewPoints.on('featureClicked', openPopUp);
trailHeads.on('featureClicked', openPopUp);
zionTrail.on('featureClicked', openPopUp);

const popup = L.popup();
function openPopUp(featureEvent) {
  popup.setLatLng(featureEvent.latLng);
  if (!popup.isOpen()) {
    let content ='<div class="widget"><p class="lorem">';
    if (featureEvent.data.viewname) {
      content +=  '<b>Suggested Viewpoint</b><br><br> Name: ' + featureEvent.data.viewname +  '<br>' + 'Description: ' + featureEvent.data.description +  '<br><br>' + 'Submitted By: ' + featureEvent.data.name;
    }else if (featureEvent.data.miles) {
      content += '<b>Trail</b><br><br> Name: ' + featureEvent.data.name+  '<br>' + 'Horses Allowed: ' + featureEvent.data.horse_use +  '<br>' + 'Length: ' + featureEvent.data.miles;
    }else{
      content += '<b>Trailhead</b><br><br> Name: ' + featureEvent.data.name + '<br>';
    }
    content += '</p></div>'

    popup.setContent(content);
    popup.openOn(map);
  }
};


for(var i = 0; i < arr.length; i++){
var option = document.createElement("OPTION"),
txt = document.createTextNode(arr[i]);
option.appendChild(txt);
option.setAttribute("value",arr[i]);
select.insertBefore(option,select.lastChild);
}

const layers = client.getLayers();

client.getLeafletLayer().addTo(map);
//control adding/removing layers
$("input[name='layer']").change(function(){
  // Clear the sublayers
  layers.forEach((l) => l.hide());
  
  // For every check activated, add a sublayer
  $.each($("input[name='layer']:checked"), function(){
      layers[$(this).attr("id")].show();
  });
});
$("input[name='basemap']").change(function(){
  if (document.getElementById("main").checked) {
    
    map.removeLayer(wes);
    labels.addTo(map).bringToBack();
    main.addTo(map).bringToBack();
} else if (document.getElementById("other").checked) {
   map.removeLayer(labels);
   map.removeLayer(main);
   wes.addTo(map).bringToBack();
   
} else {alert("Basemap not found.")}
})

//control filter of horses allowed for trails
$('.horses').click(function() {
  if($('#Allowed').is(':checked')) { horseFilter.setFilters({ in: ['Allowed'] });  }
  else{ horseFilter.setFilters({ in: ['None'] });}
});

//jquery ui widgit
$( function() {
  $( "#slider-range" ).slider({
    range: true,
    min: 0,
    max: 15,
    step: 1,
    values: [ 0, 15 ],
    slide: function( event, ui ) {
      $( "#amount" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
      lengthFilter.setFilters({  gte: ui.values[0], lte: ui.values[1] });
    }
  });

  $( "#amount" ).val($("#slider-range").slider("values", 0) +
    " - " + $("#slider-range").slider("values", 1));
} );

function getUserLocation() {
  if("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) {
        var lat = position.coords.latitude,
        lon = position.coords.longitude;
       // marker.setLatLng([lat,lng]).addTo(map);
        document.getElementById('lat').value = lat;
        document.getElementById('lon').value = lon;

        L.marker([lat, lon]).addTo(map);
        

      })
    } else {
            // if browser doesn't support Geolocation
            alert("Geolocation is disabled. Please select location on the map instead.");
          }
  }
$( "#coords" ).click(function() {
  alert( "Click in the map to set the coordinates!" );
  map.on('click', function(e) {
   // marker.setLatLng(e.latlng).addTo(map);

    var lat = e.latlng.lat;
    var lng = e.latlng.lng;

    document.getElementById('lat').value = lat;
    document.getElementById('lon').value = lng;
  });
});

$( "#setView" ).click(function() {
  setData();
});

$( "#findTrail" ).click(function() {
  let trailhead = $("#select").children("option:selected").val()
  trailheadFilter.setFilters({like: trailhead});

  return  fetch(`https://agilvarry.carto.com/api/v2/sql?format=geojson&q=SELECT * FROM zion_trans_trailhead_pt where name Ilike '${trailhead}'`)
  .then((resp) => resp.json())
  .then((response) => {

    map.setView(response.features[0].geometry.coordinates.reverse(),13);  
  })
});

$( "#showAll" ).click(function() {
  trailheadFilter.setFilters({in: arr})
  map.setView([37.29, -113.02], 11);
});

function setData() {
  var userName = document.getElementById('name').value;
  var viewName = document.getElementById('viewpoint').value;
  var description = document.getElementById('description').value;
  var lat = document.getElementById('lat').value
  var lon = document.getElementById('lon').value

  if (!userName || !viewName || !description || !lat || !lon) {
    alert("Please enter values for all fields")
  } else {  
    
      var sql = "INSERT INTO viewpoints (the_geom, name, description, lat, lon, viewname) VALUES (ST_SetSRID(ST_GeomFromGeoJSON('";
      var sql2 = '{"type":"Point","coordinates":[' + lon + "," + lat + "]}'),4326),'" + userName + "','" + description + "','" + lat + "','" + lon +  "','" + viewName + "')";
      var pURL = sql+sql2;
      submitToProxy(pURL);
      
      
    } 
};
    // Submit data to the PHP using a jQuery Post method
    var submitToProxy = function(q){
      $.post( 'https://agilvarry.carto.com/api/v2/sql?q='+q+'&api_key=XI8_L_AuNk3TqStmClmYfg', function() {
        alert("Your contribution has been added")
        client.removeLayer(viewPoints);
      }).then(setTimeout(function(){ client.addLayer(viewPoints); }, 2000));
    };
    
    getUserLocation()
}
window.onload = main;