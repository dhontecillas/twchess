function CanvasDrawer()
{
    this.canvas = canvas; 
    this.ctx = canvas.getContext('2d');
    this.pieceNames = [ 'P', 'p', 'R', 'r', 'N', 'n' , 'B', 'b', 'Q', 'q', 'K', 'k' ]; 
    this.pieceImages = {};
    this.pieceImgs = {}; 
    this.loadedPieces = 0; 
}
CanvasDrawer.prototype.LoadPieces = function() 
{
    var ImageLoader = function(){
        var numOfImages = 0;
        var numLoaded   = 0;
        var callBack    = function(){};

        function imageLoaded(){
            numLoaded++;
            if(numLoaded===numOfImages){
                // All images are loaded, now call the callback function
                callBack.call(this);
            }
        }

        function init(numberOfImages, fn){
            numOfImages = numberOfImages;
            callBack = fn;
        }

        return {
            imageLoaded: imageLoaded,
            init: init
        };
    }();

    ImageLoader.init( 12, this.onLoadResourcesReady);

    this.loadedPieces = 0; 
    for( var pp in this.pieceNames ){ 
        var imgfile = 'imgs/'; 
        var p = this.pieceNames[ pp ];
        if( /[a-z]/.test(p) ){ 
            imgfile += p + 'dt.png'; 
        }else{
            imgfile += p.toLowerCase() + 'lt.png';  
        }
        this.pieceImages[ p ] = imgfile;
        this.pieceImgs[ p ] = new Image();
        this.pieceImgs[ p ].src = this.pieceImages[ p ]; 
        this.pieceImgs[ p ].onload = ImageLoader.imageLoaded; // this.OnLoadedResource;  
    }
} 


BoardController.prototype.DrawChessBoard = function( )
{
    var ii; 
    for( ii = 0; ii < 8; ++ii ){
        for( jj = 0; jj < 8; ++jj ){
            if( (jj + ii ) % 2 ){
                this.ctx.fillStyle = this.blackSquareColor; 
            }else{
                this.ctx.fillStyle = this.whiteSquareColor;
            }
            this.ctx.fillRect( ii * 45, jj * 45, 45, 45 ); 
        }
    }
}

BoardController.prototype.DrawGame = function( strDefBoard )
{
    this.DrawChessBoard();
    var i;
    for( i=0; i < 64; ++i ){
        if( strDefBoard[ i ] != '.' ){
            x = i % 8;
            y = ( i - x ) / 8; 
            this.DrawPiece( strDefBoard[i], x, y ); 
        }
    }
}

BoardController.prototype.DrawPiece = function( piece, x, y )
{
    var specialcodes = { 'E' : 'P', 'e' : 'p', 
                         'C' : 'R', 'c' : 'r', 
                         'U' : 'K', 'u' : 'k' };

    if( this.blacksOnTop ){
        x = 7 - x; 
        y = 7 - y;
    }

    // draw the empty square 
    if( ( x + y ) % 2 ){
        this.ctx.fillStyle = this.blackSquareColor; 
    }else{
        this.ctx.fillStyle = this.whiteSquareColor; 
    }
    this.ctx.fillRect( x * 45, y * 45, 45, 45 ); 

    // and then the piece  
    if( piece in specialcodes )
        piece = specialcodes[ piece ]; 

    if( piece in this.pieceImgs ){ 
        this.ctx.drawImage( this.pieceImgs[ piece ], x * 45, y*45 ); 
    }
}

BoardController.prototype.DrawSquare = function( x, y, color ) 
{
    var ctLW = this.ctx.lineWidth; 

    this.ctx.lineWidth = 2; 
    this.ctx.strokeStyle = color; //lineStyle = color;
    this.ctx.beginPath();
    this.ctx.rect( x * 45 + 1, y * 45 + 1, 45 -2,45 -2 );
    this.ctx.closePath(); 
    this.ctx.stroke();

    this.ctx.lineWidth = ctLW; 
}

BoardController.prototype.EraseSquareIndicator = function( x, y )
{
    var color = this.whiteSquareColor;
    if( ( x + y ) % 2 )
    {
        color = this.blackSquareColor; 
    }
    this.DrawSquare( x, y ,color ); 
}

