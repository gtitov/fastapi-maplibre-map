document.addEventListener('DOMContentLoaded', function () {

    var map = new maplibregl.Map({
        container: 'map', // container id
        // DOCS: https://maplibre.org/maplibre-gl-js-docs/style-spec/
        style: {
            version: 8,
            sources: {},
            layers: []
        },
        center: [37.625, 55.751], // starting position [lng, lat]
        zoom: 5, // starting zoom
        maxZoom: 10
    });

    map.on('load', function () {
        // Basemap example
        // map.addSource('basemap', {
        //     'type': 'raster',
        //     // use the tiles option to specify a WMS tile source URL
        //     // https://docs.mapbox.com/mapbox-gl-js/style-spec/sources/
        //     'tiles': [
        //         'https://api.mapbox.com/styles/v1/ghermant/ckxn3cocf4fah14mmwmy7ieu0/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZ2hlcm1hbnQiLCJhIjoiY2pncDUwcnRmNDQ4ZjJ4czdjZXMzaHZpNyJ9.3rFyYRRtvLUngHm027HZ7A'
        //     ],
        //     'tileSize': 256
        // });
        // map.addLayer(
        //     {
        //         'id': 'basemap-layer',
        //         'type': 'raster',
        //         'source': 'basemap',
        //         'paint': {}
        //     }
        // );

        // DOCS: https://docs.mapbox.com/api/maps/vector-tiles/
        // https://api.mapbox.com/v4/{tileset_id}.json?access_token={access_token}
        map.addSource('countries', {
            'type': 'vector',
            'url': "https://api.mapbox.com/v4/ghermant.aq1p7k29.json?access_token=pk.eyJ1IjoiZ2hlcm1hbnQiLCJhIjoiY2pncDUwcnRmNDQ4ZjJ4czdjZXMzaHZpNyJ9.3rFyYRRtvLUngHm027HZ7A"
        });
        map.addLayer(
            {
                'id': 'countries-layer',
                'type': 'line',
                'source': 'countries',
                'source-layer': 'ne_110m_admin_0_countries-cz6wwp',
                'paint': {
                    "line-color": "blue",
                    "line-width": 3
                },
                'filter': ["==", ["get", "NAME"], "Russia"],
                "maxzoom": 4
            }
        );
        
        // QA: почему данные отображаются не на всех масштабных уровнях? https://docs.mapbox.com/help/troubleshooting/adjust-tileset-zoom-extent/
        map.addSource('districts', {
            'type': 'vector',
            'url': "https://api.mapbox.com/v4/ghermant.9hdnm6xy.json?access_token=pk.eyJ1IjoiZ2hlcm1hbnQiLCJhIjoiY2pncDUwcnRmNDQ4ZjJ4czdjZXMzaHZpNyJ9.3rFyYRRtvLUngHm027HZ7A"
        });
        map.addLayer(
            {
                'id': 'districts-layer',
                'type': 'line',
                'source': 'districts',
                'source-layer': 'districts-6qkevl',
                'paint': {
                    "line-color": "red",
                    "line-width": 3
                },
                'filter': ["==", ["get", "admin_level"], 4]
            }
        );
        map.addLayer(
            {
                'id': 'districts-fill',
                'type': 'fill',
                'source': 'districts',
                'source-layer': 'districts-6qkevl',
                'paint': {
                    "fill-opacity": 0
                },
                'filter': ["==", ["get", "admin_level"], 4]
            }
        );

        map.addSource('cities', {
            type: 'geojson',
            data: "https://oph9xu.deta.dev/cities/2020"  // <-- CHANGE ME!
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

        function set_year(year) {
            map.getSource('cities').setData(`https://oph9xu.deta.dev/cities/${year}`)  // <-- CHANGE ME!
        }

        document.getElementById("year-selector").addEventListener('change', function () { set_year(this.value) })

        // When a click event occurs on a feature in the clusters layer, open a modal
        map.on('click', 'cities-layer', function (e) {
            var features = map.queryRenderedFeatures(e.point, {
                layers: ['cities-layer']
            });

            var city_id = features[0].properties.id
            console.log(city_id)
            fetch(`https://oph9xu.deta.dev/city/${city_id}`)  // <-- CHANGE ME!
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

        map.on("click", "districts-fill", function(e) {
            var features = map.queryRenderedFeatures(e.point, {
                layers: ['districts-fill']
            });

            new maplibregl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(features[0].properties.local_name)
                .addTo(map);
        })

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
    })
})




