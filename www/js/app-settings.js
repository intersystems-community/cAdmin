 function script(){
     function SaveToDB(e){
         e.preventDefault();
         app.db.transaction(function(t){
             app.locale=$("#locale :selected").data("value");
             var sqlText= 'UPDATE APPLICATION SET localeName="'+app.locale+'"';
             console.log(sqlText);
            t.executeSql(sqlText);
        })
     }
     $("#save").on("click",SaveToDB);
 };