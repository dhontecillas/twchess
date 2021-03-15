/**
    ----------------------------------------------------
    Uppercase letters are for white pieces.
    Lowercase letters are for black pieces. 
    r . rook  
    n . knight 
    b . bishop 
    q . queen 
    k . king 

    p . pawn 

    Special Marks for special movements: 

    - We will mark a pawn that has moved two steps 
    in their opening with an e ( from "en passant" ) 
    to check if the can be captured this way.
        e . en passant

    - We will need to know if the rooks and the king 
    weren't moved, to the special case of "castling" 
        c . unmoved rook ( C for 'castling ready' )
    Castling is considered a king's move, so it will
    be handled on the kings movement part
    Also, when the king is moved for the first time 
    the C's will be cleared. 

    - Promotion does not require any special data

    This is the structure for the board status storage
    data. 

    -----------------------------------------------------

    For the code part, we will simplify conditons and 
    code if we assume that we will move white pieces, 
    so, enemy pieces will always be the lowercase. If
    it is black turn, we well invert the pieces in the 
    var, for the handling, and after solving
    the move, we will invert the results again to 
    translate them to thw black pieces. 

    -----------------------------------------------------

    References about chess algorithms : 
    http://www.cs.cornell.edu/boom/2004sp/ProjectArch/Chess/algorithms.html
    http://www.fierz.ch/strategy1.htm

http://en.wikipedia.org/wiki/Portable_Game_Notation

http://en.wikipedia.org/wiki/Algebraic_chess_notation
*/

function setCharAt(str,index,chr) {
	if(index > str.length-1){
            return str;
	}
	return str.substr(0,index) + chr + str.substr(index+1);
}

function MoveResult( srcX, srcY, dstX, dstY ) 
{
    this.valid = false; 
    this.srcX = -1; 
    this.srcY = -1;
    this.srcPiece = '.';
    this.dstX = -1; 
    this.dstY = -1; 
    this.dstPiece = '.';
    
    this.capturesPiece = false; 
    this.capturedPiece = '.'; 
    this.captureX = -1;
    this.captureY = -1; 

    this.error = "Non initialized"; 

    this.isEndOfGame = false; 
    this.isCheckMate = false; 

    this.srcX = srcX; 
    this.srcY = srcY;
    this.dstX = dstX; 
    this.dstY = dstY;
    
    // we need to add special information for the castling 
    // move. 
    this.castlingSrcX = -1; 
    this.castlingDstX = -1; 

    if( this.srcX<0||this.srcY<0||this.dstX<0||this.dstY<0||
        this.srcX > 7 || this.srcY > 7 || this.dstX > 7 || this.dstY > 7 )
    {
        this.error = "Move coords out of range"; 
        return;
    }
    
    if( srcX == dstX  &&  srcY == dstY ){ 
        this.error = "Src is the same than dest"; 
        return;
    }

    this.error = ""; 
}

MoveResult.prototype.Reset = function()
{
    this.valid = false; 
    this.srcX = -1; 
    this.srcY = -1;
    this.srcPiece = '.';
    this.dstX = -1; 
    this.dstY = -1; 
    this.dstPiece = '.'; 
    
    this.capturesPiece = false; 
    this.captureX = -1;
    this.captureY = -1; 

    this.error = "";
}


MoveResult.prototype.Inverse = function()
{
    this.srcX = 7 - this.srcX; 
    this.srcY = 7 - this.srcY; 
    this.dstX = 7 - this.dstX; 
    this.dstY = 7 - this.dstY; 

    if( this.capturesPiece ){
        this.captureX = 7 - this.captureX; 
        this.captureY = 7 - this.captureY; 
    }
}

MoveResult.prototype.ConvertPiecesToWhite = function( )
{
    this.srcPiece = this.srcPiece.toUpperCase();
    this.dstPiece = this.dstPiece.toUpperCase();
    if( this.capturesPiece ){
        this.capturedPiece = this.capturedPiece.toUpperCase(); 
    }
}

MoveResult.prototype.ConvertPiecesToBlack = function()
{
    this.srcPiece = this.srcPiece.toLowerCase(); 
    this.dstPiece = this.dstPiece.toLowerCase(); 
    if( this.capturesPiece ){
        this.capturedPiece = this.capturedPiece.toLowerCase(); 
    }
}

