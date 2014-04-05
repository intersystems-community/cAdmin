function script(){
    
    //UI interaction
    $("button.nav-page").on("tap",function(){ 
        app.nav.navigate("#content",$(this).attr("href"),"fast"); 
    });
    $("#sName").text(app.servers[app.selectedServer].serverSettings.serverName);
    
    //Find section
    $("button.find").on("tap",function(e){
        $("#metricsTable tbody").find("*").remove();
        e.preventDefault();
        var strToFind = $("#findstr")[0].value;
        page.cSocket = app.servers[app.selectedServer].createSocket( function(message) {
            var data = "";
            try { data = JSON.parse(message.data); }
            catch(e) {
                if( !this.bigMsg.isReceiving ) {console.log("Error in parsing data from server\n"); return;}
                //We have more than 1 part
                this.bigMsg.buffer+=message.data;
                this.bigMsg.partsLeft--;
                if (!this.bigMsg.partsLeft) {
                    var _buffer={"data":this.bigMsg.buffer};
                    this.bigMsg.buffer="";
                    this.bigMsg.isReceiving=false;
                    this.onmessage(_buffer);   
                    console.log("FINISHED ADDING");
                }
                return;
            }
            if ("parts" in data) {
                this.bigMsg.buffer="";
                this.bigMsg.isReceiving = true; 
                this.bigMsg.partsLeft = data["parts"];
                return;
            }
            var m = data.children;
            console.log(m);
            var $tbody = $("#metricsTable tbody");
            $tbody.find(">").remove();
            for(i=0;i<m.length;i++){
               $tbody.append("<tr>"+
                            "<td>"+m[i].ID+"</td>"+
                            "<td>"+m[i].DateTime+"</td>"+
                            "<td>"+m[i].Message+"</td>"+
                            "<td>"+m[i].Pid+"</td>"+
                            "<td>"+m[i].Severity+"</td>"+
                            "</tr>");    
            }
            page.cSocket = null;
            this.send("exit");
            this.onmessage="";
        },function(){ 
            var start = $("#findDateStart").val() ? $("#findDateStart").val() : "2013-12-31",
                end = $("#findDateEnd").val() ? $("#findDateEnd").val() : "2014-03-01",
                findstr = $("#findstr").val();
            if(findstr) {this.send( "cconsole-fulltextsearch:'"+findstr.replace("'","\"")+"'" );}
            else{
            this.send("cconsole-filterdate:"+start+" 00:00:00.000,"+end+" 23:59:00.000");
            }
            // 
        } );
        
    })
};