//Верхняя менюшка с «Ещё»
function responseMenu() {
    $('ul.dropdown-menu li.item').appendTo('ul.menu');
    var items = $('ul.menu li.item');
    var max_width = $('ul.menu').width() - $('ul.menu li.dd_menu').outerWidth();
    var width = 0;
    var hide_from = 0;

    items.css({ 'width': 'auto' });

    items.each(function (index) {
        if (width + $(this).outerWidth() > max_width) {
            return false;
        }
        else {
            hide_from = index;
            width += $(this).outerWidth();
        }
    });
    if (hide_from < items.length - 2) {
        items.eq(hide_from).nextAll('li.item').appendTo('ul.dropdown-menu');
        //items.css({ 'width': (max_width / (hide_from + 1)) + 'px' });
        $('ul.menu li.dd_menu').show();
    }
    else {
        $('ul.menu li.dd_menu').hide();
    }
}

//куки
function checkCookies() {
    let cookieDate = localStorage.getItem('cookieDate');
    let cookieNotification = document.getElementById('cookie_notification');
    let cookieBtn = cookieNotification.querySelector('.cookie_accept');

    if (!cookieDate || (+cookieDate + 31536000000) < Date.now()) {
        cookieNotification.classList.add('show');
    }

    cookieBtn.addEventListener('click', function () {
        localStorage.setItem('cookieDate', Date.now());
        cookieNotification.classList.remove('show');
    })
}

//Жёлтая лапа в шапке
function checkYellowWarning() {
    let cookietopWarning = localStorage.getItem('topWarning');
    let cookietopWarningBtn = document.querySelector('.js-warningBtn');
    let cookietopWarningHint = document.getElementById('top_warning');
    

    if (!cookietopWarning || (+cookietopWarning + 31536000000) < Date.now()) {
        cookietopWarningHint.classList.add('__active');
        cookietopWarningBtn.classList.add('__active');
    }

    cookietopWarningBtn.addEventListener('click', function () {
        localStorage.setItem('topWarning', Date.now());
        cookietopWarningHint.classList.toggle('__active');
        this.classList.toggle('__active');
    })
}