function ChessBoard()
{
    this.dbgEnabled = true; 
    this.isWhiteTurn = true; 

    // This board is represented with the lines upside-down
    // and the first char would be a black square 
    this._ResetBoard ='';

    // To simplify the conditions, code, etc, we will always test the board
    // as if we were the white pieces. If are the black moving we
    // will store the board in reversed order, swapping black pieces
    // for white one 
    this.Reset();
}

ChessBoard.prototype.Reset = function()
{
    this._ResetBoard = 
    'CNBQKBNC' + 
    'PPPPPPPP' + 
    '........' + 
    '........' +
    '........' + 
    '........' + 
    'pppppppp' + 
    'cnbqkbnc'; 

    this.whiteBoard = this._ResetBoard; 
}

ChessBoard.prototype.CheckValidCoordComponent = function( coord ) 
{
    if( coord < 0 || coord > 7 ){
        return false; 
    }
    return true;
}

ChessBoard.prototype.InverseBoard = function( board )
{ 
    var invBoard = board; 
    
    for( y = 0; y < 8; ++y ){
        for( x = 0; x < 8; ++x ){
            ch = board.charAt( y * 8 + x ); 
            if( /[a-z]/.test( ch ) ){ 
                ch = ch.toUpperCase();  
            }else if( /[A-Z]/.test( ch ) ){
                ch = ch.toLowerCase(); 
            }
            invBoard = setCharAt( invBoard ,  ( 7 - y ) * 8 + ( 7 - x ) , ch ); 
        }
    }
    return invBoard; 
}

ChessBoard.prototype.BasicCapture = function( move )
{
    if( move.dstPiece != '.' ){
        move.capturesPiece = true; 
        move.capturedPiece = move.dstPiece; 
        move.captureX = move.dstX; 
        move.captureY = move.dstY; 
    }
}

ChessBoard.prototype.MovePawn = function( board, move, promotionPiece )
{
    var isFirstMove = ( move.srcY == 1 )? true : false; 

    var xDif = move.dstX - move.srcX;
    var yDif = move.dstY - move.srcY;
    
    move.valid = false; 
    
    if( move.dstPiece == '.' ){
        if( xDif == 0 ){
            if( yDif == 2 && isFirstMove ){
                // if we are not trying to ump over a piece
                if( board.charAt( ( move.srcY +1 ) * 8 + move.srcX ) == '.' ){
                    // the move piece its an 'en passant' target
                    move.srcPiece = 'E';  
                    move.valid = true;
                }
            }else if( yDif == 1 ){
                move.valid = true;      
            }
        }else if( Math.abs( xDif ) == 1 ){
            // test for an "en passant" capture 
            if( yDif == 1 && board.charAt( move.srcY * 8 + move.srcX + xDif ) == 'e' ){
                // Gotcha! an en passant capture !
                move.capturesPiece = true; 
                move.captureX = move.srcX + xDif;
                move.captureY = move.srcY; 
                move.valid = true; 
            }
        }
    }else{
        // captures a piece in the classical way  
        if( Math.abs( xDif ) == 1 && move.dstY == (move.srcY + 1) ){
            move.valid = true;
            this.BasicCapture( move ); 
        }
    }

    // to promote a pawn : http://twch.es/vpx9_xq5rrkWc5xPgggiLJkL7b  
    if( move.valid ){ 
        if( move.dstY == 7 || move.dstY == 0 ){
            if( promotionPiece == null ){
                // in case it is not specified, we use the queen
                promotionPiece = 'q';
            }
            var pp = promotionPiece.toLowerCase();
            if( pp == 'q' || pp == 'b' || pp == 'n'|| pp == 'r' ){
                move.promotionPiece = ( move.dstY == 0 )? pp : pp.toUpperCase();
                return true; 
            }else{
                move.error = "Invalid promotion piece"; 
                return false; 
            }
        }else{
            return true; 
        }
    }else{
        move.error = "Invalid pawn move";
        return false; 
    }
}


