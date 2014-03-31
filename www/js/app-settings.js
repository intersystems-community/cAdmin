 function script(){
     function SaveToDB(e){
         e.preventDefault();
         app.db.transaction(function(t){
             app.locale=$("#locale :selected").data("value");
             var sqlText= 'UPDATE APPLICATION SET localeName="'+app.locale+'"';
             console.log(sqlText);
            t.executeSql(sqlText);
            app.nav.navigate("#content","main.html");
        });
         return false;
     };
     //$("#save").on("click",SaveToDB);
     $("#back").off();
     $("#back").one("tap", SaveToDB);
 };