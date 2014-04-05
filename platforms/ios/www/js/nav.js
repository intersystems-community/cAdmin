// Library for fast ajax-based navigation
// You have ONEPAGE app
// And you reload just the CONTENT of the page

//Script usage: use     var a for private use;
//                      this.a for public use;


function Navigator() {
    "use strict";
    window.page={};
    var _this = this;
    _this.contentArea = "";
    _this.pagesDirectory = "pages";
    _this.scriptsDirectory = "js";
    $(window).on("onbeforeunload", function(){delete window.script});
    
    _this.navigate = function(area, url, animate) {
        _this.contentArea = area || "document";
        //Clear window.script namespace
        delete window.script;
        //Run our destructor
        if (window.page && page._destruct) page._destruct();
        if (animate) $(_this.contentArea).hide();
        //Remove all html nodes inside contentArea
        $(_this.contentArea).find("> *").remove();
        $(_this.contentArea).load(""+_this.pagesDirectory+"/"+url, function(){
            if(animate) $(_this.contentArea).show(animate);
            var scriptSrc=url.match(/(.*)\.html/)[1];
            $.getScript(""+_this.scriptsDirectory+"/"+scriptSrc+".js", function(){
                if ("script" in window) { window.page={};window.page.script = new script(); }
                app.localization.localize("body", app.locale);
            });
        });
        return false;
    }
}