ChessBoard.prototype.MoveRook = function( board,  move )
{
    var xDif = move.dstX - move.srcX;
    var yDif = move.dstY - move.srcY;

    if( yDif == 0 ){
        move.valid = true; 
        step = xDif / Math.abs( xDif ); 
        for( x = move.srcX + step; x != move.dstX; x = x + step ){
            if( board.charAt( move.srcY * 8 + x ) != '.' ){
                move.error = "Found a piece in the path"; 
                move.valid = false; 
                break; 
            }
        }
    }else if( xDif == 0 ){ 
        step = yDif / Math.abs( yDif );
        move.valid = true; 
        for( y = move.srcY + step; y != move.dstY; y = y + step ){
            if( board.charAt(  y * 8 + move.srcX ) != '.' ){
                move.error = "Found a piece in the path"; 
                move.valid = false;
                break;
            }
        } 
    }else{
        move.valid = false;
        move.error = "Moving along different coordinates not allowed on rooks"; 
    }

    if( move.valid ){
        // its reused for the queen , so we must read the source piece
        if( move.srcPiece == 'C' ){ 
            move.srcPiece = 'R'; // in case it was unmoved . C
        }
        this.BasicCapture( move ); 
    }

    return move.valid; 
}

ChessBoard.prototype.MoveKnight = function( board, move )
{
    var xAbs = Math.abs( move.dstX - move.srcX ); 
    var yAbs = Math.abs( move.dstY - move.srcY );

    if( ( xAbs == 2 && yAbs == 1 ) ||
        ( xAbs == 1 && yAbs == 2 ) )
    {
        move.valid = true;
        this.BasicCapture( move ); 
        return true; 
    }

    return false; 
}

ChessBoard.prototype.MoveBishop = function( board, move )
{
    var xDif = move.dstX - move.srcX;
    var yDif = move.dstY - move.srcY;

    // if is not in diagonal move.. its not a bishop move! 
    if( Math.abs( xDif ) != Math.abs( yDif ) )
        return false; 

    var xStep = xDif / Math.abs( xDif ); 
    var yStep = yDif / Math.abs( yDif ); 
  
    var y = move.srcY + yStep; 
    for( var x = move.srcX + xStep; x != move.dstX; x = x + xStep ){
        if( board.charAt( y*8 + x ) != '.' ){
            move.error = "Found a piece in the path"; 
            move.valid = false; 
            // there is a piece in the path 
            return false; 
        }
        y = y + yStep;
    }

    move.valid = true; 
    this.BasicCapture( move ); 
    
    return true; 
}

ChessBoard.prototype.MoveQueen = function( board, move)
{
    if( this.MoveRook( board, move ) || 
        this.MoveBishop( board, move ) )
    {
        return true; 
    }
    return false; 
}


// returns the offset to the king
ChessBoard.prototype.FindMyKing = function( board )
{
    var c = board.indexOf( 'K' ); 
    if( !c ){
        c = board.indexOf( board, 'U' ); 
    }
    return c; 
}

/* 
    Checks if the white king is in check in the passed board 
*/ 
ChessBoard.prototype.IsKingInCheck = function( board )
{
    var pos = this.FindMyKing( board ); 

    // inverse the given board, and check for every oponent
    // if can kill the king 
    var ikx = pos % 8;             
    var iky = pos >> 3;       
    
    return (this.IsPositionUnderAttack( board, ikx, iky ) != null); 
}


ChessBoard.prototype.IsPositionUnderAttack = function( board, ix, iy )
{
    var invBoard = this.InverseBoard( board ); 

    for( i=0; i < 64; ++i ){
        if( /[A-Z]/.test( invBoard.charAt( i ) ) ){
            x = i % 8;
            y = ( i - x ) >> 3;
            m = this.CanMove( invBoard, x, y, 7-ix, 7-iy ); 
            if(m && m.valid){
                return m; 
            }
        }
    }
    return null; 
}

