window.addEventListener('load',function (e){

    let host = window.location.host == 'localhost:3000' ? '//' + window.location.host + '/assets/' : 'assets/';

    ymaps.ready(init);

   async function init() {
       // Загружаем GeoJSON файл, экспортированный из Конструктора карт.
       let response = await fetch(host +'delivery.geojson'); 
       let geodata = await response.json(); // читаем ответ в формате JSON

        initZoneMap(geodata)
    }

    function initZoneMap(geodata) {
        var map = new ymaps.Map('samiMap', {
                center: [37.62493141565861,55.70869574653657],
                zoom: 7,
                controls: ['zoomControl']
            })

            map.controls.get('zoomControl').options.set({size: 'small'});

        var searchControl = new ymaps.control.SearchControl({
            options: {
                size: 'auto',
                searchControlProvider: 'yandex#map',
                noPlacemark: true
            }
        });
        map.controls.add(searchControl);

        searchControl.events.add('resultselect', function (e) {
            var results = searchControl.getResultsArray();
            var selected = searchControl.getSelectedIndex();
            var coords = results[selected].geometry.getCoordinates();

            let polygon = deliveryZones.searchContaining(coords).get(0);
            let zone_id="Вне зоны доставки"
            let zone_color="#fff"
            if(polygon){
                zone_id=polygon.properties.balloonContent
                zone_color=polygon.properties.get('fill')
            }

            map.balloon.open(coords,
                {
                    contentHeader: results[selected].properties.get('balloonContent'),
                    contentBody: results[selected].properties.get('balloonContentBody'),
                    contentFooter: '<div>Входит в тариф доставки: <span style="background-color: '+zone_color+'">'+ zone_id+'</span></div>'
                })
        });

       var deliveryZones = ymaps.geoQuery(geodata).addToMap(map);

        var priceListZones = $('#delivery-zonez .delivery-row');
        // Задаём цвет и контент балунов полигонов.

        deliveryZones.each(function (obj, i) {
            obj.properties.balloonContent = obj.properties.get('description');
            let color = obj.properties.get('fill');
            obj.options.set({
                fillColor: color,
                fillOpacity: obj.properties.get('fill-opacity'),
                strokeColor: obj.properties.get('stroke'),
                strokeWidth: obj.properties.get('stroke-width'),
                strokeOpacity: obj.properties.get('stroke-opacity')
            });

            priceListZones.eq(i).find('.delivery-marker')
                .css('background-color', color)
                .parent().attr('data-color', color);
        });

        deliveryZones.addEvents('click', function (e) {
            var coords = e.get('coords');

            let poligon=e.get('target');
            let poligon_porp=poligon.properties;

            //Выделение выбранной зоны в списке 
            let arrBGcolor = hex2rgb(poligon.properties.get('fill'));
            let strBgColor = 'rgba(' + arrBGcolor.r + ',' + arrBGcolor.g + ',' + arrBGcolor.b+',0.2)';


            priceListZones.css('background-color', 'transparent');
            $('[data-color="' + poligon.properties.get('fill') + '"]').css('background-color', strBgColor);

            map.balloon.open(coords,
                {
                    //contentHeader: 'Вы выбрали адрес',
                    contentBody: poligon_porp.balloonContent,
                    //contentFooter: ballonResponse,
                }
            );
        })

     }
})

//Конврация цвета из HEX в RGB
function hex2rgb(c) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(c);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
} 