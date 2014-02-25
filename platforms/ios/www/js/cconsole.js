function script(){
    $("#sName").text(app.servers[app.selectedServer].serverSettings.serverName);

    $("button").on("touchend",function(){
        var strToFind = $("#findstr")[0].value;
        page.cSocket = app.servers[app.selectedServer].createSocket( function(message) {
            var m = JSON.parse(message.data).children;
            console.log(m);
            for(i=0;i<m.length;i++){
               var $tbody = $("#metricsTable tbody");
               $tbody.append("<tr>"+
                            "<td>"+m[i].ID+"</td>"+
                            "<td>"+m[i].DateTime+"</td>"+
                            "<td>"+m[i].Message+"</td>"+
                            "<td>"+m[i].Pid+"</td>"+
                            "<td>"+m[i].Severity+"</td>"+
                            "</tr>");    
            }
        },function(){ this.send( $("#findstr")[0].value ); } );
        
    })
};