ChessBoard.prototype.MoveKing = function( board, move ) 
{
    var xDif = move.dstX - move.srcX;
    var yDif = move.dstY - move.srcY;
    var xAbs = Math.abs( xDif ); 
    var yAbs = Math.abs( yDif ); 

    if( yAbs > 1 || xAbs > 2 ){
        move.error = "Invalid move for king"; 
        move.valid = false;
        return false; 
    }

    // is trying to castle !?    CNBQK..CPPP..PPP...P........E...................ppppppppc..k..nc 
    if( xAbs == 2 ){
        // then, he can not move in the Y direction
        if( yAbs != 0  || move.srcY != 0 ){
            move.error = "Invalid move for the king"; 
            move.valid = false; 
            return false; 
        }
       
        
        // find if there is an unmmoved rook and if the path is clean 
        var s =  (xDif > 0)? 1 : -1;
        var kpos = move.srcY * 8 + move.srcX; 
        var rookOffset = 0; 
        for( var i = 1; i < 5; i = i+1 ){ 
            var p = kpos + i * s;  
            if( p < 0 || p > 63 ){ 
                break;     
            }
            
            if( i < 3 ){ 
                if( board[ p ] != '.' ){ 
                    break;
                }    
            }else{ 
                if( board[p] != '.' ){ 
                    if( board[p] == 'C' ){ 
                        var rookOffset = i * s; 
                    }
                    break; 
                }
            }
        }

        if( rookOffset == 0 ){ 
            move.error = "Not found unmoved rook for castling";
            move.valid = false; 
            return false; 
        }
        // the path is clear to an unmoved rook ,
        // now, we should make sure the king moves to a non-threatenet position
        // The source, the gap and the final position for the king can not be under attac 
        // of castling at http://en.wikipedia.org/wiki/Castling#Requirements
        if( this.IsPositionUnderAttack( board, move.srcX, move.srcY ) != null || 
            this.IsPositionUnderAttack( board, move.srcX + s, move.srcY ) != null ||  
            this.IsPositionUnderAttack( board, move.dstX, move.srcY ) != null ){
            move.error = "Invalid castling move, position under attack"; 
            move.valid = false; 
            return false; 
        }

        move.castlingSrcX = move.srcX + rookOffset; 
        move.castlingDstX = move.srcX + s; 
        
    }

    move.valid = true; 

    dp = board.charAt( move.dstY * 8 + move.dstX );
    if( dp != '.' ) {
        move.capturesPiece = true; 
        move.captureX = move.dstX;
        move.captureY = move.dstY; 
        move.capturedPiece = dp; 
    }
    return true; 
}

ChessBoard.prototype.SetBoardStatus = function( board )
{
    this.whiteBoard = board; 
} 

ChessBoard.prototype.SetTurn = function( isWhiteTurn ) 
{
    this.isWhiteTurn = isWhiteTurn;
}

// Tests if a move can be done, and what would be its consequences 
// on the current gamestate 
ChessBoard.prototype.CanMove = function( board, srcX, srcY, dstX, dstY, promotionPiece ) 
{ 
    var move = new MoveResult( srcX, srcY, dstX, dstY ); 
    var result = null; 

    if( move.error != "" )
    {
        return move; 
    }

    move.srcPiece = board.charAt( srcY * 8 + srcX ); 
    move.dstPiece = board.charAt( dstY * 8 + dstX ); 
    move.capturedPiece = board.charAt( dstY * 8 + dstX ); 

    if( move.srcPiece == '.' ){
        move.error = "Empty source piece"; 
        return move; 
    }

    // check if the piece we want to move is not of our color
    if( !/[A-Z]/.test( move.srcPiece ) ){
        move.error = "Is not this piece turn"; 
        return move; 
    }
    // if the destination piece of our color we can not move  
    if( /[A-Z]/.test( move.dstPiece )){
            move.error = "Can not capture a piece of the same color"; 
            return move;
    }

    if( promotionPiece != null && move.srcPiece != 'P' ){
        move.error = "Promotion piece not valid for non pawn piece"; 
        return move;
    }

    switch( move.srcPiece ) { 
    case 'P':
    case 'E': 
        result = this.MovePawn( board, move, promotionPiece ); 
        break; 
    case 'R':
    case 'C': 
        result = this.MoveRook( board, move); 
        break; 
    case 'N': 
        result = this.MoveKnight( board, move); 
        break; 
    case 'B': 
        result = this.MoveBishop( board, move); 
        break; 
    case 'Q': 
        result = this.MoveQueen( board, move); 
        break; 
    case 'K':
        result = this.MoveKing( board, move); 
        break; 
    default: 
        move.error = "Undefined piece";
        return move; 
    }

    // if the king is in check after a move is checked a part 
    return move; 
}

ChessBoard.prototype.MoveCausesKingInCheck = function( board, move ) 
{
    if( move.valid ){
        // find our king
        tmpboard = board; 
        tmpboard = this.ApplyMove( tmpboard, move ); 
        if( this.IsKingInCheck( tmpboard ) ){
            move.valid = false; 
            move.error = "Moving this piece causes the king to be in check"; 
            return true; 
        }
    }
    return false;
}

