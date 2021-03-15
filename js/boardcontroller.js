function BoardController( callbackObject, 
                          encodedBoard, 
                          boardDrawer,
                          sharebox, 
                          statusbox,
                          promotionbox)
{
    this.boardDrawer = boardDrawer;
    if( this.boardDrawer != null ){ 
        boardDrawer.callbackObject = this; 
    } 
    this.shareBox = sharebox; 
    this.statusBox = statusbox; 
    this.promotionBox = promotionbox; 

    this.board = new ChessBoard(); 
    this.encodedBoard = encodedBoard;
    this.codec = new ChessBoardCodec(); 
    // to keep track in which cell do we have the cursor
    this.cursorOverX = -1; 
    this.cursorOverY = -1; 


    // color definitions 
    this.whiteSquareColor = "#FFDEAD"; 
    this.blackSquareColor = "#CDB79E";
    this.validSelectionColor = "green";
    this.selectedSquareColor = "blue";
    this.invalidMovementSquareColor = "red"; 
   
    this.selectedPieceX = -1; 
    this.selectedPieceY = -1;
    this.blacksOnTop = true; 
    
    this.callbackObject = callbackObject; 
    this.LoadGame();
}
    
BoardController.prototype.DecodeBoard = function( encodedBoard, 
                                                  boardOutput ) 
{
	this.codec.Decode( encodedBoard, boardOutput ); 	
}

BoardController.prototype.EncodeBoard = function( boardInput ) 
{
	return this.codec.Encode( boardInput ); 
} 

BoardController.prototype.LoadGame = function() 
{
    this.boardDrawer.CreateBoard(); 
	this.moveDone = false; 

    this.DecodeBoard( this.encodedBoard, this.board ); 
    if( this.board.whiteBoard.length < 64 ){ 
		//alert( "Failed loading board from url" );
        this.board.Reset(); 
    }

    var moveRes = this.board.TestIsInEndOfGameState();
	
    if( moveRes.isEndOfGame ){
		if( !moveRes.isCheckMate ){
			this.statusBox.WriteText( "DRAW GAME!", "gamefinished" ); 
		}else{
			if( this.board.isWhiteTurn ){ 
				this.statusBox.WriteText( "BLACK WINS" , "gamefinished" ); 
			}else{ 
                this.statusBox.WriteText( "WHITE WINS", "gamefinished" );  
			}
		}
    }else{
        if( this.board.isWhiteTurn ){ 
            this.statusBox.WriteText( "WHITE MOVES" , "normal" ); 
        }else{ 
            this.statusBox.WriteText( "BLACK MOVES", "normal" );  
        }
    }

    if( this.board.isWhiteTurn ){
        this.blacksOnTop = true;
	}else{ 
		this.blacksOnTop = false; 
	} 
    this.DrawGame( this.board.whiteBoard ); 
    if( this.callbackObject != null ){ 
	    this.callbackObject.onLoadFinished();
    }
}


BoardController.prototype.DrawGame = function( strDefBoard )
{
    this.boardDrawer.ClearBoard();
    var i;
    for( i=0; i < 64; ++i ){
        if( strDefBoard[ i ] != '.' ){
            x = i % 8;
            y = ( i - x ) / 8; 
            if( this.blacksOnTop ){ 
                x = 7-x;
                y = 7-y;
            }
            this.boardDrawer.DrawPiece( strDefBoard[i], x, y ); 
        }
    }
}

BoardController.prototype.IsPieceSelected = function()
{
    if( this.selectedPieceX < 0 || 
        this.selectedPieceY < 0 ){
        return false;
    }
    return true; 
}


BoardController.prototype.UpdateTargetSquare = function( x, y, color ) 
{
    if( color == null ){
        color = this.invalidMovementSquareColor;    
    }

    if( this.overCellX >= 0 && this.overCellY >= 0 ){ 
        if( this.selectedPieceX == this.overCellX && 
            this.selectedPieceY == this.overCellY ){
        // it the previous square is the selected one, we leave
        // the selected color in the cell   
           
            this.boardDrawer.DrawMarker( this.selectedPieceX, 
                                         this.selectedPieceY, 
                                         this.selectedSquareColor ); 
        }else{ 
            this.boardDrawer.ClearMarker( this.overCellX, 
                                          this.overCellY );
        }
    }
    
    this.overCellX = x; 
    this.overCellY = y; 
    if( x >= 0 && y >= 0 ){
        this.boardDrawer.DrawMarker( x, y, color ); 
    }
}

