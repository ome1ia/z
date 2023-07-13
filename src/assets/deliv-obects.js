
//Магазины на карте
$(document).ready(function () {

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
        }

    }



    if ($('#shops-map').length > 0) {

        var shopsMap, selectedCity, clustererShop,
            shopPoints = [];

        // Параметры для кластера
        var clusterIcons = [
            {
                href: './img/map/blue-cluster.svg',
                size: [41, 41],
                // Отступ, чтобы центр картинки совпадал с центром кластера.
                offset: [-15, -39]
            },
            {
                href: './img/map/blue-cluster.svg',
                size: [53, 59],
                offset: [-25, -59]
            }],
            clusterIconsYellow = [
                {
                    href: './img/map/blue-cluster.svg',
                    size: [41, 41],
                    // Отступ, чтобы центр картинки совпадал с центром кластера.
                    offset: [-15, -39]
                },
                {
                    href: './img/map/blue-cluster.svg',
                    size: [53, 59],
                    offset: [-25, -59]
                }];

        var clusterNumbersShop = [100];


        /**
         * Строит боковую панель со списком магазинов
         */
        function renderAsidePanel(shopsArray) {
            var $shopList = $(document.createElement('ul'));
            $shopList.addClass('delivery-list');

            shopsArray.forEach(function (shopPoint) {
                var $shopListItem = $(document.createElement('li'));
                $shopListItem.addClass('card-shop-list__item');


                var $shopListRow = $(document.createElement('div')),
                    $shopListAddress = $(document.createElement('div')),
                    $shopListAvail = $(document.createElement('div')),
                    $shopTypePin = $(document.createElement('div')),
                    $shopListLink = null;

                $shopListRow.addClass('table-row');

                let metroName = '';
                let $icon = '';
                if (typeof shopPoint.url === 'string') {
                    $shopListLink = '<br><a class="more js-detail" href="' + shopPoint.shopId + '">Подробнее</a>';
                }

                if (typeof shopPoint.address === 'string') {
                    $shopListAddress.addClass('table-cell __address');
                    let pinCol = shopPoint.shopColor ? shopPoint.shopColor : '#C02356';

                    if(shopPoint.subway){
                        metroName = shopPoint.subway;
                        $icon = '<i class="subway-icon" style="border-color: ' + pinCol +'"></i>';
                    }

                    let $metro = '<p class="metro">' + $icon + metroName+'</p>';
                    $shopListAddress.html($metro + shopPoint.address + $shopListLink);

                } else {
                    $shopListAddress = null;
                }  

                $shopListAvail.addClass('table-cell __button');

                let $btn = $('<div class="btn btn-transp r10" href="#">Выбрать</div>').appendTo($shopListAvail);
                $btn.attr('id', shopPoint.id);

                $shopListRow.append($shopListAddress, $shopListAvail);

                $shopListItem.append($shopListRow);
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
                        iconImageHref: './img/map/sdek-pin.svg',
                        //preset: "twirl#yellowStretchyIcon",
                        // Размеры метки.
                        iconImageSize: [41, 52],

                        // Смещение левого верхнего угла иконки относительно
                        // её "ножки" (точки привязки).
                        iconImageOffset: [-20, -45],
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
                    placeMarks.forEach(function (point, inx) {
                        if(inx % 2 == 0){
                            point.options.set('iconImageHref', './img/map/sdek-pin.svg');
                        }else{
                            point.options.set('iconImageHref', './img/map/boxberr-pin.svg');
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

                    placemark.isActive = true;

                    //подсветка магазина в панели слева
                    $listPanel.find('.btn.is-active').text('Выбрать').removeClass('is-active').closest('li').removeClass('is-active');
                    $shopListItem.text('Выбрано').addClass('is-active').closest('li').addClass('is-active');

                    $('[data-shop-list]').mCustomScrollbar("scrollTo", '#' + placemark.id);
                    const choiceShopIndex = shopPoints.findIndex(item => item.id === placemark.id);

                    //Сборка балуна

                    let balloon_content = '';
                    let object = shopPoints[choiceShopIndex];

                    balloon_content = '<div class="custom-baloon shop-left-column">';
                    balloon_content += '<button id="close-baloon" type="button" class="fancybox-button fancybox-close-small"><svg xmlns="http://www.w3.org/2000/svg" version="1" viewBox="0 0 24 24"><path d="M13 12l5-5-1-1-5 5-5-5-1 1 5 5-5 5 1 1 5-5 5 5 1-1z"></path></svg></button>';
                    balloon_content += '<h3 class="shop-list__title">' + object.shopName + '</h3>';
                    if (object.subway)
                    balloon_content += '<div class="shop-list__metro">' + object.subway + '</div>';
                    balloon_content += '<p class="shop-list__address">' + object.address + '</p>';
                    balloon_content += '<p class="shop-list__phone">' + object.phoneNumber + '</p>';
                    balloon_content += '<p class="shop-list__time">' + object.workingHours + '</p>';
                    balloon_content += '<p class="shop-list__price">Стоимость услуги: Бесплатно</p>';

                    if (object.pickUp) {
                        balloon_content += '<p class="shop-list__pickup">Можно забрать: ' + object.pickUp + '</p>';
                    }

                    balloon_content += '<p class="shop-list__note">Как только заказ поступит в пункт выдачи, вам придет смс - сообщение </p>';
                    balloon_content += '<button type="button" class="btn btn-transp r10 js-balloon-choiceShop" onclick=PickShop(this); id="' + object.shopId + '">Выбрать пункт</button>';
                    balloon_content += '</div>';

                    //Показываем балун
                    shopsMap.balloon.open(placemark.geometry.getCoordinates(), { content: balloon_content }, { closeButton: true });

                }


                /**
                 * При клике на метку запускается данный обработчик
                 */
                function setShopPointClickHandler(e) {
                    var placemark = e.get('target');
                    setClickCommonHandler(placemark);

                    shopsMap.panTo(placemark.geometry.getCoordinates(), { flying: true });

                }


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

                    '<div style="color: #2457C2; font-weight: 400; line-height: 40px; font-size: 16px; text-align: center; font-family: circle, Ubuntu, Helvetica, Helvetica CY, Arial, Nimbus Sans L, sans-serif;">{{ properties.geoObjects.length }}</div>'),

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

                    shopsMap.geoObjects.add(placeMarks[i]);

                    //при клике на любой магазин в панеле слева, срабатывает соответстующая точка на карте
                    $(document.getElementById(shop.id)).on('click', function (event) {
                        //placeMarks[i].events.fire('click');
                        setShopListItemClickHandler(placeMarks[i], event);
                    });
                });

                checkAvailability();

                placeMarks.forEach(function (placeMark, index) {
                    if (index % 2 == 0) {
                        placeMark.options.set('iconImageHref', './img/map/sdek-pin.svg');
                    } else {
                        placeMark.options.set('iconImageHref', './img/map/boxberr-pin.svg');
                    }
                });


                /**
                 * Проверяет, соответствует ли элемент требуемым условиям, если нет, скрываем его и удаляем из кластера,
                 * а также скрываем соответствующий элемент из боковой панели
                 */
                function checkAvailability() {

                    var num = $(".checked").length;
                    $(".shop-filter__types-num").text(num - 1);

                    placeMarks.forEach(function (item, i) {
                        item.options.set('visible', true);
                        clustererShop.add(item);
                        document.getElementById(shopArr[i].id).style = null;

                    });

                    checkClusterState();

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

    $('body').on('click', '.js-detail', function (e) {
        e.preventDefault();
        let id = $(this).attr('href');
        let obj = shopPoints.filter(function (item) { return item.shopId.toUpperCase() == id.toUpperCase() });
        let item = obj[0];

        let detailWrapp = $('<div/>', { class: 'item-detail-wrap shop-left-column b-border'});
        detailList = '';
        detailList += '<a href="javascript:void(0);" class="back-roundArrow js-backTolist">Вернутся к списку</a>';
        detailList += '<div class="ob-title">' + item.shopName +'</div>';
        detailList+= '<p class="shop-list__address">' +item.address +'</p>';
        detailList+= '<p class="shop-list__phone">' + item.phoneNumber +'</p>';
        detailList += '<p class="shop-list__time">' + item.workingHours +'</p>';
        detailList += '<p class="shop-list__note">Как только заказ поступит в пункт выдачи, вам придет смс - сообщение </p>';
        detailList += '<p class="shop-list__price">Стоимость услуги: Бесплатно</p>';

        if (item.pickUp){
            detailList += '<p class="shop-list__pickup">Можно забрать: ' + item.pickUp + '</p>';
        }

        detailList += '<button class="btn btn-transp r10" data-choice="' + item.shopId +'">Выбрать</button>'
        $(detailList).appendTo(detailWrapp);
        detailWrapp.appendTo('.js-detail-wrapp');
        
    });

    
    $('body').on('click', '.js-backTolist', function (e) {
        e.preventDefault();
        $(this).parent().remove();
    });

    $('body').on('click', '[data-choice]', function (e) {
        e.preventDefault();
        $(this).removeClass('btn-transp').addClass('btn-pink').text('Выбрано');
        alert('Выбрано: ' + $(this).data('choice'));
    });

});

