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
    _this.navigate = function(area, url, animate) {
        _this.contentArea = area || "document";
        delete window.script;
        if (window.page && page._destruct) page._destruct();
        if (animate) $(_this.contentArea).hide();
        $(_this.contentArea).load(""+_this.pagesDirectory+"/"+url, function(){
            
           if(animate) $(_this.contentArea).show(animate);
            $.getScript(""+_this.scriptsDirectory+"/"+url.match(/(.*)\.html/)[1]+".js", function(){
            if ("script" in window) { window.page={};window.page.script = new script(); }});
        });
    }
}
