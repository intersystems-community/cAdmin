function script(){
       for(var k in app.servers[app.selectedServer].serverSettings){
            if (k=="ID") continue;
            $("#"+k).val(app.servers[app.selectedServer].serverSettings[k]);
       }
        $("#sName").text(app.servers[app.selectedServer].serverSettings.serverName + " settings");
        $("button.nav-page").on("touchend",function(){ app.nav.navigate("#content",$(this).attr("href"),"fast"); });
        page.switch = new Switchery( $(".js-switch")[0] );
    
function saveToDb(tx) {
    var user = $("#user").val();
    var password = $("#password").val();
    var srv=$("#server").val();
    var srvName=$("#serverName").val();
    var a_update=$("#aupt").prop("checked");
     tx.executeSql('UPDATE SERVERS VALUES ('+app.servers[app.selectedServer].serverSettings.id+', "'+srvName+'","'+user+'","'+password+'", "'+srv+'") WHERE id = '+app.servers[app.selectedServer].serverSettings.id+'');

        
    console.log("saved.");
}

    $("#save").on("touchend", function(e){
        e.preventDefault();
        app.db.transaction(saveToDb, function(m){console.log(m)});
    });
}
