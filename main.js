mapboxgl.accessToken = 'pk.eyJ1IjoiZ2hlcm1hbnQiLCJhIjoiY2pncDUwcnRmNDQ4ZjJ4czdjZXMzaHZpNyJ9.3rFyYRRtvLUngHm027HZ7A'; // <-- PUT YOUR MAPBOX ACCESSTOKEN
var map = new mapboxgl.Map({
    container: 'map', // container id 
    style: 'mapbox://styles/ghermant/ckxn3cocf4fah14mmwmy7ieu0', // YOUR TURN: choose a style: https://docs.mapbox.com/api/maps/#styles
    center: [37.625, 55.751], // starting position [lng, lat]
    zoom: 5, // starting zoom
    maxZoom: 10
});

document.addEventListener('DOMContentLoaded', function () {

    map.on('load', function () {
        // console.log(data)
        map.addSource('cities', {
            type: 'geojson',
            data: `http://localhost:8000/cities/2020`
        });

        map.addLayer({
            'id': 'cities-layer',
            'source': 'cities',
            'type': 'circle',
            'paint': {
                'circle-stroke-width': 1,
                'circle-stroke-color': '#FFFFFF',
                // DOCS: https://docs.mapbox.com/help/tutorials/mapbox-gl-js-expressions/
                // SELECT MIN(total_points), MAX(total_points) FROM cities
                'circle-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'total_points'],
                    50,
                    '#d7191c',
                    150,
                    '#ffffbf',
                    250,
                    '#1a9641'
                ],
                'circle-opacity': 0.8,
                // 'circle-radius': ['/', ['get', 'people_count'], 100]
                // DOCS: https://docs.mapbox.com/mapbox-gl-js/example/data-driven-circle-colors/
                // SELECT DISTINCT group_name FROM cities
                'circle-radius': [
                    "match",
                    ['get', 'group_name'],
                    'Малый город', 3,
                    'Средний город', 6,
                    'Большой город', 6,
                    'Крупный город', 8,
                    'Крупнейший город', 12,
                    /* other */ 0
                ]
            }
        });
    })
})


function set_year(year) {
    map.getSource('cities').setData(`http://localhost:8000/cities/${year}`)
}

document.getElementById("year-selector").addEventListener('change', function () { set_year(this.value) })

// When a click event occurs on a feature in the clusters layer, open a modal
map.on('click', 'cities-layer', function (e) {
    var features = map.queryRenderedFeatures(e.point, {
        layers: ['cities-layer']
    });

    var city_id = features[0].properties.id
    console.log(city_id)
    fetch(`http://localhost:8000/city/${city_id}`)
        .then(response => response.json())
        .then(city_details => {
            console.log(city_details)
            document.getElementById("inside-modal").innerHTML = `<h1>${city_details.name}</h1>
            <img src="${city_details.emblem_url}">
            <h3>Численность населения</h3><h2>${city_details.people_count}</h2>
            <h3>Индекс качества городской среды</h3><h2>${city_details.total_points} / 360</h2>
            <hr>
            <h3>Жилье и прилегающие пространства</h3><h2>${city_details.house_points} / 60</h2>
            <h3>Озелененные пространства</h3><h2>${city_details.park_points} / 60</h2>
            <h3>Общественно-деловая инфраструктура</h3><h2>${city_details.business_points} / 60</h2>
            <h3>Социально-досуговая инфраструктура</h3><h2>${city_details.social_points} / 60</h2>
            <h3>Улично-дорожная</h3><h2>${city_details.street_points} / 60</h2>
            <h3>Общегородское пространство</h3><h2>${city_details.common_points} / 60</h2>`
            modalInteractive.show()
        })

    
});

// Change the cursor to a pointer when the mouse is over the places layer.
map.on('mouseenter', 'cities-layer', function () {
    map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'cities-layer', function () {
    map.getCanvas().style.cursor = '';
});



// Modal
var modalInteractive = new bootstrap.Modal(document.getElementById("popup-modal"), {
    keyboard: false
})