ChessBoard.prototype.ApplyMove = function( board, move )
{
    var rv = new String( board ); 
    
    if( move.capturesPiece ){ 
        rv = setCharAt( rv, move.captureY * 8 + move.captureX , '.' ); 
    }

    rv = setCharAt( rv, move.srcY * 8 + move.srcX , '.' ); 
    if( move.promotionPiece != null ){ 
        rv = setCharAt( rv, move.dstY * 8 + move.dstX , move.promotionPiece );
    }else{
        rv = setCharAt( rv, move.dstY * 8 + move.dstX , move.srcPiece );
    }

    if( move.srcPiece == 'K' ){
        rv = rv.replace( 'C', 'R' );      
        if( move.castlingDstX != -1 ){ 
            rv = setCharAt( rv, move.srcY * 8 + move.castlingSrcX, '.' );
            rv = setCharAt( rv, move.srcY * 8 + move.castlingDstX, 'R' ); 
        }
    }
    return rv;  
}


ChessBoard.prototype.UpdateIsEndOfGameVars = function( board, moveRes ) 
{
    var opponent =  this.InverseBoard( board ); 
    moveRes.isEndOfGame = !this.OpponentCanDoMove( opponent );  
    if( moveRes.isEndOfGame ){
                if( this.IsKingInCheck( opponent ) ){
                    // player wins the game
                    moveRes.isCheckMate = true; 
                }
                // else its a stalemate . draw game 
    }
    return this.isEndOfGame; 
}

ChessBoard.prototype.DoMove = function( srcX, srcY, dstX, dstY , promotionPiece ) 
{
    var myboard = null;
    if( this.isWhiteTurn ){
        myboard = this.whiteBoard; 
    }else{
        myboard = this.InverseBoard( this.whiteBoard );
        srcX = 7 - srcX; 
        srcY = 7 - srcY;
        dstX = 7 - dstX;
        dstY = 7 - dstY; 
    }

    var moveRes = this.CanMove( myboard, srcX, srcY, dstX, dstY, promotionPiece ); 
    if( moveRes && moveRes.valid ){
        this.MoveCausesKingInCheck( myboard , moveRes ); 
        if( moveRes.valid ){
            // applies the move to the 'white' view of the board
            myboard = this.ApplyMove( myboard, moveRes );
            // clear the en passant marks 
            myboard = myboard.replace( 'e', 'p' );

            this.UpdateIsEndOfGameVars( myboard, moveRes );            
            
            if( this.isWhiteTurn ){
                this.whiteBoard = myboard;
            }else{
                this.whiteBoard = this.InverseBoard( myboard ); 
            }
            
            this.isWhiteTurn = !this.isWhiteTurn;  
        }
    }

    if( !this.isWhiteTurn ){
        moveRes.Inverse(); 
        moveRes.ConvertPiecesToWhite(); 
    }

    return moveRes; 
}

// The potential moves for a piece. We don't need to test if 
// they are valid or inside range because it would be tested by the ChessBoard.prototype.
ChessBoard.prototype.GetPotentialMovesForPawn = function( board, x, y )
{
    var res = [ x,       y + 1,   // front movement
                  x + 1,   y + 1,   // kill movement 
                  x - 1,   y + 1,   // kill to the other side,
                  x,       y + 2 ]; // oppening move
    return res; 
}


ChessBoard.prototype.GetPotentialMovesForKnight = function( board, x, y )
{
    var res = [ x + 1, y + 2,
                  x + 1, y - 2,
                  x - 1, y + 2, 
                  x - 1, y - 2,
                  x + 2, y + 1,
                  x + 2, y - 1,
                  x - 2, y + 1, 
                  x - 2, y - 1 ];

    return res; 
}

ChessBoard.prototype.auxGetPotentialSteppedMoves = function( board, ox, oy , steps, res )
{
    for( var s = 0; s < steps.length; ++s  ){
        var xst = steps[s]; 
        var yst = steps[s]; 
        
        var x = ox + xst; 
        var y = oy + yst;
        pieceFound = false; 
        while( !pieceFound && 
               this.CheckValidCoordComponent( x ) &&
               this.CheckValidCoordComponent( y ) )
        {
            var p = board.charAt( y * 8 + x );
            if( p != '.' ){
                pieceFound = true; 
                if( /[a-z]/.test( p ) ){ 
					res.push( x );
					res.push( y ); 	
                }
            }else{
				res.push( x );
				res.push( y ); 
            }

            x += xst;
            y += yst;
        }
    }
}