$(document).ready(function () {

    const $document = $(document),
    $window = $(window),
    $html = $('html'),
    $body = $('body'),
    $foo = $('footer');


    $("img.lazy").lazyload();

    $('[data-fancybox]').fancybox({
        touch: false,
        beforeShow: function(instance, slide){
            $body.css('overflow', 'hidden');
            if( slide.src === '#bonus' ) {
                $body.addClass('show-nav');
            }
        },
        afterClose: function (instance, slide) {
            $body.css('overflow', 'visible');
            if( slide.src === '#bonus' ) {
                $body.removeClass('show-nav');
            }
        },

    });

    $('.js-closeModal').on('click', function(evt) {
        $.fancybox.close();
    });


    checkCookies();//Куки
    checkYellowWarning();


    //Верхняя менюшка с «Ещё»
    $('.dropdown-toggle').on('click', function () {
        $('.dropdown-menu').toggle();
    });

    $window.on('resize', function () {
        if($window.width() > 750){
            responseMenu();
        }
    }).trigger('resize');

    $('#toggleMobleMenu').on('click', function(){
        $('.h-top').fadeIn();
        $body.css('overflow', 'hidden');
    });
    $('#hideMobleMenu').on('click', function () {
        $('.h-top').fadeOut();
        $body.css('overflow', 'visible');
    });


    $('.js-personal').on('click', function (evt) {
        $(this).find('.top-personal').toggleClass('is_active');
    });

    $('.js-personal-mobile').on('click', function (evt) {
        // для больших экранов дизейблим для показа выпадающего меню
        if(window.innerWidth >= 750) {
            evt.preventDefault();
        }
    });
    

    //Выбор разделов в меню разделов
    const defautSelected = $('[data-trigger-sect].selected').data('trigger-sect'); //текущий раздел

    $body.on('mouseenter', '[data-trigger-sect]', function(){
        $(this).addClass('selected').siblings().removeClass('selected');
        $('[data-target-sect=' + $(this).data('trigger-sect') +']').addClass('selected').siblings().removeClass('selected');
    });

    $body.on('mouseleave', '#hidden-catalog', function () {
        $('[data-trigger-sect=' + defautSelected + ']').addClass('selected').siblings().removeClass('selected');
        $('[data-target-sect=' + defautSelected + ']').addClass('selected').siblings().removeClass('selected');
        //$('#trigger-cat-menu').trigger('click');
    });

    $('.js-more-menu').on('click', function() {
        const menuColumn = $(this).parents('ul');
        const target = $(this).parents('.catalog-menu__col').find('.js-more-menu-items');
        
        menuColumn.append( target.html() );
        $(this).remove();
        target.remove();
    });

    //Поиск в мобильном меню каталога
    //для демонстрации
    $body.on('keyup input', '.js-catalogSearch', function () {
        let $resultBox = $('#searchResult'),
            $sForm = $(this).parent('.top-search__form');

        let delBtn = $('<span/>', {
            class : 'reset-result',
            html: '<svg xmlns="http://www.w3.org/2000/svg" version="1" viewBox="0 0 24 24"> <path d="M13 12l5-5-1-1-5 5-5-5-1 1 5 5-5 5 1 1 5-5 5 5 1-1z"></path></svg>'
        });
        if($(this).val() != ''){
            $resultBox.fadeIn();
            $sForm.addClass('is-active');
            if($('.reset-result').length == 0)
                delBtn.appendTo($sForm);
        }else{
            $resultBox.fadeOut();
            $sForm.removeClass('is-active');
            $('.reset-result').detach();
        }
    });

    $body.on('click', '.reset-result', function () {
        $('.js-catalogSearch').val('').trigger('input');
    });

    /////////


    
    //Слайдер на главной
    var swiper = new Swiper("#promo-slider", {
        spaceBetween: 30,
        pagination: {
            el: ".swiper-pagination",
        },
        autoplay: {
            delay: 5000,
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        breakpoints:{
            0 : {
                pagination: {
                    el: ".swiper-pagination",
                },
            },
            600 : {
                pagination : false
            }
        }
    });

    //Мини слайдеры акций на главной
    $('[data-action-carousel]').each(function (i, slider){
        new Swiper(slider, {
            slidesPerView: 1,
            spaceBetween: 15,
            watchOverflow: true,
            watchSlidesVisibility: true,
            watchSlidesProgress: true,
            followFinger: false,
            enabled : true,
            autoplay: {
                delay: 5000,
            },
            pagination: {
                el: ".swiper-pagination",
                clickable: true
            },
        });
    });

    //Мини слайдеры акций на главной
    $('[data-action-carousel]').each(function (i, slider){
        new Swiper(slider, {
            slidesPerView: 1,
            spaceBetween: 15,
            watchOverflow: true,
            watchSlidesVisibility: true,
            watchSlidesProgress: true,
            followFinger: false,
            enabled : true,
            autoplay: {
                delay: 5000,
            },
            pagination: {
                el: ".swiper-pagination",
                clickable: true
            },
        });
    });

    //Карусели продуктов

    $('[data-prod-carousel]').each(function (i, slider) {

        const breakpoint = window.matchMedia('(max-width: 1024px)');
        
        let prodCarousel;
        let pagination = $(slider).data('prod-carousel');
        
        const breakpointChecker = function () {
            if (breakpoint.matches === true) {
                slider.classList.add("not-slider");
                if (prodCarousel !== undefined) {
                    prodCarousel.destroy(true, true);
        
                }
                return;
            } else if (breakpoint.matches === false) {
                slider.classList.remove("not-slider");
                return enableSwiper();
            }
        };

        const slidesCount = $(slider).data('slides') || 6;
        
        const enableSwiper = function () {
            prodCarousel = new Swiper(slider, {
                slidesPerView: slidesCount,
                spaceBetween: 15,
                watchOverflow: true,
                watchSlidesVisibility: true,
                watchSlidesProgress: true,
                followFinger: false,
                navigation: {
                    prevEl: '[data-buttons="' + pagination + '"] .pagination__item_prev',
                    nextEl: '[data-buttons="' + pagination + '"] .pagination__item_next'
                },
                on: {
                    init: function () {
                        if (this.slides.length <= this.params.slidesPerView) {
                            $('[data-buttons="' + pagination + '"]').remove();
                        }
                    },
                },
            });
        
        };
        
        breakpoint.addListener(breakpointChecker);
        
        breakpointChecker();

    });


    //input type password
    let pass_inputs = $('[type=password].pass-dinamic');
    pass_inputs.each(function (){
        $(this).wrap('<div class="pass-dinamic-wrap" />'); 
        let $trig = $('<span/>', { 'class': 'pass-dinamic-trigger'});
        $(this).after($trig);



        $($trig).on('click', function () {
            let inpt = $(this).siblings('input');
            if (inpt[0].type === "password") {
                inpt[0].type = "text";
                inpt.addClass('--visible');
            } else {
                inpt[0].type = "password";
                inpt.removeClass('--visible');
            }
        })


    });

    


    //Выбор файла
    let inputs = $('.input__file');
    inputs.each(function (i, input) {
        $(input).on('change', function (e) {

            let $this = $(this);
            let countFiles = '';
            $this.parent().find('.file-result').remove();
            if ($this[0].files && $this[0].files.length >= 1)
                countFiles = $this[0].files.length;

            let label = $($this).siblings('.input__file-button');

            if (countFiles){
                let resWrapp = $('<div/>', {
                    class: 'file-result'
                });
                let resName = $('<span/>', {
                    class: 'fl-name'
                }).prependTo(resWrapp);
                let resDel = $('<span/>', {
                    class: 'fl-delete',
                    text: 'Удалить'
                }).appendTo(resWrapp);
                resName.text($this[0].files[0].name);
                $this.parent().prepend(resWrapp);
            }
            else{
                label.find('.input__file-button-text').text('Прикрепить файл');
            }

        })

    });
    //Удаление файла
    $body.on('click', '.fl-delete',function () {
        $(this).closest('.input__file__wrapper')
            .find('input').val('')
            .prev('.file-result').remove();
    });

    $("[data-mask]").mask("+7(999) 999-99-99");

    $('.js-button-save').each(function() {
        const button = $(this);
        const form = button.parents('form');
        form.find('input, textarea').one('change, input', function() {
            button.prop('disabled', false);
        })
    });

    $('.js-validateForm').on('submit', function(evt) {
        let isValid = true;
        $(this).find('input[data-mask]').each(function(){
            const checkRegexp = /\+7\(\d{3}\)\s\d{3}-\d{2}-\d{2}/;
            if( $(this).val() && !checkRegexp.test( $(this).val() ) ) {
                $(this).addClass('error');
                $(this).parents('.form-row').find('.js-error').remove();
                $(this).parents('.form-row').append('<label class="js-error error">Номер телефона заполнен неверно</label>');
                isValid = false;
            }
        });
        if(!isValid) {
            // прерываем отправку данных
            return false;
        }
        $(this).find('input[required], input[data-required]').each(function(){
            if( !$(this).val() ) {
                $(this).addClass('error');
                $(this).parents('.form-row').find('.js-error').remove();
                $(this).parents('.form-row').append('<label class="js-error error">Поле должно быть заполнено</label>');
                isValid = false;
            }
        });
        if(!isValid) {
            // прерываем отправку данных
            evt.preventDefault();
        }
    });

    // soft validation - disable button[type="submit"] if not valid
    function checkValidate(form) {
        let isValid = true;
        form.find('input[data-mask]').each(function(){
            const checkRegexp = /\+7\(\d{3}\)\s\d{3}-\d{2}-\d{2}/;
            if( $(this).val() && !checkRegexp.test( $(this).val() ) ) {
                isValid = false;
            }
        });
        form.find('input[required], input[data-required]').each(function(){
            if( !$(this).val() ) {
                isValid = false;
            }
        });
        form.find('button[type="submit"]').prop('disabled', !isValid);
        return isValid;
    }

    $('.js-softValidateForm').find('input[data-required]').on('input, change', function() {
        const form = $(this).parents('.js-softValidateForm');
        checkValidate(form);
    });

    $('.js-softValidateForm').each(function() {
        checkValidate( $(this) );
    });
    // soft validation - end

    //Показ меню каталога
    $body.on('click', '#trigger-cat-menu', function(){
        $(this).toggleClass('activity');
        if ($(this).hasClass('activity')){
            $('#hidden-catalog').addClass('is_visible').removeClass('is_hidden');
            $('#menu-overlay').addClass('active');
            $body.css('overflow', 'hidden');
        }else{
            $('#hidden-catalog').addClass('is_hidden').removeClass('is_visible');
            $('#menu-overlay').removeClass('active');
            $body.css('overflow', 'visible');
        }
    });

    $body.on('click', '#menu-overlay', function () {
        $(this).removeClass('active');
        $('#trigger-cat-menu').trigger('click');
    });

    //Показ меню каталога на мобильном
    function showMobileCatalog() {
        $('body').css('overflow', 'hidden');
        
        $('#catalog-menu-mobile').show();
        setTimeout(function(){
            $('#catalog-1').addClass('current');
        }, 100);
    }
    $body.on('click', '#mobile-catalog-trigger', function () {
        showMobileCatalog();
    });
    $body.on('click', '.js-mobileSearchTriger', function () {
        showMobileCatalog();
        $('.js-catalogSearch').focus();
        $('#hideMobleMenu').trigger('click');
    });

    $body.on('click', '.js-close-section-menu', function () {
        $('body').css('overflow', 'visible');
        
        $('[data-target-category]').removeClass('current');
        setTimeout(function () {
            $('#catalog-menu-mobile').hide();
        }, 200);
    });

    $body.on('click', '.js-category-back', function () {
        $(this).closest('[data-target-category]').removeClass('current');
    });

    $body.on('click', '[data-category]', function(){
        $('[data-target-category="' + $(this).data('category')+'"]').addClass('current');
    });

    //Скрывание/показ бокового меню разделов
    $body.on('click', '.js-hide-menu', function () {
        $(this).closest('.catalog-aside').addClass('is_hidden');
        $(this).closest('.js-wrap-dinamic').removeClass('d-grid');
    });
    $body.on('click', '.js-show-menu', function () {
        $('.catalog-aside').removeClass('is_hidden');
        $(this).closest('.js-wrap-dinamic').addClass('d-grid');
    });

    //Универсальные табы
    $('ul.js-tabs__caption').on('click', 'li:not(.active)', function () {
        $(this).addClass('active').siblings().removeClass('active')
            .closest('div.js-tabs').find('div.js-tabs__content').removeClass('active').eq($(this).index()).addClass('active');
    })

   
    //header fixed
    var a = document.querySelector('header .h-main'), b = null;
    window.addEventListener('scroll', Ascroll, false);
    document.body.addEventListener('scroll', Ascroll, false);
    function Ascroll() {
        if (b == null) {
            var Sa = getComputedStyle(a, ''), s = '';
            for (var i = 0; i < Sa.length; i++) {
                if (Sa[i].indexOf('overflow') == 0 || Sa[i].indexOf('padding') == 0 || Sa[i].indexOf('border') == 0 || Sa[i].indexOf('outline') == 0 || Sa[i].indexOf('box-shadow') == 0 || Sa[i].indexOf('background') == 0) {
                    s += Sa[i] + ': ' + Sa.getPropertyValue(Sa[i]) + '; '
                }
            }
            b = document.createElement('div');
            b.style.cssText = s + ' box-sizing: border-box; width: ' + a.offsetWidth + 'px;';
            a.insertBefore(b, a.firstChild);
            var l = a.childNodes.length;
            for (var i = 1; i < l; i++) {
                b.appendChild(a.childNodes[1]);
            }
            a.style.height = b.getBoundingClientRect().height + 'px';
            a.style.padding = '0';
            a.style.border = '0';
        }
        if (a.getBoundingClientRect().top <= 0) {
            b.className = 'sticky';
        } else {
            b.className = '';
        }
        window.addEventListener('resize', function () {
            a.children[0].style.width = getComputedStyle(a, '').width
        }, false);
    }

    //Обработка select2 для открытия в модальном окне
   


   $(this).find('select').each(function () {
        var dropdownParent = $(document.body);
       
        if ($(this).parents('.modal').length !== 0)
        {
            dropdownParent = $(this).parents('.modal:first');
            let select = $(this);
            select.select2({
                minimumResultsForSearch: -1,
                dropdownParent: dropdownParent
            });
            /*const MobileBreakPoint = window.matchMedia('(max-width: 420px)');
            const breakpoinFunc = function () {
                if (MobileBreakPoint.matches === true) { //Мобилка
                    $(select).on('select2:open', function (e) {
                        var data = e.target;
                        console.log(data);
                        let custSelect = $('<div/>', {class: 'customMobileSelect'});
                        let custSelectHeader = $('<div/>', { class: 'customMobileSelectHeader', text: $(data).data('label') }).appendTo(custSelect);
                        let custSelectBox = $('<div/>', { class: 'customMobileSelectBox'});
                        $(data).find('option').each(function(){
                            let li = $('<li/>', { class: 'customMobileSelect__item', text: $(this).text()});
                            li.attr('data-value', $(this).val());
                            li.appendTo(custSelectBox);
                        });

                        custSelectBox.appendTo(custSelect);
                        dropdownParent.append(custSelect);

                        $(data).find('option').on('')

                    });
                } else{
                    console.log('Что-то скрываем');
                }
            };
            MobileBreakPoint.addListener(breakpoinFunc);
            breakpoinFunc();*/
        }else{
            let select = $(this);
            select.select2({
                minimumResultsForSearch: -1,
                width: '100%'
            });
        }
    });


    //Кнопки +/- при добавлении в корзину
    $body.on('click', '.to-cart',function(){
        $(this).hide();
        let addCounter = $(this).siblings('.js-prod-counter');
        addCounter.addClass('in-cart').find('.js-plus').trigger('click');
    });


    // Убавляем кол-во по клику в списке товаров
    $('.js-minus').on('click', function () {
        let $block = $(this).parent('.js-prod-counter');
        let $input = $block.find('.js-input');
        let count = parseInt($input.val()) - 1;

        if (count <= parseInt($input.data('min'))){
            $input.val($input.data('min'))
                .next('.prod-count').text('')
                .next('.prod-total').text('');
            $block.removeClass('in-cart').siblings('.to-cart').show();
        }else{
            $input.val(parseInt(count))
                .next('.prod-count').text(parseInt(count) + 'шт')
                .next('.prod-total').text((parseInt(count) * $input.data('price')).toLocaleString('ru') + ' ₽');
        }
    });


    // Прибавляем кол-во по клику в списке товаров
    $('.js-plus').on('click', function () {
        let $input = $(this).parent('.js-prod-counter').find('.js-input');
        let count = parseInt($input.val()) + 1;
        count = count > parseInt($input.data('max')) ? parseInt($input.data('max')) : count;
        $input.val(parseInt(count))
            .next('.prod-count').text(parseInt(count)+'шт')
            .next('.prod-total').text((parseInt(count) * $input.data('price')).toLocaleString('ru') +' ₽')

    });

    
    //scroll custom
    $("[data-custom-scroll], [data-search-list]").mCustomScrollbar({
        mouseWheel: {
            scrollAmount: 300
        }
    });
    

    //Показать ещё в футере
    const fMenuTrgr = $('.mobile-toggle-height').next('span');
    const defTitle = fMenuTrgr.data('cut');
    const altTitle = fMenuTrgr.data('full');
    fMenuTrgr.text(defTitle);
    $(fMenuTrgr).on('click', function(){
        let parentUl = $(this).prev('ul');
        parentUl.toggleClass('full-list');
        if (parentUl.hasClass('full-list'))
            $(this).text(altTitle)
        else
            $(this).text(defTitle)
    });

});
