function script(){
    $(".server-menu").show("fast");
    $("button.nav-page").on("tap click",function(){ 
            app.nav.navigate("#content",$(this).attr("href"),"fast"); 
        });
    $("#sName").text(app.servers[app.selectedServer].serverSettings.serverName + " info");
        page.procMenu = "<div class=\"btn-group proc-menu notshown\">"+
  "<button type=\"button\" class=\"btn btn-default btn-sm\" data-action=\"Kill\">Kill</button>"+
  "<button type=\"button\" class=\"btn btn-default btn-sm\" data-action=\"Suspend\">Pause</button>"+
  "<button type=\"button\" class=\"btn btn-default btn-sm\" data-action=\"Resume\">Resume</button>"+
  "</div>";
        
    
    window.page._destruct = function(){
        if (!(page.metricsSocket || page.DBSocket || page.processSocket)){ return; }
        page.metricsSocket.send("exit");
        page.metricsSocket.close();
        page.DBSocket.send("exit");
        page.DBSocket.close()
        page.processSocket.send("exit");
        page.processSocket.close();
        delete page.metricsSocket;
        delete page.DBSocket;
        delete page.processSocket;
    };
    
    page.serverLink = "http://"+app.servers[app.selectedServer].serverSettings.server.match(/wss?:\/\/([^\/]+)/)[1];
    $(".docs").off("tap").on("tap",function(e){e.preventDefault(); window.open(page.serverLink+"/csp/docbook/DocBook.UI.Page.cls", "_system")});
    $(".webterm").on("tap",function(e){e.preventDefault(); window.open(page.serverLink+"/csp/sys/WebTerminal/index.csp", "_system")});
    $(".mportal").on("tap",function(e){e.preventDefault(); window.open(page.serverLink+"/csp/sys/UtilHome.csp", "_system")});
    
    
    

    
    //Helper funcs
    page.createPB = function(val){
        var temp = (val>10)? val+"%": '<span style="color:black">'+val+'%</span>';
        var el =    '<div class="progress">'+
                    '<div class="progress-bar" role="progressbar" aria-valuenow="'+val+'" aria-valuemin="0" aria-valuemax="100" style="width: '+val+'%;">'+
                    temp+
                    '</div>'+
                    '</div>';
        return el;
    }
    page.parseMetric = function( n,v ){
        var name='<span locId="'+n+'">'+n+'</span>';
        var parser={
            "Uptime": function(value){
                var days = Math.floor(value/ (3600*24)),
                    hours= Math.floor(value % (3600*24)/3600),
                    mins= Math.floor((value % 3600)/60),
                    secs= Math.floor((value % 3600)%60),
                    r_value="";
                //name='<span locId="Uptime">Uptime</span>';
                if(days) r_value += days + "<span locId=\"days\">d</span>:";
                if(hours || days) r_value += hours + "<span locId=\"hours\">h</span>:" 
                if(mins || hours || days) r_value+= mins + "<span locId=\"mins\">m</span>:"
                if(secs ||mins ||hours ||days) r_value+=secs+"<span locId=\"secs\">s</span>"; 
                return r_value;
            },
            "CPU":function(value){
                //name='<span locId="CPU">CPU</span>';
                return page.createPB(value);
            },
            "LockTable":function(value){
                return page.createPB(value);
            },
            "FreeJournalSpacePercent":function(value){ return page.createPB(value.toFixed(1)) },
            "CSPGatewayLatency":function(value){
                //name='<span locId="CSPGatewayLatency">CSPGatewayLatency</span>';
                return value + "<span locId=\"milliseconds\">ms</span>";
            },
            "JournalSpace":function(value){
                var gbytes = (value / 1024).toFixed(3),
                    mbytes = (value %1024).toFixed(0),
                    r_val="";
                if(gbytes) { r_val= gbytes + "<span locId=\"gigabytes\">GB</span> "; }
                else { r_val = mbytes+"<span locId=\"megabytes\">MB</span>"; }
                return r_val;
            }
        };
        var value = parser[n] ? parser[n](v) : v;
        return { name:name, value:value };
    };
    
    
    //Page scoped sockets
    page.metricsSocket = app.servers[app.selectedServer].createSocket( function(message) {
        var m = JSON.parse(message.data);
            console.log(m);
           for(var k in m){
               console.log(k);
               var obj = page.parseMetric(k,m[k]);
               var name=obj.name, value = obj.value;
               var $tbody = $("#metricsTable tbody");
               $tbody.append("<tr>"+
                            "<td>"+name+"</td>"+
                            "<td>"+value+"</td>"+
                            "</tr>"); 
               app.localization.localize("body", app.locale);
            };
            $(".metrics-header").find(".spinner-local") ? $(".metrics-header .spinner-local").remove() : "";
        }, function(){
            $(".metrics-header").find(".spinner-local") ? $(".metrics-header .spinner-local").remove() : "";
            $(".metrics-header").append("<span class=\"spinner-local\"></span>");
            this.send("sensors");
        } );

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
            this.send("db");
        } );
    
    page.processSocket = app.servers[app.selectedServer].createSocket( function(message){
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
                                page.processSocket.send( "process:"+ $(this).data("action")+","+ $this.find("td")[0].innerHTML);
                            });
                   }
                   return false;
                });
               
            };
            $(".pmanager-header").find(".spinner-local") ? $(".pmanager-header .spinner-local").remove() : "";
            
        }, function(){
        $(".pmanager-header").find(".spinner-local") ? $(".pmanager-header .spinner-local").remove() : "";
        $(".pmanager-header").append("<span class=\"spinner-local\"></span>");
        this.send("process:List");
        });
    

        
        
            
        
    }