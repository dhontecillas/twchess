function ShareBox( divname )
{
    this.sharediv = document.getElementById( divname ); 
    var urldata = /(.*)\/(.*)/.exec( document.URL ); 
    if( urldata != null ){ 
        this.encodedGame = urldata[2];
        this.baseUrl = urldata[1]; 
    }else{
        this.encodedGame = null;
    }
}


ShareBox.prototype.LoadTwitterButton = function(d,s,id){
var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="http://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}
}

ShareBox.prototype.Show = function( encodedBoard ) 
{
    var tweet = document.getElementById( 'tweeboxlink' ); 
    tweet.setAttribute( "data-text", this.baseUrl + "/" + encodedBoard ); 
    this.LoadTwitterButton( document,"script","twitter-wjs" );
    var moveUrl = document.getElementById( 'moveurl' ); 
    moveUrl.innerHTML = '<a id="moveurl" href="'+ this.baseUrl + "/" + 
                         encodedBoard + '">' + encodedBoard + '</a>';  
     
    this.sharediv.className = ''; 
}

ShareBox.prototype.Hide = function()
{
    this.sharediv.className = 'hidden'; 
}

function StatusBox( divname ) 
{
    this.statusbox = document.getElementById( "statusbox" ); 
}
StatusBox.prototype.Hide = function()
{
    this.statusbox.className = "hidden"; 
}
StatusBox.prototype.Show = function()
{
    this.statusbox.className = ""; 
}
StatusBox.prototype.WriteText = function( text, style )
{
    this.statusbox.innerHTML = '<h2>' + text + '</h2>'; 
}


