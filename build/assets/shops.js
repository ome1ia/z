//Поиск магазинов

window.addEventListener("load", (e) => {
    (function () {
        if ($('.shop-input').length == 0){
            return;
        }
        let el = document.querySelector('.shop-input')
        el.addEventListener('change', function (e) {
            let res = getselectetdDataoption()
            if (document.getElementById(res)) {
                showShop(res)
                cleanData()
            }
        })

        el.addEventListener('input', function (e) {
            let str_search = e.target.value
            if (str_search.length > 0) {
                let res = compareAdress(str_search.toLowerCase())
                if (Object.keys(res).length > 0) {
                    addToDataList(res)
                }
            } else {
                let parent_el_id = "shops_adress"
                let parent_el = document.getElementById(parent_el_id)
                if (parent_el.childElementCount > 0) {
                    cleanData()
                }

            }

        })

        function cleanData() {
            let parent_el_id = "shops_adress"
            let parent_el = document.getElementById(parent_el_id)
            parent_el.innerHTML = ''
        }

        function showShop(shop_id) {
            document.getElementById(shop_id).click()
        }

        function getselectetdDataoption() {
            let parent_el_id = "shops_adress"
            let input_el_id = "shop-input"

            let parent_el = document.getElementById(parent_el_id)
            let el_input = document.getElementById(input_el_id)
            const options = document.querySelectorAll(`#${parent_el_id} div`);
            let res = false
            for (var i = 0; i < options.length; i++) {
                if (options[i].innerHTML == el_input.value) {
                    res = options[i].dataset.shop_id;
                    break;
                }
            }
            return res
        }

        function addToDataList(res) {
            let parent_el_id = "shops_adress"
            let parent_el = document.getElementById(parent_el_id)
            parent_el.innerHTML = ''

            for (const key in res) {
                let item = res[key]

                let option = document.createElement('div');
                option.innerHTML = item[item['data_index']]
                //   option.innerHTML = item['data_index'] + ": " + item[item['data_index']]
                option.dataset.shop_id = item['shop_id']
                parent_el.appendChild(option);

                option.addEventListener('click', function() {
                    const res = this.dataset.shop_id;
                    document.getElementById('shop-input').value = this.innerHTML;
                    showShop(res)
                    cleanData()
                });
            }
        }

        function compareAdress(str_search) {
            
            let shop_attr = getShopsAtributes()
            const entries = Object.entries(shop_attr)

            let flag_search = []

            entries.forEach(function (el) {
                let arr = el[1]

                const values = Object.values(el[1])
                const keys = Object.keys(el[1])

                values.forEach(function (elem, indx) {

                    if (elem) {
                        let q = elem.toLowerCase()
                        if (q.indexOf(str_search) >= 0) {
                            el[1]['data_index'] = keys[indx]
                            el[1]['shop_id'] = el[0]
                            flag_search[el[0]] = el[1]
                        }
                    }
                })
            })
            return flag_search
        }


        function getShopsAtributes() {
            let shop_attr = {}
            let els = document.querySelectorAll('ul.shop-list li')

            els.forEach(function (el, i) {
                let id_shop = el.getAttribute('id')
                let metro, tc_name, adress
                if (el.querySelector('.shop-list__metro')) {
                    metro = el.querySelector('.shop-list__metro').innerHTML
                }
                if (el.querySelector('.shop-list__title')) {
                    tc_name = el.querySelector('.shop-list__title').innerHTML
                }
                if (el.querySelector('.shop-list__address')) {
                    adress = el.querySelector('.shop-list__address').innerHTML
                }
                shop_attr[id_shop] = { adress: adress, tc_name: tc_name, metro: metro }
            })

            return shop_attr;
        }
    })()
})



