//
//
// Global object APP
// You push all the APP-scoped info and methods here
// For our purposes it will be: WebSockets data, serverSettings
//
//


function App(){
    var _this = this;
}

var app = new App();

//
//************  Function for DB interaction
//
function errorSQL(err) {
    console.log("Error processing SQL: "+err.code);
    if (err.code=="6") { $(window).trigger("DBConnected"); }//Already have servers table
}
function populateDB(tx) {
    //tx.executeSql('DROP TABLE IF EXISTS SERVERS');
    tx.executeSql('CREATE TABLE IF NOT EXISTS SERVERS (id unique, serverName, user, password, server, aupdate)');
    tx.executeSql('INSERT INTO SERVERS (id, serverName,user,password,server, aupdate) VALUES (0, "Predictive","root","zckKqko12", "ws://37.139.4.54:57773/csp/cAdmin-Server/cAdmin.WebSocket.cls", "false")');
     tx.executeSql('INSERT INTO SERVERS (id, serverName,user,password,server,aupdate) VALUES (1, "REST","root","zckKqko12", "ws://37.139.4.54:57773/csp/cAdmin-Server/cAdmin.WebSocket.cls", "true")');
     tx.executeSql('INSERT INTO SERVERS (id, serverName,user,password,server,aupdate) VALUES (2, "Pentagon","root","zckKqko12", "ws://37.139.4.54:57773/csp/cAdmin-Server/cAdmin.WebSocket.cls", "true")');
     tx.executeSql('INSERT INTO SERVERS (id, serverName,user,password,server,aupdate) VALUES (3, "4","root","zckKqko12", "ws://37.139.4.54:57773/csp/cAdmin-Server/cAdmin.WebSocket.cls", "true")');
     tx.executeSql('INSERT INTO SERVERS (id, serverName,user,password,server,aupdate) VALUES (4, "5","root","zckKqko12", "ws://37.139.4.54:57773/csp/cAdmin-Server/cAdmin.WebSocket.cls", "true")');
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
            $(window).trigger("AppReady");
        },function(t,m) {console.log(m)})
    })
};

app.servers = [];
app.nav = new Navigator();
    $(window).one("ServersReady",function(){
        app.nav.navigate("#content","main.html");
    });

$(window).one("DBConnected", InitServers);

app.db = window.openDatabase("cAdmin", "1.0", "Cordova Demo", 200000);
if(app.db) {
        app.db.transaction(populateDB, errorSQL);
    } else {
        console.log("error");}





