   function script(){
                    $("a").on("touchend", function(e){
                        e.preventDefault();
                        app.nav.navigate("#content",$(this).attr('href'),"fast");
                    });
                   $("button.nav-page").on("touchend", function(){
                        app.servers.push(new Server("body", {serverName:"New server"}));
                        app.selectedServer = app.servers.length-1;
                        app.nav.navigate("#content","server-settings.html","fast");
                   });
                   $(".server-menu").css("display","none");
                    window.page._destruct = function(){
                       for(i=0;i<window.app.servers.length;i++) {
                           clearInterval(app.servers[i].CPUupdate);
                           clearInterval(app.servers[i].HDDupdate);
                        };
                   };
                    window.app.servers = [];
                    for(i=0;i<app.serverData.length;i++) {
                        window.app.servers.push(new Server("#widget"+(i+1), app.serverData[i]));
                         window.app.servers[i].onalert = function(m) {
                            var c = new Date();
                            $("#cconsole").prepend("<tr class=\"notshown\">"+
                            "<td>"+getClockTime()+"</td>"+
                            "<td>"+this.serverSettings.serverName+"</td>"+
                            "<td>"+m+"</td>"+
                            "</tr>");
                            $(".notshown").show('slow').removeClass("notshown");
                        };
                        window.app.servers[i].onSocketsCreated = function(){ this.onalert("Connected");  };
                        window.app.servers[i].create();
                        window.app.servers[i].getData();
                       
                    }
                    $("#widget1").css("cursor", "default");
                   
                    $(".widget").on("touchend", function(){ 
                        app.selectedServer = $(this).attr("id").match(/widget(.)/)[1]-1; 
                        app.nav.navigate("#content","server.html","fast"); 
                    });
               };
