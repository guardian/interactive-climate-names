define([
    'jquery',
    'underscore',
    'csv',
    'text!templates/mainTemplate.html',
    'text!templates/quotesTemplate.html',
    'text!templates/endTemplate.html',
], function(
    $,
    _,
    csv,
    mainTmpl,
    quoteTmpl,
    endTmpl
) {
   'use strict';

    var loadCount = 0,
        quoteCount = 0,
        quotes,
        headerData,
        endCount = 0,
        timeLoaded;

    function init(el, context, config, mediator) {
        $.ajax({
            url: "http://interactive.guim.co.uk/spreadsheetdata/0Aoi-l6_XQTv5dGlpTHlaUk5fbkg0dFJ1MFVpSXc2ZkE.json",
            cache: false,
        })
        .done(function(data) {
            quotes = data.sheets.extras;
            timeLoaded = new Date();
            app(data);
        })
    }

    function app(data) {
        var mainTemplate = _.template(mainTmpl),
            mainHTML = mainTemplate({headerData: data.sheets.header[0]})
            headerData = data.sheets.header[0];

        $(".element-interactive").append(mainHTML);
        initEvents();

        loadMore(loadCount);
    }

    function initEvents() {
        $(window).scroll(_.throttle(function() {
            var $window = $(window),
                $sticky = $("#sticky-bar"),
                sigScroll = Math.round((($window.scrollTop() - $('#signatures').offset().top)  / $('#signatures').height())*loadCount*300);

            if($window.scrollTop() + $window.height() > $('#signatures').height() - 4*$window.height()) {
                loadMore(loadCount);
            }

            if($window.scrollTop() > $('#signatures').offset().top) {
                $sticky.addClass("sticky-bar--visible");
            } else {
                $sticky.removeClass("sticky-bar--visible");
            }

            $("#count").text((sigScroll > 0) ? sigScroll.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0);

        }, 100));

        $(window).resize(function() {
            var windowWidth = $(window).width();
            $(".main--top").css({"padding-top": (windowWidth > 1500) ? 305 : windowWidth/4.92});
        });
    }

    function loadMore(count) {
        console.log('fired');
        $.ajax({
            url: "@@assetPath@@/js/data/" + count,
            cache: false,
        })
        .done(function(data) {
            if(loadCount === 0) {
                $("#signatures").append('<div class="who-signed">Who has signed</div>');
            }
           renderNames(data);
           loadCount++;
        })
        .fail(function() {
            if(loadCount > 500 && endCount === 0) {
                end();
            } else {
                console.log('Error');
            }
        });
    }

    function renderNames(namesCSV) {
        var data = $.csv.toArrays(namesCSV),
            toAppend = '';

        // console.log(data);

        data.map(function(signature, i) {
            if((i === 150 || i === 299) && quotes[quoteCount]) {
                console.log(i);
                var quoteTemplate = _.template(quoteTmpl),
                    quoteHTML = quoteTemplate({quote: quotes[quoteCount]});
              
                toAppend += quoteHTML;
                quoteCount++;
            }
            toAppend += '<div class="signature"><span class="name">' + signature[0] + ', ' + signature[2] + ', ' + signature[1] + '</span><span class="bullet-p">•</span></div>';
        })

        $("#signatures").append(toAppend);
    }

    function end() {
        var timeDiff = (new Date() - timeLoaded)/1000,
            tonnesCoal = Math.round(timeDiff * 250.227),
            endTemplate = _.template(endTmpl),
            endHTML = endTemplate({tonnesCoal: tonnesoal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), headerData: headerData});

        $("#signatures").after(endHTML);

        endCount = 1;
    }

    return {
        init: init
    };
});