//Магазины на карте
$(document).ready(function(){
    
    if ($('#shop-map').length > 0) {

        var shopLocation = [55.707540, 37.591484], shopMap;

        function initshopMap() {
            // если карта уже есть, убираем её
            if (shopMap) {
                shopMap.destroy();
            }

            //создаем новую карту
            shopMap = new ymaps.Map('shop-map', {
                center: shopLocation,
                zoom: 15,
                controls: []
            });
            shopMap.behaviors.disable('scrollZoom');


            //создаем и добавляем на карту маленький зум
            var zoomControl = new ymaps.control.ZoomControl({
                options: {
                    size: 'small',
                    position: {
                        top: 10,
                        right: 10
                    }
                }
            });
            shopMap.controls.add(zoomControl);

            //на тач-устройствах выклаючаем перетаскивание карты по свайпу 1 пальцем, если свайп двумя пальцами, то включаем
            // showTooltip('#shop-map', shopMap);

            //создаем и добавляем отметку с центральным офисом на карту
            var placemarkOffice = new ymaps.Placemark(shopLocation, {}, {
                iconLayout: 'default#image',
                // Своё изображение иконки метки.
                // iconImageHref: '/static/img/svg/pin.svg',
                iconImageHref: './img/pin.svg',
                // Размеры метки.
                iconImageSize: [43, 49],
                // Смещение левого верхнего угла иконки относительно
                // её точки привязки.
                iconImageOffset: [-20, -40],
                balloonPanelMaxMapArea: 0
            });

            shopMap.geoObjects.add(placemarkOffice);
            shopMap.setCenter(shopLocation);

            if ($('.js-show-route').length > 0) {
                $(document).on('click', '.js-show-route', function (e) {
                    e.preventDefault();
                    // Добавим на карту схему проезда
                    ymaps.geolocation.get({
                        provider: 'yandex',
                        mapStateAutoApply: true
                    }).then(function (result) {
                        // Объявляем набор опорных точек и массив индексов транзитных точек.
                        var referencePoints = [
                            result.geoObjects.position,
                            shopLocation
                        ],
                            viaIndexes = [0];

                        // Создаем мультимаршрут и настраиваем его внешний вид с помощью опций.

                        var multiRoute = new ymaps.multiRouter.MultiRoute({
                            referencePoints: referencePoints
                        }, {
                            // Внешний вид путевых точек.
                            // Для начальной точки
                            wayPointStartIconLayout: 'default#image',
                            wayPointStartIconImageHref: './img/pin.svg',
                            // wayPointStartIconImageHref: './img/svg/pin.svg',
                            wayPointStartIconImageSize: [30, 30],
                            wayPointStartIconImageOffset: [-15, -32],
                            // Для последней путевой точки.
                            wayPointFinishIconLayout: 'default#image',
                            wayPointFinishIconImageHref: './static/img/svg/pin_office.svg',
                            // wayPointFinishIconImageHref: './img/svg/pin_office.svg',
                            wayPointFinishIconImageSize: [73, 89],
                            wayPointFinishIconImageOffset: [-35, -89],
                            // Позволяет скрыть иконки путевых точек маршрута.
                            // wayPointVisible:false,

                            // Внешний вид транзитных точек.
                            viaPointIconRadius: 7,
                            viaPointIconFillColor: '#000088',
                            viaPointActiveIconFillColor: '#E63E92',
                            // Транзитные точки можно перетаскивать, при этом
                            // маршрут будет перестраиваться.
                            viaPointDraggable: true,
                            // Позволяет скрыть иконки транзитных точек маршрута.
                            // viaPointVisible:false,

                            // Внешний вид точечных маркеров под путевыми точками.
                            pinIconFillColor: '#000088',
                            pinActiveIconFillColor: '#27979d',
                            // Позволяет скрыть точечные маркеры путевых точек.
                            // pinVisible:false,

                            // Внешний вид линии маршрута (неактивного и активного).
                            routeStrokeWidth: 6,
                            routeStrokeColor: '#000000',
                            routeStrokeOpacity: '0.7',
                            routeActiveStrokeWidth: 6,
                            routeActiveStrokeColor: '#27979d',
                            routeActiveStrokeOpacity: '0.9',

                            // Внешний вид линии пешеходного маршрута.
                            routeActivePedestrianSegmentStrokeStyle: 'solid',
                            routeActivePedestrianSegmentStrokeColor: '#00CDCD',

                            // Автоматически устанавливать границы карты так, чтобы маршрут был виден целиком.
                            boundsAutoApply: true
                        });

                        // Добавляем мультимаршрут на карту.
                        shopMap.geoObjects.add(multiRoute);
                    })
                });
            }
        }

        
    }



    if ($('#shops-map').length > 0) {
        var arSubway = [];
        var subways = {
            "Бабушкинская": "babushkinskay",
            "Динамо": "dinamo",
            "Бульвар Дмитрия Донского": "dmitriyDonskogo",
            "Калужская": "kalushkay",
            "Кожуховская": "kozhuhovskay",
            "Проспект Мира": "mira",
            "Петровско-Разумовская": "petrovskoRazumovskay",
            "Юго-Западная": "ugoZapadnay",
            "Дубровка": "dubrovka",
        };
        var shopsMap, selectedCity, clustererShop,
            shopPoints = [];

        // Параметры для кластера
        var clusterIcons = [
            {
                href: './img/map/map_pin_empty.svg',
                size: [41, 41],
                // Отступ, чтобы центр картинки совпадал с центром кластера.
                offset: [-15, -39]
            },
            {
                href: './img/map/map_pin_empty.svg',
                size: [53, 59],
                offset: [-25, -59]
            }],
            clusterIconsYellow = [
                {
                    href: './img/map/yell-cluster.svg',
                    size: [41, 41],
                    // Отступ, чтобы центр картинки совпадал с центром кластера.
                    offset: [-15, -39]
                },
                {
                    href: './img/map/yell-cluster.svg',
                    size: [53, 59],
                    offset: [-25, -59]
                }];

        var clusterNumbersShop = [100];

        var shopCategories = [
            { name: 'cats-and-dogs', style: 'shop-list-availability__item_cat', prompt: "Котята и щенки" },
            { name: 'birds-and-rodents', style: 'shop-list-availability__item_bird', prompt: "Птицы и грызуны" },
            { name: 'veterinary-pharmacy', style: 'shop-list-availability__item_vet', prompt: "Ветеринарная аптека" },
            { name: 'veterinary-clinic', style: 'shop-list-availability__item_vet_clinic', prompt: "Ветеринарная клиника" },
            { name: 'grooming', style: 'shop-list-availability__item_grooming', prompt: "Груминг-салон" },
            { name: 'aquaristics', style: 'shop-list-availability__item_aqua', prompt: "Аквариумистика" },
            { name: 'live-fish', style: 'shop-list-availability__item_fish', prompt: "Живые рыбы" },
            { name: 'engraving', style: 'shop-list-availability__item_engraving', prompt: "Гравировка" },
            { name: 'plants', style: 'shop-list-availability__item_plants', prompt: "Живые растения для аквариумов" },
            { name: 'reptilii', style: 'shop-list-availability__item_reptilii', prompt: "Рептилии" },
            { name: 'korma', style: 'shop-list-availability__item_korma', prompt: "Живые и замороженные корма" },
            { name: 'terrariumistika', style: 'shop-list-availability__item_terrariumistika', prompt: "Террариумистика" }
        ];
        

        /**
         * Строит боковую панель со списком магазинов
         */
        function renderAsidePanel(shopsArray) {
            var $shopList = $(document.createElement('ul'));
            $shopList.addClass('shop-list');

            shopsArray.forEach(function (shopPoint) {
                var $shopListItem = $(document.createElement('li'));
                $shopListItem.addClass('shop-list__item');
                $shopListItem.attr('id', shopPoint.id);

                var 
                    $shopListLeft = $(document.createElement('div')),
                    $shopListRight = $(document.createElement('div')),
                    $shopListTitle = $(document.createElement('h3')),
                    $shopListAddress = $(document.createElement('p')),
                    $shopListSubway = $(document.createElement('div')),
                    $shopListPhone = $(document.createElement('p')),
                    $shopListTime = $(document.createElement('p')),
                    $shopListLink = $(document.createElement('div')),
                    $shopListCategs = $(document.createElement('div')),
                    $shopTypePin = $(document.createElement('div'));

                $shopListLeft.addClass('shop-left-column');
                $shopListRight.addClass('shop-right-column');



                if (typeof shopPoint.shopName === 'string') {
                    $shopListTitle.addClass('shop-list__title');
                    $shopListTitle.html(shopPoint.shopName);
                } else {
                    $shopListTitle = null;
                }

                if (typeof shopPoint.address === 'string') {
                    $shopListAddress.addClass('shop-list__address');
                    $shopListAddress.html(shopPoint.address);
                } else {
                    $shopListAddress = null;
                }

                if (shopPoint.subway && typeof shopPoint.subway === 'string') {
                    $shopListSubway.addClass('shop-list__metro');
                    arSubway = shopPoint.subway;
                    arSubway = arSubway.split(',');
                    arSubway.forEach(function (subway) {
                        subway = subway.replace(/м\./g, '').trim();
                        if (subways[subway] != undefined) {
                            $shopListSubway.addClass('shop-list__metro-' + subways[subway]);
                        }
                    });
                    $shopListSubway.html(shopPoint.subway);
                } else {
                    $shopListSubway = null;
                }

                if (typeof shopPoint.phoneNumber === 'string') {
                    $shopListPhone.addClass('shop-list__phone');
                    $shopListPhone.html(shopPoint.phoneNumber);
                } else {
                    $shopListPhone = null;
                }

                if (typeof shopPoint.workingHours === 'string') {
                    $shopListTime.addClass('shop-list__time');
                    $shopListTime.html(shopPoint.workingHours);
                } else {
                    $shopListTime = null;
                }

                if (typeof shopPoint.url === 'string') {
                    $shopListLink.addClass('shop-list__link');
                    $shopListLink.html('<a class="more" href="' + shopPoint.url + '">Подробнее</a>');
                } else {
                    $shopListLink = null;
                }

                $shopListCategs.addClass('shop-list-availability');
                var countCateg = shopPoint.categories;

                if (countCateg['veterinary-clinic']) {
                    $shopListCategs.attr('data-pin', 'pin-cross');
                }


                for (var key in countCateg) { //считаем сколько категорий у магазина и если все выводим надпись 'все категории'
                    
                    if (countCateg[key] === false) {
                        delete countCateg[key];
                    }
                }
                //if (Object.keys(countCateg).length < 8) { 
                    var numPrompt = 1;
                    var fullLen = Object.keys(countCateg).length;
                    shopCategories.forEach(function (categ) {
                        if (shopPoint.categories[categ.name] === true && categ.style) {
                            var span = $(document.createElement('span'));
                            var spanPrompt = $(document.createElement('span'));
                            span.addClass('shop-list-availability__item');
                            span.addClass(categ.style);
                            span.attr("onmouseenter", "$(this).find('span').css('display', 'block');");
                            span.attr("onmouseleave", "$(this).find('span').css('display', 'none');");

                            spanPrompt.addClass('shop-list-availability__prompt' + numPrompt);
                            spanPrompt.text(categ.prompt);
                            span.append(spanPrompt);
                            $shopListCategs.append(span);

                            if (fullLen > 6) {
                                let addClassCount = fullLen - 6;
                                $shopListCategs.attr('data-more', '+'+addClassCount);
                            }

                            numPrompt = numPrompt + 1;
                        }
                    });
                    delete numPrompt;

               /* } else {
                    var span = $(document.createElement('span'));
                    span.addClass("all-categories");
                    span.text("Все");
                    $shopListCategs.append(span);
                }*/

                delete countCateg;
                
                $shopListLeft.append($shopListSubway, $shopListTitle, $shopListTime, $shopListAddress, $shopListPhone, $shopListLink);
                $shopListRight.append($shopListCategs);

                if ($shopListCategs.data('pin')){
                    $shopListRight.addClass($shopListCategs.data('pin'));
                }

                $shopListItem.append($shopListLeft, $shopListRight);
                $shopList.append($shopListItem);
            });

            $('#shops-list-panel').append($shopList);
        }

        /**
         * Строит карту
         */
        function initShopsMap(city) {
            // если карта уже есть, убираем её
            if (shopsMap) {
                shopsMap.destroy();
                shopsMap = null;
            }

            // создаем яндекс карту
            shopsMap = new ymaps.Map('shops-map', {
                center: [55.751574, 37.573856],
                zoom: 9,
                controls: ['searchControl']
            },
                {
                    // Будет производиться поиск по топонимам и организациям.
                    searchControlProvider: 'yandex#map',
                    suppressMapOpenBlock: true
                });
            // создаем и добавляем маленький зум
            var zoomControl = new ymaps.control.ZoomControl({
                options: {
                    size: 'small',
                    position: {
                        top: 10,
                        right: 10,
                    }
                }
            });

            shopsMap.controls.add(zoomControl);
            shopsMap.options.set('scrollZoomSpeed', 3);


            //shopsMap.behaviors.disable('scrollZoom');

            var filteredCity = [];

            /**
             * Функция запускается один раз для заданного города. Проверяется город,
             * рендерятся метки и кластеры, настраивается зум
             */
            function checkState(city) {
                // если город не выбран, по умолчанию ставим Москву
                var currentCityId = city || 'city-1';

                // создаем массив магазинов, находящихся в заданном городе

                filteredCity = shopPoints.slice();
                /*
                filteredCity = shopPoints.filter(function(item) {
                    return item.cityId === currentCityId;
                });
                */

                setShopPoints();

                /**
                 * Спозиционируем карту так, чтобы на ней были видны все объекты.
                 */
                shopsMap.setBounds(shopsMap.geoObjects.getBounds(), {
                    checkZoomRange: true,
                    zoomMargin: 10
                });

                
            }

            /**
             * Построение меток и кластеров
             */
            function setShopPoints() {
                // создаем массив с координатами магазинов
                var shopArr = filteredCity.slice();

                var placeMarks = [];

                //создаем кастомную метку
                var setshopPointOptions = function () {
                    return {
                        // Опции кастомной метки
                        // Необходимо указать данный тип макета.
                        iconLayout: 'default#image',
                        // Своё изображение иконки метки.
                        iconImageHref: './img/map/map_pin.svg',
                        //preset: "twirl#yellowStretchyIcon",
                        // Размеры метки.

                        iconImageSize: [41, 52],

                        // Смещение левого верхнего угла иконки относительно
                        // её "ножки" (точки привязки).
                        iconImageOffset: [-12, -34],

                        balloonPanelMaxMapArea: 0

                    };
 
                };

                /**
                 * Общий обработчик, срабатывающий при клике и на метку, и на элемент боковой панели
                 */
                function setClickCommonHandler(placemark) {
                    var $listPanel = $('#shops-list-panel'),
                        $shopListItem = $(document.getElementById(placemark.id));

                    //возвращаем всем меткам и кластерам исходный вид
                    placeMarks.forEach(function (point) {

                        point.options.set('iconImageHref', './img/map/map_pin.svg');

                        if (point.isVeterinaryClinic === true) {
                            point.options.set('iconImageHref', './img/map/green-cross.svg');
                        }

                        if (clustererShop.getObjectState(point).cluster) {
                            clustererShop.getObjectState(point).cluster.options.set('clusterIcons', clusterIcons);
                        }
                        point.isActive = false;
                    });

                    //если метка в кластере, соответствующий кластер будет подсвечен
                    if (clustererShop.getObjectState(placemark).isClustered) {
                        clustererShop.getObjectState(placemark).cluster.options.set('clusterIcons', clusterIconsYellow);
                    }

                    //подсветка метки на карте
                    if (placemark.isVeterinaryClinic){
                        placemark.options.set('iconImageHref', './img/map/choice-cross.svg');
                    }else{
                        placemark.options.set('iconImageHref', './img/map/choise-shop.svg');
                    }
                   
                    placemark.isActive = true;

                    //подсветка магазина в панели слева
                    $listPanel.find('.is-active').removeClass('is-active');
                    $shopListItem.addClass('is-active');

                    $('[data-shop-list]').mCustomScrollbar("scrollTo", '#' + placemark.id);
                }

                /**
                 * При клике на метку запускается данный обработчик
                 */
                function setShopPointClickHandler(e) {
                    var placemark = e.get('target');
                    setClickCommonHandler(placemark);



    /* #########################  ОСНОВНОЙ ОФИС В КОНТАКТАХ   ########################################## */


                    //У основного офиса добавлен параметр isMain : true и для нужно открывать балун
                    shopsMap.panTo(placemark.geometry.getCoordinates(), { flying: true });
                    
                    if (placemark.isMain){
                        let balloon_content = '';
                        var myBalloonCloseButtonLayout = ymaps.templateLayoutFactory.createClass('×' +'');

                        let object = samizoo_shops[0];
                        balloon_content = '<div class="custom-baloon shop-left-column" style="width: 300px; padding: 15px">';
                        balloon_content += '<button id="close-baloon" type="button" class="fancybox-button fancybox-close-small"><svg xmlns="http://www.w3.org/2000/svg" version="1" viewBox="0 0 24 24"><path d="M13 12l5-5-1-1-5 5-5-5-1 1 5 5-5 5 1 1 5-5 5 5 1-1z"></path></svg></button>';
                        balloon_content += '<h3 class="shop-list__title">' + object.shopName +'</h3>';
                        balloon_content += '<div class="shop-list__metro">' + object.subway +'</div>';
                        balloon_content += '<p class="shop-list__address">' + object.address +'</p>';
                        balloon_content += '<p class="shop-list__phone">' + object.phoneNumber +'</p>';
                        balloon_content += ' <p class="shop-list__time">' + object.workingHours +'</p>';
                        balloon_content+= '</div>';

                        var balloon = shopsMap.balloon.open(placemark.geometry.getCoordinates(), { content: balloon_content }, { closeButton: true, maxWidth: '320px' });
                        
                        
                    }
                   
                }
                /**
                 * 
                 *
                 
                 <div class="shop-list__link">
                 <a class="more" href="/shops/trts-aviapark/">Подробнее</a>
                 </div>
                 </div>
                 */

                /**
                 * При клике на выбранный магазин запускается данный обработчик
                 */
                function setShopListItemClickHandler(placemark, e) {
                    setClickCommonHandler(placemark);

                    var zoom = (shopsMap.getZoom() === 9) ? shopsMap.getZoom() : 9;
                    while (true) {
                        shopsMap.setCenter(placemark.geometry.getCoordinates(), zoom++);
                        if (!clustererShop || !clustererShop.getObjectState(placemark).isClustered) break;
                    }
                }


                //Создадим кластеризатор, вызвав функцию-конструктор.
                if (clustererShop) {
                    clustererShop.removeAll();
                }

                // Сделаем макет содержимого иконки кластера, в котором цифры будут раскрашены в розовый цвет.
                var MyIconContentLayoutShop = ymaps.templateLayoutFactory.createClass(

                    '<div style="color: #A72755; font-weight: 400; line-height: 40px; font-size: 16px; text-align: center; font-family: circle, Ubuntu, Helvetica, Helvetica CY, Arial, Nimbus Sans L, sans-serif;">{{ properties.geoObjects.length }}</div>'),

                    clustererShop = new ymaps.Clusterer({
                        clusterIcons: clusterIcons,
                        clusterNumbers: clusterNumbersShop,
                        clusterIconContentLayout: MyIconContentLayoutShop
                    });

                //строим боковую панель
                renderAsidePanel(shopArr);

                // для каждой точки создаем метку и добавляем её на карту
                shopArr.forEach(function (shop, i) {
                    var coordinates;
                    if (Array.isArray(shop.coordinates)) {
                        coordinates = shop.coordinates.map(parseFloat);
                    }
                    else {
                        coordinates = [55.75222, 37.61556];
                    }
                    placeMarks[i] = new ymaps.Placemark(coordinates, {}, setshopPointOptions());
                    placeMarks[i].id = shop.id;
                    placeMarks[i].isMain = shop.isMain || false;
                    placeMarks[i].events.add('click', setShopPointClickHandler);

                    placeMarks[i].isVeterinaryClinic = window.samizooVeterinaryClinics.includes(shop.shopId);


                    //при клике на любой магазин в панеле слева, срабатывает соответстующая точка на карте
                    $(document.getElementById(shop.id)).on('click', function (event) {
                        //placeMarks[i].events.fire('click');
                        setShopListItemClickHandler(placeMarks[i], event);
                    });

                    shopsMap.geoObjects.add(placeMarks[i]);
                });

                //checkAvailability();
                shopCategories.forEach(function (item) {
                    $('#' + item.name).click(checkAvailability);
                });

                $('#reset-filter').on('click', function () {
                    $(this).siblings().find('input').prop('checked', false);
                    checkAvailability();
                })


                placeMarks.forEach(function (placeMark, index) {
                    if (placeMark.isVeterinaryClinic === true) {
                        placeMarks[index].options.set('iconImageHref', './img/map/green-cross.svg');
                    }
                });


                /**
                 * Проверяет, соответствует ли элемент требуемым условиям, если нет, скрываем его и удаляем из кластера,
                 * а также скрываем соответствующий элемент из боковой панели
                 */
                function checkAvailability() {
                    
                    if ($('#shop-filter').length == 0) return false;

                    if ($(this).hasClass("checked")) {
                        $(this).removeClass("checked");
                    } else {
                        $(this).addClass("checked");
                    }
                    var num = $(".checked").length;
                    $(".shop-filter__types-num").text(num - 1);

                    placeMarks.forEach(function (item, i) {
                        item.options.set('visible', true);
                        clustererShop.add(item);
                        document.getElementById(shopArr[i].id).style = null;
                        
                    });


                    checkClusterState();
                    shopCategories.forEach(function (categ) {
                        if ($('#' + categ.name).prop('checked')) {
                            placeMarks.forEach(function (item, i) {
                                if (!shopArr[i].categories[categ.name] === true) {
                                    item.options.set('visible', false);
                                    clustererShop.remove(item);
                                    document.getElementById(shopArr[i].id).style.display = 'none';
                                    
                                }
                            });
                        }
                    });
                    

                    if ($('.shop-list__item.is-active').css('display') !== 'none') {
                        $('[data-shop-list]').mCustomScrollbar("scrollTo", '.shop-list__item.is-active');
                    }

                    if ($('.shop-list__item').length == $('.shop-list__item[style="display: none;"]').length){
                        $('.js-list-reset').fadeIn();
                        $('.js-list-reset').on('click', function(){
                            $(this).fadeOut();
                            $('#reset-filter').trigger('click');
                        })
                    }

                    
                    
                }

                /**
                * Проверяет на каждый элемент, входит ли он в кластер, если да, подсвечен ли он.
                */
                function checkClusterState() {
                    placeMarks.forEach(function (item) {
                        if (clustererShop.getObjectState(item).isClustered && item.isActive === true) {
                            clustererShop.getObjectState(item).cluster.options.set('clusterIcons', clusterIconsYellow);
                        }
                    });

                    //Для одного адреса (В детальной и в контактах)
                    if (placeMarks.length == 1){
                        if (shopsMap.getZoom() > 20) shopsMap.setZoom(18);
                    }
                    
                }

                /**
                 * В кластеризатор можно добавить javascript-массив меток (не геоколлекцию) или одну метку.
                 * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/Clusterer.xml#add
                 */
                //добавляем все метки в кластеризатор
                clustererShop.add(placeMarks);

                

                //добавляем кластеризатор на карту
                shopsMap.geoObjects.add(clustererShop);

                clustererShop.options.set({

                    gridSize: 25,
                    zoomMargin: 0,
                });

                

                checkAvailability();

                //на каждое изменение состояния карты, состояние кластера должно быть актуальным
                shopsMap.events.add('boundschange', checkClusterState);
            }

            var openYMapButton = new ymaps.control.Button({
                data: {
                    content: 'Открыть в Яндекс.Картах',
                    image: './img/yandex_icon.png'
                },
                options: {
                    maxWidth: 210,
                    position: { left: '5px', bottom: '5px' }
                }
            });
            openYMapButton.events.add('click', function () {
                window.open('https://yandex.ru/maps/?display-text=Сами%20с%20усами&ll=37.430367%2C55.658487&mode=search&sll=37.604807%2C54.897340&sspn=10.408521%2C3.551360&text=%7B"text"%3A"Сами%20с%20усами"%2C"what"%3A%5B%7B"attr_name"%3A"chain_id"%2C"attr_values"%3A%5B"226588812501"%5D%7D%5D%7D&z=9.6');
            });
            shopsMap.controls.add(openYMapButton, {});

            checkState(city);

        }

    }


    if (window.samizoo_shops)
        shopPoints = window.samizoo_shops;

     ymaps.ready(function () {
        initShopsMap();
    });
    
});

