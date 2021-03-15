function PiecePromotion( divname )
{
    this.promobox = document.getElementById( divname ); 
    var imgs = [ 'pwq', 'pwr', 'pwn', 'pwb', 
                 'pbq', 'pbr', 'pbn', 'pbb' ]; 
    var thisObj = this; 
    for( var i=0; i < imgs.length; ++i ){ 
        var img = document.getElementById( imgs[i] ); 
        if( img != null ){
            img.onmouseover = function( e ){ thisObj.OnMouseOverPromotion(e)}; 
            img.onclick = function( e ){ thisObj.OnClickPromotion(e)};
            img.className = 'promounselected'; 
        }
    } 
}

PiecePromotion.prototype.OnMouseOverPromotion = function( e )
{
    this.ClearPromoBackgrounds(); 
    event.target.className = 'promoselection';
}

PiecePromotion.prototype.ClearPromoBackgrounds = function()
{
    var imgs = [ 'pwq', 'pwr', 'pwn', 'pwb', 
                 'pbq', 'pbr', 'pbn', 'pbb' ]; 

    for( var i=0; i < imgs.length; ++i ){ 
        var img = document.getElementById( imgs[i] ); 
        if( img != null ){
            img.className = 'promounselected'; 
        }
    } 
}

PiecePromotion.prototype.OnClickPromotion = function( e )
{
    if( this.callbackObj != null ){ 
        elemId = e.target.id;
        p = elemId[2]; 
        if( elemId[1] == 'w' ){ 
            p = p.toUpperCase(); 
        }
        this.callbackObj.OnPromotionPieceSelected( p ); 
    }
}



PiecePromotion.prototype.Show = function( isWhiteTurn, callbackObj )
{
    var promo = 
    document.getElementById( (isWhiteTurn)? "white_promotion" : "black_promotion" );
    promo.className = ''; 
    this.callbackObj = callbackObj; 
}

PiecePromotion.prototype.Hide = function()
{
    document.getElementById( "white_promotion" ).className = 'hidden';
    document.getElementById( "black_promotion" ).className = 'hidden';
}
