// This is localization library for javascript projects.
// jQuery required
//

function Localization() {
    'use strict';
    var _this = this;
    _this.locale="en-US";
    _this.localeData ={};
    _this.LOCALIZATION_DIR = "locale";
    _this.NOT_FOUND = "";
    
    
    _this.localize = function (selector,locale) {
        _this.getData(locale, function(data) {
            selector = selector || "document";
            $(selector).find($("[locId]")).each(function (index, el) {
                el.innerHTML = _this.localeData[$(el).attr("locId")] || _this.NOT_FOUND;
            });
        });
    };
    
    this.localizeOne = function (selector,locale) {
        _this.getData(locale, function() {
            var el = $(selector)[0];
            el.innerHTML = _this.localeData[$(el).attr("locId")] || _this.NOT_FOUND;
        });
    };
    
    this.getData = function (locale, callback) {
        _this.locale=locale;
        $.getJSON("/" + _this.LOCALIZATION_DIR + "/" + _this.locale + ".json", function(data){
            _this.localeData = data;
            callback();
        });
        
    };
    return _this;
}