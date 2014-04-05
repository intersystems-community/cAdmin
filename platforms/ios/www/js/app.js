//
//
// Global object APP
// You push all the APP-scoped info and methods here
// For our purposes it will be: WebSockets data, Server objects
//
//


function App(){
    var _this = this;
}

var app = new App();
app.localization = new Localization();
app.servers = [];
app.nav = new Navigator();
app.db = window.openDatabase("cAdmin", "1.0", "Cordova Demo", 200000);


//
//************  Function for DB interaction
//
function errorSQL(err) {
    console.log("Error processing SQL: "+err.code);
    if (err.code=="6") { $(window).trigger("DBConnected"); }//Already have servers table
}
function populateDB(tx) {

    
    tx.executeSql('CREATE TABLE IF NOT EXISTS SERVERS (id unique, serverName, user, password, server, aupdate)');
    tx.executeSql('INSERT INTO SERVERS (id, serverName,user,password,server, aupdate) VALUES (0, "Glossary","cAdminUser","fg345hdgtjkb", "ws://glossary.intersystems.ru/csp/cAdmin/cAdmin.WebSocket.cls", "true")');
    tx.executeSql('INSERT INTO SERVERS (id, serverName,user,password,server, aupdate) VALUES (1, "STC","_SYSTEM","zckKqko12", "ws://146.185.172.47:57772/csp/user/cAdmin.WebSocket.cls", "true")');
    tx.executeSql('INSERT INTO SERVERS (id, serverName,user,password,server, aupdate) VALUES (2, "Predictive","root","zckKqko12", "ws://37.139.4.54:57773/csp/cAdmin/cAdmin.WebSocket.cls", "true")');

    $(window).trigger("DBConnected");
    console.log("SQL Table created.");
}

//Server init + sockets created
function InitServers(){
    app.db.transaction(function(t){
        t.executeSql("SELECT * FROM SERVERS",[], function(t,m) {
            for(i=0;i<m.rows.length;i++){
                window.app.servers.push(new Server( m.rows.item(i) ));
                app.servers[i].createSockets();
            }
            console.log('servers ready');
            $(window).trigger("ServersReady");
            $(window).trigger("AppAboutToReady");
        },function(t,m) {console.log(m)})
    })
};

//Loading app settings from local SQL DB
function LoadAppSettings(){
 app.db.transaction(function(t){
        t.executeSql('CREATE TABLE IF NOT EXISTS APPLICATION (localeName)');
        t.executeSql('INSERT INTO APPLICATION (localeName) VALUES ("en-US")');
        t.executeSql("SELECT * FROM APPLICATION",[], function(t,m) {
            window.app.locale=m.rows.item(0).localeName;
            console.log('settings loaded');
            $(window).trigger("AppReady");
            $(".spinner").hide();
        },function(t,m) {console.log(m)})
    })
}
                    
//When app is ready, navigate to main page
$(window).one("AppReady",function(){
        $("a.nav-page").on("tap click", function(e){
           e.preventDefault();
           app.nav.navigate("#content",$(this).attr('href'),"fast");
           });
        app.nav.navigate("#content","main.html");
    });

$(window).one("DBConnected", InitServers);
$(window).one("AppAboutToReady",LoadAppSettings);



if(app.db) {
        app.db.transaction(populateDB, errorSQL);
} else {
        console.log("error");
}

//Fix for both of inputs - tap and click
$("*").on("tap",function(){$(this).trigger("click")});

//
//          Sidebar UI interaction
//
 $(".sidebar .glyphicon").on("tap",function(e){
        e.preventDefault();
        var $el = $(".sidebar");
        if ( $el.hasClass("open-sidebar") ){
            $el.removeClass("open-sidebar"); 
        }else {
            $el.addClass("open-sidebar");   
        }
        return false;
    });
    $(".sidebar").focus(function(){console.log("focus"); }).focusout( function(){
                
                if ( $(".sidebar").hasClass("open-sidebar") ){
                        $(".sidebar").removeClass("open-sidebar"); 
                }
    })
    .swipe({
              swipeStatus:function(event, phase, direction, distance, duration, fingers)
                  {
                        
                      if (phase=="move" && direction =="right") {
                          console.log(1);
                        
                          $(".sidebar").click().focus();
                           $(".sidebar").addClass("open-sidebar");
                           return false;
                      }
                      if (phase=="move" && direction =="left") {
                           $(".sidebar").removeClass("open-sidebar");
                           return false;
                      }
                  }
          });
   $(".navbar-collapse.collapse").focusout(function(){$(".navbar-fixed-top .collapse").removeClass("in");})