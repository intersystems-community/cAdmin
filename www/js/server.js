function script(){
    $(".server-menu").show("fast");
    $("button.nav-page").on("tap click",function(){ 
            app.nav.navigate("#content",$(this).attr("href"),"fast"); 
        });
    
    
    window.page._destruct = function(){
        if (!(page.metricsSocket && page.DBSocket)){ return; }
        page.metricsSocket.send("exit");
        page.metricsSocket.close();
        page.DBSocket.send("exit");
        page.DBSocket.close()
        delete page.metricsSocket;
        delete page.DBSocket;
    };
    
    page.serverLink = "http://"+app.servers[app.selectedServer].serverSettings.server.match(/wss?:\/\/([^\/]+)/)[1];
    $(".docs").off("tap").on("tap",function(e){e.preventDefault(); window.open(page.serverLink+"/csp/docbook/DocBook.UI.Page.cls", "_system")});
    $(".webterm").on("tap",function(e){e.preventDefault(); window.open(page.serverLink+"/csp/sys/WebTerminal/index.csp", "_system")});
    $(".mportal").on("tap",function(e){e.preventDefault(); window.open(page.serverLink+"/csp/sys/UtilHome.csp", "_system")});
    
    
    app.servers[app.selectedServer].sockets["process"] = app.servers[app.selectedServer].createSocket( function(message){
            var data = "";
            try { data = JSON.parse(message.data) }
            catch(e) {
                if( !this.bigMsg.isReceiving ) {console.log("Error in parsing data from server\n"+message.data); return;}
                //We have more than 1 part
                this.bigMsg.buffer+=message.data;
                this.bigMsg.partsLeft--;
                if (!this.bigMsg.partsLeft) {
                    var _buffer={"data":this.bigMsg.buffer};
                    this.bigMsg.buffer="";
                    this.bigMsg.isReceiving=false;
                    this.onmessage(_buffer);                
                }
            }
            console.log(data);
            //Do we have more than 1 part?
            if ("parts" in data) {
                alert("parts started");
                this.bigMsg.isReceiving = true; 
                this.bigMsg.partsLeft = data["parts"];
                return;
            }
            var pList = data.processes;
            //Finally got all the data
            for(i=0;i<pList.length;i++){
               var $tbody = $("#processTable tbody");
               $tbody.append("<tr>"+
                            "<td>"+pList[i].id+"</td>"+
                            "<td class=\"routine\">"+pList[i].routine+"</td>"+
                            "</tr>");
               $tbody.find("tr").last().on("tap", function(e){ 
                   $tbody.find(".proc-menu").remove();
                   e.preventDefault();
                    var $this =  $(this),
                        $thisr = $this.find(".routine");
                   if(($thisr).hasClass(".menu-shown")) { $thisr.removeClass(".menu-shown"); $thisr.find(".btn-group").remove(); }
                   else {
                            $thisr.addClass(".menu-shown"); $thisr.append(page.procMenu); 
                            $thisr.find(".notshown").data("pID", $this.find("td")[0].innerHTML).removeClass(".notshown").show("fast");
                            $thisr.find(".btn").on("tap", function(){
                                app.servers[app.selectedServer].sockets["process"].send( "process:"+ $(this).data("action")+","+ $this.find("td")[0].innerHTML);
                            });
                   }
                   return false;
                });
               
            };
            $(".pmanager-header").find(".spinner-local") ? $(".pmanager-header .spinner-local").remove() : "";
            
        }, function(){
            $(".pmanager-header").find(".spinner-local") ? $(".pmanager-header .spinner-local").remove() : "";
        $(".pmanager-header").append("<span class=\"spinner-local\"></span>");
        app.servers[app.selectedServer].sockets["process"].send("process:List");
        
        });
    
        page.metricsSocket = app.servers[app.selectedServer].createSocket( function(message) {
        var m = JSON.parse(message.data);
            console.log(m);
           for(var k in m){
               console.log(k);
               var name=k, value=m[k];
               if (k=="Uptime") {
                   var hours= Math.floor(value/3600);
                   var mins= Math.floor((value % 3600)/60);
                   var secs= Math.floor((value % 3600)%60);
                   value = hours + ":" + mins + ":"+secs; 
               }
               var $tbody = $("#metricsTable tbody");
               $tbody.append("<tr>"+
                            "<td>"+name+"</td>"+
                            "<td>"+value+"</td>"+
                            "</tr>");               
            };
            $(".metrics-header").find(".spinner-local") ? $(".metrics-header .spinner-local").remove() : "";
        }, function(){
            $(".metrics-header").find(".spinner-local") ? $(".metrics-header .spinner-local").remove() : "";
            $(".metrics-header").append("<span class=\"spinner-local\"></span>");
            this.send("sensors")} );
    
    page.DBSocket = app.servers[app.selectedServer].createSocket( function(message) {
        var m = JSON.parse(message.data);
            console.log(m);
            var $tbody = $("#dbtable");
           for(i=0;i<m.Databases.length;i++){
               //console.log(k);
               var dbName=m.Databases[i].Name;
               var dbInfo="";
               for(var k in m.Databases[i]){ if(k=="Name") continue; dbInfo+="<p>"+k+": "+m.Databases[i][k]+"</p>"; }
               $tbody.append('<div class="panel panel-default">'+
                                '<div class="panel-heading">'+
                                '<h4 class="panel-title">'+
                                '<a data-toggle="collapse" data-parent="#dbtable" href="#collapse'+i+'">'+
                                dbName+
                                '</a>'+
                                '</h4>'+
                                '</div>'+
                                '<div id="collapse'+i+'" class="panel-collapse collapse">'+
                                '<div class="panel-body">'+
                                dbInfo+
                                '</div>'+
                                '</div>'+
                                '</div>');
               
            };
        $(".panel-heading").on("tap",function(e){ e.preventDefault(); $(this).find('a').click(); return false; });
        $(".db-header").find(".spinner-local") ? $(".db-header .spinner-local").remove() : "";
        }, function(){
            $(".db-header").find(".spinner-local") ? $(".db-header .spinner-local").remove() : "";
            $(".db-header").append("<span class=\"spinner-local\"></span>");
            this.send("db")
        } );
    
    

        
        $("#sName").text(app.servers[app.selectedServer].serverSettings.serverName + " info");
        page.procMenu = "<div class=\"btn-group proc-menu notshown\">"+
  "<button type=\"button\" class=\"btn btn-default btn-sm\" data-action=\"Kill\">Kill</button>"+
  "<button type=\"button\" class=\"btn btn-default btn-sm\" data-action=\"Suspend\">Pause</button>"+
  "<button type=\"button\" class=\"btn btn-default btn-sm\" data-action=\"Resume\">Resume</button>"+
  "</div>";
        
            
        
    }