ChessBoard.prototype.GetPotentialMovesForBishop = function( board, x, y )
{
    var res = [];
    var steps = [ 1,  1, 
              1, -1,
             -1,  1,
             -1, -1 ]; 
    this.auxGetPotentialSteppedMoves( board, x, y, steps, res ); 
    return res; 
}

ChessBoard.prototype.GetPotentialMovesForRook = function( board, x, y )
{
    var res = []; 
    var steps = [  1, 0, 
              -1, 0,
               0, 1,
               0,-1 ]; 
    this.auxGetPotentialSteppedMoves( board, x, y, steps, res ); 
    return res; 
}

ChessBoard.prototype.GetPotentialMovesForQueen = function( board, x, y )
{
    var bmove = this.GetPotentialMovesForBishop( board, x, y );
    var rmove = this.GetPotentialMovesForRook( board, x, y ); 
	for( var r = 0; r < rmove.length; ++r ){
		bmove.push( rmove[r] ); 
	}
    return bmove; 
}

ChessBoard.prototype.GetPotentialMovesForKing = function( board, x, y )
{
    var res =  [		x   , y +1, 
            		x   , y -1,
                  	x +1, y   ,
                  	x -1, y   ,
                  	x +1, y +1,
                  	x +1, y -1,
                  	x -1, y +1,
                  	x -1, y -1 ];
    return res; 
}

// Checks the valid movements for the opponent pieces to 
// check it it can cover a check, or if it can move a piece
// withos
ChessBoard.prototype.GetPotentialMoves = function( board, x, y )
{
    var p = board.charAt( y * 8 + x );  
    var result = null; 

    switch( p ) { 
    case 'P':
    case 'E': 
        result = this.GetPotentialMovesForPawn( board, x, y ); 
        break; 
    case 'R':
    case 'C': 
        result = this.GetPotentialMovesForRook( board, x, y); 
        break; 
    case 'N': 
        result = this.GetPotentialMovesForKnight( board, x, y); 
        break; 
    case 'B': 
        result = this.GetPotentialMovesForBishop( board, x, y); 
        break; 
    case 'Q': 
        result = this.GetPotentialMovesForQueen( board, x, y); 
        break; 
    case 'K':
        result = this.GetPotentialMovesForKing( board, x, y); 
        break; 
    default: 
        result = false;  
    }
    return result; 
}

// Checks if the opponent has any available movement that does 
// not ends in beeing in check
ChessBoard.prototype.OpponentCanDoMove = function( opponent)
{
    for( var i = 0; i < 64; ++i ){
        if( /[A-Z]/.test( opponent.charAt(i) ) ){
            var sx = i % 8; 
            var sy = Math.floor(i / 8 );
            potmoves = this.GetPotentialMoves( opponent, sx, sy ); 
            for( j = 0; j < potmoves.length; j = j+2 ){
                var dx = potmoves[ j ]; 
                var dy = potmoves[ j + 1 ]; 
                if( this.TestValidMove( opponent, sx, sy, dx, dy ) ){
                    return true; 
                }
            }
        }
    }
    return false;
}

ChessBoard.prototype.TestValidMove = function( board, sx, sy, dx, dy ) 
{
    var move = this.CanMove(board, sx, sy, dx, dy ); 
    if( move && move.valid ){
        this.MoveCausesKingInCheck( board , move ); 
    }
    return move.valid;
}

ChessBoard.prototype.TestMove = function( srcX, srcY, dstX, dstY )
{
    var sX = srcX;
    var sY = srcY; 
    var dX = dstX; 
    var dY = dstY;

    if( !this.isWhiteTurn ){
        return this.TestValidMove( this.InverseBoard( this.whiteBoard ), 7 - sX, 7 - sY, 7 - dX, 7 - dY ); 
    }else{ 
        return this.TestValidMove( this.whiteBoard, sX, sY, dX, dY ); 
    }
}


ChessBoard.prototype.TestIsInEndOfGameState = function()
{
    var moveRes = new MoveResult();
     
    if( this.isWhiteTurn ){
        this.UpdateIsEndOfGameVars( this.InverseBoard( this.whiteBoard ), moveRes );
    }else{ 
        this.UpdateIsEndOfGameVars( this.whiteBoard, moveRes );
    }
    return moveRes;  
} 

