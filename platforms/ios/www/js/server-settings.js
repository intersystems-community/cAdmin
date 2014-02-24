   function script(){
        $("#sName").text(app.servers[app.selectedServer].serverSettings.serverName + " settings");
        $("button.nav-page").on("touchend",function(){ app.nav.navigate("#content",$(this).attr("href"),"fast"); });
        page.switch = new Switchery( $(".js-switch")[0] );
    }