$(function () {
            $("#menu_include").load("includes/menu.html");
        });




        // nd2Search
        (function ($) {
            $.nd2Search = function (options) {

                var _self = this;

                _self.defaults = {
                    placeholder: "Search",
                    source: [],
                    defaultIcon: 'star',
                    fn: function (r) {
                        console.log("No Callback function defined.");
                    }
                };

                _self.options = $.extend(_self.defaults, options);

                _self.applyWaves = function () {
                    if (typeof Waves !== "undefined") {
                        Waves.attach('.nd2-search-button, .nd2-search-back-button', ['waves-button']);
                        Waves.init();
                    }
                };

                _self.getSearchButton = function (offset) {

                    return "<a href='#' class='ui-btn ui-btn-right wow fadeIn nd2-search-button' style='margin-right: " + offset + "px;' data-wow-delay='1s'><i class='zmdi zmdi-search'></i></a>";
                };

                _self.getBackButton = function () {

                    return "<a href='#' class='ui-btn ui-btn-left wow fadeIn nd2-search-back-button' data-wow-delay='0.2s'><i class='zmdi zmdi-arrow-back'></i></a>";
                };

                _self.getSearchInput = function () {

                    return "<input id='list_filter' type='text' class='nd2-search-input' value='' placeholder='" + _self.options.placeholder + "' />";
                };

                _self.activateSearch = function () {
                    _self.getHeader().addClass("nd2-search-active");
                    _self.getSearchInputObj().val('').focus();
                };

                _self.hideSearch = function () {
                    _self.getHeader().removeClass("nd2-search-active");
                };

                _self.getHeader = function () {
                    return $("body").find(".ui-page-active div[data-role='header']").first();
                };

                _self.getSearchInputObj = function () {
                    return _self.getHeader().find('.nd2-search-input');
                };

                _self.bindEvents = function () {
                    _self.getHeader()
                        .on('click', '.nd2-search-button', function (e) {
                            e.preventDefault();
                            _self.activateSearch();
                        })
                        .on('click', '.nd2-search-back-button', function (e) {
                            e.preventDefault();
                            _self.hideSearch();
                        });

                    _self.bindAutocomplete();

                };

                _self.bindAutocomplete = function () {
                    return;
                    _self.getSearchInputObj().autocomplete({
                            delay: 500,
                            minLength: 1,
                            source: _self.options.source,
                            select: function (e, ui) {
                                if (typeof ui.item !== 'undefined' && typeof ui.item.value !== 'undefined') {
                                    if (typeof _self.options.fn === 'function') {
                                        _self.options.fn(ui.item.value);
                                        _self.hideSearch();
                                    }
                                }
                            }
                        })
                        .autocomplete('instance')._renderItem = function (ul, item) {
                            if (typeof item === 'string') {
                                item = {
                                    icon: _self.options.defaultIcon,
                                    value: item,
                                    label: item
                                };
                            }

                            var icon = (typeof item.icon !== 'undefined') ? "<i class='zmdi zmdi-" + item.icon + "'></i>" : "<i class='zmdi zmdi-" + _self.options.defaultIcon + "'></i>";
                            return $("<li class='nd2-search-result-item'>")
                                .attr("data-value", item.value)
                                .append("<span class='icon'>" + icon + "</span><span class='term'>" + item.label + "</span>")
                                .appendTo(ul);
                        };


                };

                _self.create = function () {

                    var header = _self.getHeader();
                    var content = null;
                    if (header.length > 0) {

                        var firstBtnRight = header.find(".ui-btn-right");

                        if (firstBtnRight.length > 0) {
                            firstBtnRight.first().before(_self.getSearchButton(firstBtnRight.length * (firstBtnRight.outerWidth())));
                        } else {
                            header.append(_self.getSearchButton(0));
                        }

                        header.css({
                            'minHeight': header.height() + 'px'
                        });

                        header.prepend(_self.getBackButton());
                        header.prepend(_self.getSearchInput());

                        _self.applyWaves();
                        _self.bindEvents();

                    }

                };

                window.setTimeout(function () {
                    _self.create();
                }, 500);
            };

        }($));





        new $.nd2Search({
            id: "list_filter",
            placeholder: "Buscar", // Placeholder in the search field
            defaultIcon: "globe-alt", // optional: icon | null
            source: [{
                label: 'Displayed Value',
                value: 'real-value',
                icon: 'custom-icon'
            }], // autocomplete : option-source
            fn: function (result) { // this function will be executed when a valid result item is selected
                console.log('--- Your custom handling ---');
                console.log('you picked: ');
                console.log(result);
            }
        });
        
        
        
        
        $("spots_list_list").filterable( "option", "input", "#list_filter" );