function script(){
        $(".server-menu").show("fast");
        $("button.nav-page").on("touchend",function(){ app.nav.navigate("#content",$(this).attr("href"),"fast"); });
    window.page._destruct = function(){
        metricsSocket.close();
        delete metricsSocket;
    };
        app.servers[app.selectedServer].onProcList = function(pList) {
           for(i=0;i<pList.length;i++){
               var $tbody = $("#processTable tbody");
               $tbody.append("<tr>"+
                            "<td>"+pList[i].id+"</td>"+
                            "<td class=\"routine\">"+pList[i].routine+"</td>"+
                            "</tr>");
               $tbody.find("tr").last().on("touchend", function(){ 
                   $tbody.find(".proc-menu").remove();
                    var $this =  $(this),
                        $thisr = $this.find(".routine");
                   if(($thisr).hasClass(".menu-shown")) { $thisr.removeClass(".menu-shown"); $thisr.find(".btn-group").remove(); }
                   else {
                            $thisr.addClass(".menu-shown"); $thisr.append(page.procMenu); 
                            $thisr.find(".notshown").data("pID", $this.find("td")[0].innerHTML).removeClass(".notshown").show("fast");
                            $thisr.find(".btn").on("touchend", function(){
                                app.servers[app.selectedServer].sockets[0].send( "process:"+ $(this).data("action")+","+ $this.find("td")[0].innerHTML);
                            });
                   }
                });
               
            };
        };
    
        var metricsSocket = app.servers[app.selectedServer].createSocket( function(message) {
        var m = JSON.parse(message.data);
            console.log(m);
           for(var k in m){
               console.log(k);
               var $tbody = $("#metricsTable tbody");
               $tbody.append("<tr>"+
                            "<td>"+k+"</td>"+
                            "<td class=\"routine\">"+m[k]+"</td>"+
                            "</tr>");               
            };
        }, function(){this.send("sensors")} );
    
    
    
    //TODO: Create new socket for process:List
        app.servers[app.selectedServer].sockets[0].send("process:List");
        //metricsSocket.send("sensors"); 
        $("#sName").text(app.servers[app.selectedServer].serverSettings.serverName + " info");
        page.procMenu = "<div class=\"btn-group proc-menu notshown\">"+
  "<button type=\"button\" class=\"btn btn-default btn-sm\" data-action=\"Kill\">Kill</button>"+
  "<button type=\"button\" class=\"btn btn-default btn-sm\" data-action=\"Suspend\">Pause</button>"+
  "<button type=\"button\" class=\"btn btn-default btn-sm\" data-action=\"Resume\">Resume</button>"+
  "</div>";
        
            
        
    }