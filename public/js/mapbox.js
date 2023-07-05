console.log("Hello bobo")

// const locations = JSON.parse(document.getElementById("map").dataset.locations)
// console.log(locations)

//yung mapboxgl object may access dito kasi, naka import yung script tag through cdn
export const displayMap = (locations) => {
   mapboxgl.accessToken = 'pk.eyJ1IjoiYW5zci1ydnItMjAwMSIsImEiOiJjbGl5M3A0eDgwOGNxM21xcW1jamZ3eTZkIn0.ELzVoBRythAK8gp96dHj7g';

   var map = new mapboxgl.Map({
   container: 'map',
   style: 'mapbox://styles/ansr-rvr-2001/cliy5lf3800nb01pwclxtglg4',
   scrollZoom: false,
   });

      
   // setting the boundary (limit) of the map
   const bounds = new mapboxgl.LngLatBounds();

   locations.forEach(location => {
      // creating marker to mark each of the location
      const markerEl = document.createElement("div")
      markerEl.className = "marker"
   
      // adding the marker of each location coordinates
      new mapboxgl.Marker({
         element: markerEl,
         anchor: "bottom",
      })
      .setLngLat(location.coordinates) // input longitude first then lattitude
      .addTo(map)
   
      //adding a popup, this use together with the marker to provide info to the coordinate
      new mapboxgl.Popup({
         offset: 30 
      }).setLngLat(location.coordinates)
        .setHTML(`<p>Day ${location.day} : ${location.description}</p>`)
        .addTo(map)
   
      //extends the map boundary to include all the marker
      bounds.extend(location.coordinates)
   })
   
   //move(zoom,pan) the map according to the extended bounds
   map.fitBounds(bounds, {
     padding: {
        top: 200,
        bottom: 150,
        left: 100,
        right: 100
     }
   })

}









