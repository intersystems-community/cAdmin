function script(){
        $(".server-menu").show("fast");
        $("button.nav-page").on("touchend",function(){ app.nav.navigate("#content",$(this).attr("href"),"fast"); });
    
    
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
                                app.servers[app.selectedServer].ws.send( "process:"+ $(this).data("action")+","+ $this.find("td")[0].innerHTML);
                            });
                   }
                });
               
            };
        };
    
    app.servers[app.selectedServer].onMetricsList = function(pList) {
           for(i=0;i<pList.length;i++){
               var key = Object.keys(pList[i])[0]; // {CPU:50} -> got "CPU"
               var $tbody = $("#metricsTable tbody");
               $tbody.append("<tr>"+
                            "<td>"+key+"</td>"+
                            "<td class=\"routine\">"+pList[i][key]+"</td>"+
                            "</tr>");               
            };
        };
    
    
        app.servers[app.selectedServer].ws.send("process:List");
        $("#sName").text(app.servers[app.selectedServer].serverSettings.serverName + " info");
        page.procMenu = "<div class=\"btn-group proc-menu notshown\">"+
  "<button type=\"button\" class=\"btn btn-default btn-sm\" data-action=\"Kill\">Kill</button>"+
  "<button type=\"button\" class=\"btn btn-default btn-sm\" data-action=\"Suspend\">Pause</button>"+
  "<button type=\"button\" class=\"btn btn-default btn-sm\" data-action=\"Resume\">Resume</button>"+
  "</div>";
        
            
        
    }