
function Server( container , serverSettings ) {
    var τ = 2 * Math.PI; 
    var _this = this;
//    _this.container = container;
    _this.thickness = 1;
    _this.distance = 5;
    _this.interval = 1500;
    _this.data = {endAngle:0.127*τ};    //data for CPU ring
    _this.data2 = {endAngle:0.127*τ};   //data for HDD ring
    _this.container = container || "";
    _this.serverSettings = serverSettings;
    _this.onalert=function(t){console.log(t)};
    _this.onProcList = function(t) {console.log(t)};
    _this.onSocketsCreated = function(t){console.log(t);}
    _this.sockets=[];
    _this.createSocket = function( msgHandler ) {
        ws = new WebSocket( _this.serverSettings.server );  
        ws.onopen = function(){ 
            this.send( JSON.stringify( 
                {
                    User:_this.serverSettings.user,
                    Password:_this.serverSettings.password
                })); 
            if(this.readyState==1 && _this.onSocketsCreated) _this.onSocketsCreated();
        }
        ws.onmessage = msgHandler;
        _this.sockets.push(ws);
    };
    
    _this.create = function( successHandler ){
        
       _this.createSocket( function(message) {
            //Getting JSON data from server
            var data=""
            try { data = JSON.parse(message.data); } 
            catch(e) { console.log("Error in parsing data from server\n"+message.data); return;}
            //Checking what we have
            if ("RandomNumber" in data) { _this.data = {endAngle: data.RandomNumber/100 * τ}; _this.updateCPUring(); }
            if ("Increment" in data) { _this.data2 = {endAngle: data.Increment/100 * τ}; _this.updateHDDring(); }
            if ("processes" in data) { _this.onProcList(data.processes); }
            });
        
        _this.createSocket(function(message) {
            //Getting JSON data from server
            var data=""
            try { data = JSON.parse(message.data); } 
            catch(e) { console.log("Error in parsing data from server\n"+message.data); return;}
            //Checking what we have
            if ("alert" in data) { _this.onalert(data.alert) }
            });
        
    
    //
    //***********   Drawing part
    //
     _this.svg = d3.select(_this.container).append("svg")
    .attr("width", $(_this.container).attr("width"))
    .attr("height",$(_this.container).attr("height"))
    .append("g")
    .attr("transform", "translate(" + $("svg").width()/2+ "," + $("svg").height()/2 + ")");
    
    //outer ring = CPU
     _this.arc = d3.svg.arc()
    .innerRadius($(_this.container).width()/Math.PI-_this.thickness)
    .outerRadius($(_this.container).width()/Math.PI)
    .startAngle(0);
    
    //inner ring = HDD
    _this.arc2 = d3.svg.arc()
    .innerRadius($(_this.container).width()/Math.PI - _this.distance-2*_this.thickness)
    .outerRadius($(_this.container).width()/Math.PI - _this.distance-_this.thickness)
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

_this.getData = function( interval ){
    _this.CPUupdate = window.setInterval(function(){_this.sockets[0].send( "sensors:RandomNumber" ); },_this.interval); 
    _this.HDDupdate = window.setInterval(function(){_this.sockets[0].send( "sensors:Increment" );  },2*_this.interval);
    };

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
