document.addEventListener('DOMContentLoaded', function () {
    var map = new maplibregl.Map({
        container: 'map',
        style: {
            version: 8,
            sources: {},
            layers: []
        }, // stylesheet location
        center: [85, 55], // starting position [lng, lat]
        zoom: 4 // starting zoom
    });

    map.on('load', function() {
        map.addSource("cities", {
            type: "geojson",
            data: "http://127.0.0.1:8000/cities/2020"
        })

        map.addLayer({
            'id': 'cities-layer',
            'source': 'cities',
            'type': 'circle',
            'paint': {
                'circle-stroke-width': 1,
                'circle-stroke-color': '#ffffff',
                'circle-radius': [
                    "match",
                    ["get", "group_name"],
                    "Малый город", 3,
                    "Средний город", 6,
                    "Большой город", 6,
                    "Крупный город", 8,
                    "Крупнейший город", 12,
                    0
                ],
                'circle-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'total_points'],
                    50,
                    "#d7191c",
                    150,
                    "#ffffbf",
                    250,
                    "#1a9641"
                ],
                'circle-opacity': 0.8
            }
        })

        map.on('click', 'cities-layer', function(e) {
            // console.log(e.features[0].properties.id)
            const city_id = e.features[0].properties.id
            fetch(`http://127.0.0.1:8000/city/${city_id}`)
                .then(response => response.json())
                .then(city_details => {
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
                })
            modalInteractive.show()
        })

        map.on('mouseenter', 'cities-layer', function() {
            map.getCanvas().style.cursor = 'pointer';
        })

        map.on('mouseleave', 'cities-layer', function() {
            map.getCanvas().style.cursor = ''
        })

        // Modal
        var modalInteractive = new bootstrap.Modal(document.getElementById("popup-modal"), {
            keyboard: false
        })
    })

})