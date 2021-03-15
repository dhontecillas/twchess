
var sharebox = new ShareBox( 'sharebox' );
var statusbox = new StatusBox( 'statusbox' ); 
var promotionbox = new PiecePromotion( 'promotionpiecebox' ); 

var drawer = new CssChessBoard(document.getElementById( 'cssboard' )); 
var boardController = new BoardController( null, 
                                           sharebox.encodedGame, 
                                           drawer,
                                           sharebox, 
                                           statusbox,
                                           promotionbox ); 

