   function script(){
       function CreateServer(){
           app.db.transaction(function(tx){
               var newId = app.servers.length;
               tx.executeSql('INSERT INTO SERVERS (id, serverName,user,password,server,aupdate) VALUES ('+newId+', "New Server","","", "", "true")');
           }, function(m){console.log(m)});
       }
       $("a.nav-page").off("tap click").on("tap click", function(e){
           e.preventDefault();
           app.nav.navigate("#content",$(this).attr('href'),"fast");
           });
       
       $("#createServer").on("tap click", function(){
           CreateServer();
           app.servers.push( new Server({id:app.servers.length, serverName:"New Server", user:"root", password:"zckKqko12", server:"ws://37.139.4.54:57773/csp/cAdmin/cAdmin.WebSocket.cls"}) );
           app.selectedServer = app.servers.length-1;
           app.nav.navigate("#content","server-settings.html","fast");
                   });
       
       $(".server-menu").css("display","none");
       
       window.page._destruct = function(){
                       for(i=0;i<window.app.servers.length;i++) {
                           //clearInterval(app.servers[i].CPUupdate);
                           //clearInterval(app.servers[i].HDDupdate);
                        };
                   };
       
       $(window).one("WidgetsCreated", function(){
           $(".widget").on("tap click", function(){ 
               app.selectedServer = $(this).attr("id").match(/widget(.)/)[1]; 
               app.nav.navigate("#content","server.html","fast"); 
            });
           
           
       });

      
       //Creating widgets
        for(i=0;i<window.app.servers.length;i++) {
                if ($(".widget-area").find("#widget"+i)[0]!=undefined) continue;
               $(".widget-area").append("<div class=\"widget\" id=\"widget"+i+"\" width=220 height=220></div>");
               window.app.servers[i].container="#widget"+i;
               window.app.servers[i].create();
        }
       $(window).trigger("WidgetsCreated");
       
                       
                    
       $(".widget").css("cursor", "default");
   }
                   
   