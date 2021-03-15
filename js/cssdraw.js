function CssChessBoard( boarddiv, callbackObject ) 
{
    this.boarddiv = boarddiv;
    this.callbackObject = callbackObject; 
    this.overX = -1;
    this.overY = -1;  
    this.pieceNames = [ 'P', 'p', 'R', 'r', 'N', 'n' , 'B', 'b', 'Q', 'q', 'K', 'k' ]; 
    this.pieceImages = {}; 

    for( var pp = 0; pp < this.pieceNames.length; ++pp ){
        var imgfile = 'imgs/'; 
        var p = this.pieceNames[ pp ];
        if( /[a-z]/.test(p) ){ 
            imgfile += p + 'dt.png'; 
        }else{
            imgfile += p.toLowerCase() + 'lt.png';  
        }
        this.pieceImages[ p ] = imgfile;
    }
    this.pieceImages['c'] = this.pieceImages['r']; 
    this.pieceImages['C'] = this.pieceImages['R']; 
    this.pieceImages['e'] = this.pieceImages['p']; 
    this.pieceImages['E'] = this.pieceImages['P']; 
} 

CssChessBoard.prototype.CreateBoard = function()
{
    var thisObject = this;
    for( var i = 0; i < 8; ++i ){
        var drow = document.createElement( 'div' );
        drow.setAttribute( "class", "br" );
        for( var j = 0; j < 8; ++j ){
            var dcell = document.createElement( 'span' );
            if( (i + j) % 2 == 0 ){
                dcell.setAttribute( "class" , "bcw" ); 
            }else{
                dcell.setAttribute( "class", "bcb" );
            } 
            dcell.id = "bcell_" + j + "_" + i;   
            dcell.setAttribute( "x" , j); 
            dcell.setAttribute( "y" , i);
            dcell.onmouseover = function( e ){ thisObject.OnMouseOver( e ) };
            dcell.onclick = function( e ){ thisObject.OnMouseClick( e );}; 
            drow.appendChild( dcell );
        }
        this.boarddiv.appendChild( drow );
        this.boarddiv.onmouseout = function( e ){ thisObject.OnMouseOut( e ); };
    }
}

CssChessBoard.prototype.OnMouseOver = function( e )
{
    if( this.callbackObject != null ){       
        x = parseInt( e.currentTarget.getAttribute( "x" ) ); 
        y = parseInt( e.currentTarget.getAttribute( "y" ) );
        cell = document.getElementById( "bcell_" + x + "_" + y ); 
        this.callbackObject.OnChessBoardCellOver( x, y ); 
    } 
}

CssChessBoard.prototype.OnMouseClick = function( e )
{
    if( this.callbackObject != null ){       
        x = parseInt( e.currentTarget.getAttribute( "x" ) ); 
        y = parseInt( e.currentTarget.getAttribute( "y" ) );
        cell = document.getElementById( "bcell_" + x + "_" + y ); 
        this.callbackObject.OnChessBoardCellClick( x, y ); 
    } 
}

CssChessBoard.prototype.OnMouseOut = function( e ) 
{
    if( this.callbackObject != null ){
        this.callbackObject.OnChessBoardOut(); 
    }    
} 

CssChessBoard.prototype.ClearMarker = function( x, y ) 
{
    if( x >= 0 && y >= 0 && x < 8 && y < 8 ){ 
        var cell = document.getElementById( "bcell_" + x + "_" + y ); 
        cell.removeAttribute( "marker" ); 
    } 
}

CssChessBoard.prototype.DrawMarker = function( x, y, color ) 
{
    if( x >= 0 && y >= 0 && x < 8 && y < 8 ){ 
        var cell = document.getElementById( "bcell_" + x + "_" + y ); 
        cell.setAttribute( "marker", color ); 
    } 
}

CssChessBoard.prototype.ClearBoard = function( )
{
    for( var y = 0; y < 8; ++y ){ 
        for( var x = 0; x < 8; ++x ){  
            var cell = document.getElementById( "bcell_" + x + "_" + y );
            if( cell != null ){
                var imgs = cell.getElementsByTagName( "img" ); 
                if( imgs.length > 0 ){ 
                    cell.removeChild( imgs[0] ); 
                }
            }  
        }
    }
}

CssChessBoard.prototype.DrawPiece = function( piece, x, y ) 
{ 
    var cell = document.getElementById( "bcell_" + x + "_" + y );
    var imgs = cell.getElementsByTagName( "img" ); 
    var img; 
    if( imgs.length > 0 ){
        img = imgs[0];
        cell.removeChild( img );
    }
    
    if( piece != null ){ 
        img = document.createElement( "img" ); 
        img.src = this.pieceImages[ piece ]; 
        cell.appendChild( img ); 
    } 
}
/*
CssChessBoard.prototype.ShowPromotionSelection = function( isWhiteTurn )
{
    var promobox; 
    if( isWhiteTurn ){ 
        promobox = document.getElementById( "white_promotion" ); 
    }else{ 
        promobox = document.getElementById( "black_promotion" );
    }

    if( promobox != null ){ 
        promobox.className = "promoselection"; 
    } 
}

CssChessBoard.prototype.HidePromotionSelection = function()
{
    var wp = document.getElementById( "white_promotion" ); 
    if( wp != null ){ 
        wp.className = "hidden";
    } 

    var bp = document.getElementById( "black_promotion" ); 
    if( bp != null ){ 
        bp.className = "hidden"; 
    } 
}

CssChessBoard.prototype.DisplayStatus = function( text, style ) 
{
    var sb = document.getElementById( "statusbox" ); 
    sb.setInnerHTML = "<h2>" + text + "</h2>";  
}


CssChessBoard.prototype.HideStatus = function( text, style ) 
{
    var sb = document.getElementById( "statusbox" ); 
    sb.className = "hidden"; 
}

CssChessBoard.prototype.DisplayShareBox = function()
{
    var mv = document.getElementById( "move" );
    var tweet = document.getElementById( 'tweeboxlink' ); 
    tweet.setAttribute( "data-text", baseUrl + "/" + encodedBoard ); 
    loadTW( document,"script","twitter-wjs" );
    mv.className = ""; 
}

*/