BoardController.prototype.DoMove = function( sX, sY, dX, dY, promotePiece )
{
    var reachedLastRow = false;
    if( ( this.board.isWhiteTurn && dY == 7 ) ||
        (!this.board.isWhiteTurn && dY == 0 ) ){ 
        reachedLastRow = true; 
    }

    var piece = this.board.whiteBoard[ sX + sY * 8 ];     
    
    if( reachedLastRow && piece == 'P' && promotePiece == null ){
        promotePiece = 'Q'; 
    }
    if( reachedLastRow && piece == 'p' && promotePiece == null ){
        promotePiece = 'q';
    }

    this.board.DoMove( sX, sY, dX, dY, promotePiece );
    this.DrawGame( this.board.whiteBoard );
    this.boardDrawer.ClearMarker( this.selectedPieceX, this.selectedPieceY ); 
  
    var moveRes = this.board.TestIsInEndOfGameState();
    if( !moveRes.isEndOfGame ){ 
        this.statusBox.Hide();
    }else{ 
        if( moveRes.isCheckMate ){
            if( this.board.isWhiteTurn ){
                this.statusBox.WriteText( "BLACK WINS!", "gamefinished" ); 
            }else{ 
                this.statusBox.WriteText( "WHITE WINS!", "gamefinished" ); 
            }
        }else{
            this.statusBox.WriteText( "DRAW GAME!" , "gamefinished" ); 
        }
    }
    this.shareBox.Show( this.EncodeBoard( this.board ) ); 

	this.moveDone = true; 
    if( this.callbackObject ){ 
        this.callbackObject.OnMoveDone( this.EncodeBoard( this.board ) ); 
    }
}

BoardController.prototype.IsValidClickSquare = function( x , y )
{
	var logic_sx = x; 
	var logic_sy = y; 
    if( this.blacksOnTop ){ 
        var logic_sx = 7 - x;
        var logic_sy = 7 - y; 
    } 

	var piece = this.board.whiteBoard.charAt( logic_sx + logic_sy * 8 ); 
	if( this.selectedPieceX == -1 ){
	    if( ( this.board.isWhiteTurn && /[A-Z]/.test( piece ) ) ||
		(!this.board.isWhiteTurn && /[a-z]/.test( piece ) ) ){
		    return true;
	    }else{
		    return false; 
	    }          
	}else{
	    // to enable the unselection of a piece : 
	    if( x == this.selectedPieceX && y == this.selectedPieceY ){
		return true; 
	    }

	    if( this.blacksOnTop ){ 
		    var canMove = this.board.TestMove(  7 - this.selectedPieceX, 
                                                7 - this.selectedPieceY, 
                                                7-x, 
                                                7-y );
	    }else{ 
		    var canMove = this.board.TestMove(  this.selectedPieceX, 
                                                this.selectedPieceY, 
                                                x, 
                                                y );
	    }
	    return canMove; 	    
	} 
}

BoardController.prototype.OnChessBoardCellOver = function( x, y )
{
    if( this.moveDone ){ 
        return; 
    }

    var color = this.invalidMovementSquareColor;
    if( (x != this.overCellX || y != this.overCellY)  ){
        if( this.IsValidClickSquare( x, y ) ){
            color = this.validSelectionColor;
        } 
        this.UpdateTargetSquare( x, y, color ); 
    } 
}

BoardController.prototype.OnChessBoardOut = function()
{
    this.UpdateTargetSquare( -1, -1 );
}

BoardController.prototype.OnChessBoardCellClick = function( x, y )
{
    if( x >= 0 && y >= 0 && this.IsValidClickSquare( x, y ) ){
        if( this.selectedPieceX== -1 ){
            this.selectedPieceX = x; 
            this.selectedPieceY = y; 
            this.boardDrawer.DrawMarker( x, y , this.selectedSquareColor ); 
        }else{
            if( this.selectedPieceX == x && this.selectedPieceY == y ){ 
		        this.boardDrawer.ClearMarker( x, y );
		        this.selectedPieceX = -1; 
		        this.selectedPieceY = -1; 
                this.promotionBox.Hide(); 
	        }else{
                if( this.blacksOnTop ){ 
                    var p = this.board.whiteBoard[  7 - this.selectedPieceX + 
                                                   ( 7 - this.selectedPieceY) * 8 ];
                }else{     
                    var p = this.board.whiteBoard[ this.selectedPieceX + 
                                                   this.selectedPieceY * 8 ];
                }
                p = p.toLowerCase(); 
                
                if( y == 0 && this.board.isWhiteTurn == this.blacksOnTop && p == 'p' ){
                    this.promotionBox.Show( this.board.isWhiteTurn, this );
                    this.promotingX = x; 
                }else{

                    if( this.blacksOnTop ){
                        this.DoMove( 7 - this.selectedPieceX, 
                                     7 - this.selectedPieceY, 
                                     7 - x, 
                                     7 - y );  
                    }else{ 
                        this.DoMove( this.selectedPieceX, 
                                     this.selectedPieceY, 
                                     x, 
                                     y );
                    }

                }
	        }
        }
    }
}

BoardController.prototype.OnPromotionPieceSelected = function ( piece )
{
    if( this.blacksOnTop ){
        this.DoMove( 7 - this.selectedPieceX, 
                     7 - this.selectedPieceY, 
                     7 - this.promotingX, 
                     7, 
                     piece);  
    }else{ 
        this.DoMove( this.selectedPieceX, 
                     this.selectedPieceY, 
                     this.promotingX, 
                     0, 
                     piece);
    }
    this.promotionBox.Hide();
}
