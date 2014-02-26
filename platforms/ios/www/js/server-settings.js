function script(){
    
       for(var k in app.servers[app.selectedServer].serverSettings){
            if (k=="ID") continue;
            if (k=="aupdate") {console.log("enter");if(app.servers[app.selectedServer].serverSettings.aupdate=="true") $("#aupdate").prop("checked","true");continue; }
            $("#"+k).val(app.servers[app.selectedServer].serverSettings[k]);
       }
        $("#sName").text(app.servers[app.selectedServer].serverSettings.serverName + " settings");
        $("button.nav-page").on("touchend",function(){ app.nav.navigate("#content",$(this).attr("href"),"fast"); });
        page.switch = new Switchery( $(".js-switch")[0] );
    
function saveToDb(tx) {
    var id=app.servers[app.selectedServer].serverSettings.id
    var user = $("#user").val();
    var password = $("#password").val();
    var srv=$("#server").val();
    var srvName=$("#serverName").val();
    var aupdate=$("#aupdate").prop("checked");
    var sqlText= 'UPDATE SERVERS SET serverName="'+srvName+'",user="'+user+'",password="'+password+'", server="'+srv+'", aupdate="'+aupdate+'" WHERE id = '+id;
    app.servers[app.selectedServer].serverSettings={id:id, user:user,password:password, serverName:srvName, server:srv,aupdate:aupdate};
    if(!aupdate) {
        for(i=0;i<app.servers[app.selectedServer].sockets.length;i++){
            app.servers[app.selectedServer].sockets[i].close();
            clearInterval(app.servers[app.selectedServer].CPUupdate);
            clearInterval(app.servers[app.selectedServer].HDDupdate);
            
        };
        app.servers[app.selectedServer].sockets=[];
        } else {
        app.servers[app.selectedServer].sockets=[];
        app.servers[app.selectedServer].createSockets();
    }
    
    console.log(sqlText);
     tx.executeSql(sqlText);

        
    console.log("saved.");
}

    $("#save").on("touchend", function(e){
        e.preventDefault();
        app.db.transaction(saveToDb, function(m){console.log(m)});
    });
}
