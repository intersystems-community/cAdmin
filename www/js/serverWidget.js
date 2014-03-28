
function Server( serverSettings ) {
    var τ = 2 * Math.PI; 
    var _this = this;
//    _this.container = container;
    _this.thickness = 5;
    _this.distance = 10;
    _this.interval = 1500;
    _this.data = {endAngle:0.127*τ};    //data for CPU ring
    _this.data2 = {endAngle:0.127*τ};   //data for HDD ring
    _this.container = "";
    _this.serverSettings = serverSettings;
    _this.onProcList = function(t) {console.log(t)};
    _this.onSocketsCreated = function(t){console.log(t);}
    _this.sockets=[];
    
    _this.onalert = function(m) {
        var $console = $("#cconsole");
        if (!$console) return;
        var c = new Date();
        $console.prepend("<tr class=\"notshown\">"+
        "<td>"+getClockTime()+"</td>"+
        "<td>"+_this.serverSettings.serverName+"</td>"+
        "<td>"+m+"</td>"+
        "</tr>");
        $(".notshown").show('slow').removeClass("notshown");
        };
    
    _this.createSocket = function( msgHandler, onCreated ) {
        var ws="";
        try{ ws = new WebSocket( _this.serverSettings.server );  } 
        catch(e){ console.log(e);return; }
        ws.bigMsg = {
            buffer:"",
            isReceiving:false,
            partsLeft:0
        };
        ws.onopen = function(){ 
            this.send( JSON.stringify( 
                {
                    User:_this.serverSettings.user,
                    Password:_this.serverSettings.password
                })); 
            if(this.readyState==1 && onCreated) onCreated.call(this);
        }
        ws.onmessage = msgHandler;
        //_this.sockets.push(ws);
        return ws;
    };
    
    _this.createSockets = function(){
        //Socket #1 for widget
        _this.sockets["widget"] = _this.createSocket( function(message) {
            //Getting JSON data from server
            var data=""
            try { data = JSON.parse(message.data); } 
            catch(e) { console.log("Error in parsing data from server\n"+message.data); return; }
            //Checking what we have
            if ("CPU" in data) { _this.data = {endAngle: data.CPU/100 * τ}; _this.updateCPUring(); }
            if ("Increment" in data) { _this.data2 = {endAngle: data.Increment/100 * τ}; _this.updateHDDring(); }
            //if ("processes" in data) { _this.onProcList(data.processes); }
            
            //_this.onalert(JSON.stringify(data)); 
            },function(){ 
                var s=this;
                if(_this.serverSettings.aupdate!="false"){
                _this.CPUupdate = window.setInterval(function(){s.send( "Sensors:CPU" ); },_this.interval); 
                _this.HDDupdate = window.setInterval(function(){s.send( "devtools:Increment" );  },2*_this.interval);
                _this.onalert("Connected");
                }
            });
        
        
        //Socket #2 for alerts
        _this.sockets["alerts"] = _this.createSocket(function(message) {
            //Getting JSON data from server
            console.log("scoket", this);
            var data="";
            try { data = JSON.parse(message.data); } 
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
             _this.onalert(data.children[0].Message);
            },function(){ if(_this.serverSettings.aupdate=="true"){this.send("cconsole-alert"); _this.onalert("Connected");}});
        
    };
    
    
    _this.create = function( successHandler ){    
    //
    //***********   Drawing part
    //
     _this.svg = d3.select(_this.container).append("svg")
    .attr("width", $(_this.container).attr("width"))
    .attr("height",$(_this.container).attr("height"))
    .append("g")
    .attr("fill-opacity",function(){if ( _this.serverSettings.aupdate.toString()!="true" ) {return "0.3"} else {return "1";} })
    .attr("transform", "translate(" + $("svg").width()/2+ "," + $("svg").height()/2 + ")");
    
    //outer ring = CPU
     _this.arc = d3.svg.arc()
    .innerRadius($(_this.container).width()/2.5-_this.thickness)
    .outerRadius($(_this.container).width()/2.5)
    .startAngle(0);
    
    //inner ring = HDD
    _this.arc2 = d3.svg.arc()
    .innerRadius($(_this.container).width()/2.5 - _this.distance-2*_this.thickness)
    .outerRadius($(_this.container).width()/2.5 - _this.distance-_this.thickness)
    .startAngle(0);
            
    // Add the background arc for CPU, from 0 to 100% (τ).
    _this.background = _this.svg.append("path")
    .datum({endAngle: τ})
    .style("fill", "#ccc")
    .attr("d", _this.arc);
        
    // Add the background arc for HDD, from 0 to 100% (τ).
    _this.background2 = _this.svg.append("path")
    .datum({endAngle: τ})
    .style("fill", "#ccc")
    .attr("d", _this.arc2);

    // Add the foreground arc for CPU
    _this.foreground = _this.svg.append("path")
    .datum(_this.data)
    .style("fill", function(d) {console.log(d);return "rgb(50, 235, 0)"})
    .attr("d", _this.arc);
    
    //Add the foreground arc for HDD
    _this.foreground2 = _this.svg.append("path")
    .datum(_this.data2)
    .style("fill", "rgb(255, 235, 0)")
    .attr("d", _this.arc2);

    //Server name
    _this.svg.append("svg:text")                                   
    .attr("transform", function() {         
        var d={innerRadius:0}; 
        return "translate(" + _this.arc.centroid(d) + ")";        
        })
    .attr("text-anchor", "middle") 
    .style("font-size","1em")   
    .attr("fill","black")  
    .style("font-family","\"Helvetica Neue\", Helvetica, Arial, sans-serif")
    .style("font-weight",100)
    .attr("dy","0.35em")
    .text(_this.serverSettings.serverName); 
    
        //WSS icon
    _this.svg.append("svg:image")                                   
    .attr("transform", function() {         
        return "translate(0,0)"; 
        })
    .style("display", function(){ 
        if ( _this.sockets["widget"] && _this.sockets["widget"].url.match(/wss:\/\//) ){
            return "";
        }
        return "none";
    })
    .attr("xlink:href", "img/wss.png")
    .attr("x", "60")
    .attr("y", "60")
    .attr("width", "20")
    .attr("height", "20");
    
    //CPU RING label
    _this.svg.append("svg:text")                                   
    .attr("transform", function(d,i) {  
        var c = _this.arc.centroid({innerRadius:"0px", outerRadius:"50px", startAngle:0, endAngle:0});
        console.log(c);
        //console.log(_this.arc.innerRadius());
        //window.arc = _this.arc;
        return "translate(" + (c[0]) + "," + (c[1]) + ")";    
        })
    .attr("text-anchor", "middle") 
    .style("font-size","0.5em")   
    .attr("fill","black")  
    .style("font-family","\"Helvetica Neue\", Helvetica, Arial, sans-serif")
    .style("font-weight",400)
    .attr("dy","0.35em")
    .text("CPU"); 
        
        //HDD RING label
    _this.svg.append("svg:text")                                   
    .attr("transform", function(d,i) {  
        var c = _this.arc2.centroid({innerRadius:"0px", outerRadius:"50px", startAngle:0, endAngle:0});
        console.log(c);
        //console.log(_this.arc.innerRadius());
        //window.arc = _this.arc;
        return "translate(" + (c[0]) + "," + (c[1]) + ")";    
        })
    .attr("text-anchor", "middle") 
    .style("font-size","0.5em")   
    .attr("fill","black")  
    .style("font-family","\"Helvetica Neue\", Helvetica, Arial, sans-serif")
    .style("font-weight",400)
    .attr("dy","0.35em")
    .text("HDD"); 
            //successHandler();
    
};
   

//
// ********** Functions
//

//Animation of CPU ring
 _this.arcTween = function(transition,data) {
    transition.attrTween("d", function(d) {
    var interpolate = d3.interpolate(d.endAngle, _this.data.endAngle);
    return function(t) { d.endAngle = interpolate(t); return _this.arc(d); };
    });};

//Animation of HDD ring    
_this.arcTween2 = function(transition,data) {
    transition.attrTween("d", function(d) {
    var interpolate = d3.interpolate(d.endAngle, _this.data2.endAngle);
    return function(t) { d.endAngle = interpolate(t);return _this.arc2(d); };       
    });};   

_this.updateCPUring = function(){
    var newColor="rgb("+(_this.data.endAngle.toFixed(0)*40)+", "+(255-_this.data.endAngle.toFixed(0)*20)+", 0)";
    _this.foreground.transition()
    .duration(750)
    .style("fill",function() { return newColor; })
    .call(_this.arcTween,_this.data);
    };
    
_this.updateHDDring = function(){
    var newColor="rgb("+(_this.data2.endAngle.toFixed(0)*40)+", "+(255-_this.data2.endAngle.toFixed(0)*20)+", 0)";
    _this.foreground2.transition()
    .duration(750)
    .style("fill",function() {return newColor; })
    .call(_this.arcTween2,_this.data2);
    };
}
