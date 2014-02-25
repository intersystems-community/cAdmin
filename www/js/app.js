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
//            app.serverData = [
//                {serverName:"Predictive", user:"root", password:"zckKqko12", server:"ws://37.139.4.54:57773/csp/cAdmin-Server/cAdmin.WebSocket.cls"}
////                {serverName:"REST server", user:"root", password:"zckKqko12", server:"ws://37.139.4.54:57773/csp/cAdmin-Server/cAdmin.WebSocket.cls"},
////                {serverName:"REST server2", user:"root", password:"zckKqko12", server:"ws://37.139.4.54:57773/csp/cAdmin-Server/cAdmin.WebSocket.cls"},
////                {serverName:"REST server3", user:"root", password:"zckKqko12", server:"ws://37.139.4.54:57773/csp/cAdmin-Server/cAdmin.WebSocket.cls"},
////                {serverName:"REST server4", user:"root", password:"zckKqko12", server:"ws://37.139.4.54:57773/csp/cAdmin-Server/cAdmin.WebSocket.cls"},
//                
//            ];

function errorCB(err) {
    console.log("Error processing SQL: "+err.code);
    //db.transaction(populateDB, errorCB, successCB);
}


function populateDB(tx) {
    tx.executeSql('DROP TABLE IF EXISTS SERVERS');
    tx.executeSql('CREATE TABLE IF NOT EXISTS SERVERS (id unique, serverName, user, password, server)');
    //console.log('INSERT INTO SETTINGS (id, name, value) VALUES ("user","'+user+'")');
    tx.executeSql('INSERT INTO SERVERS (id, serverName,user,password,server) VALUES (1, "Predictive","root","zckKqko12", "ws://37.139.4.54:57773/csp/cAdmin-Server/cAdmin.WebSocket.cls")');
      tx.executeSql('INSERT INTO SERVERS (id, serverName,user,password,server) VALUES (2, "REST","root","zckKqko12", "ws://37.139.4.54:57773/csp/cAdmin-Server/cAdmin.WebSocket.cls")');
      tx.executeSql('INSERT INTO SERVERS (id, serverName,user,password,server) VALUES (3, "Pentagon","root","zckKqko12", "ws://37.139.4.54:57773/csp/cAdmin-Server/cAdmin.WebSocket.cls")');
   // tx.executeSql('INSERT INTO SETTINGS (id, name, value) VALUES (2, "user","'+password+'")');
    //tx.executeSql('INSERT INTO SETTINGS (id, name, value) VALUES (3, "srvip","'+srvip+'")');
        
    console.log("saved.");
}


app.servers = [];
//for(i=0;i<app.serverData.length;i++) {
//    window.app.servers.push(new Server("#widget"+(i+1), app.serverData[i]));
//    window.app.servers[i].onalert = function(m) {
//        var c = new Date();
//        $("#cconsole").prepend("<tr class=\"notshown\">"+
//        "<td>"+getClockTime()+"</td>"+
//        "<td>"+this.serverSettings.serverName+"</td>"+
//        "<td>"+m+"</td>"+
//        "</tr>");
//        $(".notshown").show('slow').removeClass("notshown");
//    };
//    app.servers[i].createSockets();
//}

app.db = window.openDatabase("cAdmin", "1.0", "Cordova Demo", 200000);
if(app.db) {
        app.db.transaction(populateDB, errorCB);
    } else {
        console.log("error");}

app.db.transaction(function(t){
    t.executeSql("SELECT * FROM SERVERS",[], function(t,m) {
        for(i=0;i<m.rows.length;i++){
            window.app.servers.push(new Server("#widget"+(i+1), m.rows.item(i)));
            window.app.servers[i].onalert = function(m) {
                var c = new Date();
                $("#cconsole").prepend("<tr class=\"notshown\">"+
                "<td>"+getClockTime()+"</td>"+
                "<td>"+this.serverSettings.serverName+"</td>"+
                "<td>"+m+"</td>"+
                "</tr>");
                $(".notshown").show('slow').removeClass("notshown");
            };
            app.servers[i].createSockets();
        }
    },function(t,m) {console.log(m)})
})


