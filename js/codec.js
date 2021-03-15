/**
    ----------------------------------------------------
    Uppercase letters are for white pieces.
    Lowercase letters are for black pieces. 
    r . rook / c . unmoved rook  
    n . knight  
    b . bishop 
    q . queen 
    k . king 

    p . pawn / e . en passant pawn 
*/

function BitStream( inputEncodedString ) 
{
    this.nBits = 0; 
    this.nextBit = 0;
    this.isInInputMode = true;
    this.encodedString = ""; 
    if( inputEncodedString != null ){
        this.encodedString = inputEncodedString; 
        this.isInputMode = false; 
    }
    this.b64dict = "Aa0BbC1cD2dE3eF4fGg5HhI6iJ7jKkLlM8mNnOo9PpQqRr-SsTtUuVv_WwXxYyZz";
    this.encodingIndex = 0; 
}

BitStream.prototype.SetBit = function( bit )
{
    var charIdx = Math.floor( this.nextBit / 6); 
    var bitOffset = this.nextBit % 6; 
    
    this.encodingIndex = this.encodingIndex + (bit << bitOffset); 
    if( bitOffset == 5 ){
        this.encodedString += this.b64dict[ this.encodingIndex ];
        this.encodingIndex = 0; 
    }
    this.nextBit++;
}

BitStream.prototype.GetBit = function()
{
    var charIdx = Math.floor( this.nextBit / 6); 
    var bitOffset = this.nextBit % 6; 
  
    if( charIdx >= this.encodedString.length ){ 
        throw "EOS"; 
    } 
    this.encodingIndex = this.b64dict.indexOf( this.encodedString[ charIdx ]); 
    var bit = (this.encodingIndex >> bitOffset ) & 1; 
    this.nextBit++; 
    return bit; 
}

BitStream.prototype.Set2Bits = function( number2bits ) 
{
    this.SetBit( (number2bits >> 1) & 1 );
    this.SetBit( number2bits & 1);
}

BitStream.prototype.Get2Bits = function( number2bits ) 
{
    return (this.GetBit() << 1) + this.GetBit(); 
}

BitStream.prototype.SetNibble = function( nibble ) 
{
    this.SetBit( (nibble >> 3) & 1 );
    this.SetBit( (nibble >> 2) & 1 ); 
    this.SetBit( (nibble >> 1) & 1 ); 
    this.SetBit( (nibble     ) & 1 ); 
}

BitStream.prototype.GetNibble = function()
{
    return ( (this.GetBit() << 3) + 
             (this.GetBit() << 2) +
             (this.GetBit() << 1) + 
              this.GetBit()  );  
}

BitStream.prototype.Finish = function() 
{
    if( this.isInInputMode ){ 
        var remains = this.nextBit % 6; 
        if( remains != 0 ){ 
            this.encodedString += this.b64dict[ this.encodingIndex ];
        } 
        this.isInInputMode = false; 
        return this.encodedString; 
    }else{
        this.nextBit = 0; 
    }
}

function ChessBoardCodec() 
{
    this.error = ""; 
    // the coded 0's table must be at least 7 to win one bit for each 'long code' 
    this.selectedpacked = 0;  
    this.packetsizes = [ 14, 16, 18 ]; 
}


ChessBoardCodec.prototype.ExtractEmptyLength = function( board, beginIdx )
{
    var max = board.length - beginIdx;
    var n = 0; 
    while( board[beginIdx + n] == '.' && n < max ){ 
        ++n; 
    }
    return n;  
}

ChessBoardCodec.prototype.CompressEmptyWithPacket = function( packetidx, n, bitstream )
{
    while( n >= 8 ){ 
        bitstream.SetBit( 1 );
        bitstream.SetBit( 1 ); 
        if( n >= this.packetsizes[ packetidx ] ){ 
            bitstream.SetNibble( 15 ); 
            n -= this.packetsizes[ packetidx ]; 
        }else{ 
            bitstream.SetNibble( 7 ); 
            n -= 8; 
        }
    }

    for( var i = 0; i < n; ++i ){
        bitstream.SetBit(0); 
    }
}

ChessBoardCodec.prototype.DecompressEmptyWithPacket = function( packetidx )
{
    var out = '........';
    var remainx = this.packetsizes[ packetidx ] - 8;  
    for( var i = 0; i < remainx; ++i ){
        out += '.'; 
    } 
    return out;  
}

ChessBoardCodec.prototype.CompressEmptyWithRLE = function( n, bitstream )
{ 
    while( n >= 8 ){ 
        bitstream.SetBit( 1 ); 
        bitstream.SetBit( 1 ); 
        if( n >= 11 ){ 
            var cod = n - 11;
            if( cod > 3 ){ 
                cod = 3; 
            } 
            bitstream.SetNibble( 15 );
            bitstream.SetBit( (cod >> 1) & 1 ); 
            bitstream.SetBit( cod & 1 ); 
            n -= ( 11 + cod );    
        }else{  
            bitstream.SetNibble( 7 );
            n -= 8;
        }
    }

    for( var i = 0; i < n; ++i ){
        bitstream.SetBit(0); 
    }
}

// the code for RLE has already been read 
ChessBoardCodec.prototype.DecompressEmptyWithRLE = function( bitstream ) 
{ 
    var out = '...........'; // 11 spaces minimum 
    var cod = (bitstream.GetBit() << 1) | (bitstream.GetBit() );
    while( cod > 0 ){ 
        --cod; 
        out += '.'; 
    }
    return out;
}

ChessBoardCodec.prototype.CompressPiece = function( piece, bitstream ) 
{
    var isWhite = true; 
    if( /[a-z]/.test( piece ) ){
        isWhite = false;
        piece = piece.toUpperCase(); 
    }   
    
    if( piece == 'P' ){ 
        bitstream.SetBit( 1 ); 
        bitstream.SetBit( 0 ); 
        bitstream.SetBit( (isWhite)? 1 : 0 );     
    }else{ 
        var pieceIds = 'RCNBQKE';     
        var id = pieceIds.indexOf( piece ); 
        if( id >= 0 ){ 
            if( isWhite ){ 
                id = id + 8; 
            } 
            bitstream.SetBit( 1 ); 
            bitstream.SetBit( 1 ); 
            bitstream.SetNibble( id ); 
        }
    } 
}

ChessBoardCodec.prototype.SelectBestCompress = function( strBoard, isWhiteTurn ) 
{
    var pidx = 0;
    var d0 = new BitStream(); 
    var d1 = new BitStream(); 
    var d2 = new BitStream(); 
    var rle = new BitStream(); 

    var streams = [d0, d1, d2, rle]; 
    
    while( pidx < strBoard.length ){
        if( strBoard[ pidx ] != '.' ){
            for( var i = 0; i < streams.length; ++i ){ 
                this.CompressPiece( strBoard[ pidx ], streams[ i ] );               
            }
            pidx++; 
        }else{ 
            var nEmpty = this.ExtractEmptyLength( strBoard, pidx ); 
            this.CompressEmptyWithPacket( 0, nEmpty,  d0 );
            this.CompressEmptyWithPacket( 1, nEmpty, d1 ); 
            this.CompressEmptyWithPacket( 2, nEmpty, d2 ); 
            this.CompressEmptyWithRLE( nEmpty, rle );
            pidx += nEmpty;  
        } 
    } 

    // @todo -> Select the best compression achieved and return it 

    for( var i = 0; i < streams.length; ++i ){ 
        streams[i].Finish(); 
    }
     
    var selectedCompression = 0; 
    var min = streams[0].encodedString.length; 
    for( var i = 1; i < streams.length; ++i ){ 
        if( streams[i].encodedString.length < min ){ 
            selectedCompression = i; 
        } 
    }

    var outStream = new BitStream(); 

    outStream.SetBit( 0 );                      // version 0 del compresor 
    outStream.SetBit( (isWhiteTurn)? 1 : 0 );   // el turno del que toca mover 
    outStream.Set2Bits( selectedCompression ); 

    var len = streams[ selectedCompression ].nextBit; 
    streams[ selectedCompression ].nextBit = 0; 
    for( var j = 0; j < len; ++j ){
        outStream.SetBit( streams[selectedCompression].GetBit() ); 
    }

    outStream.Finish();
    return outStream.encodedString; 
}

ChessBoardCodec.prototype.Encode = function( board )
{
    return this.SelectBestCompress( board.whiteBoard, board.isWhiteTurn ); 
}

ChessBoardCodec.prototype.Decode = function( encodedBoard, boardOutput ) 
{
    if( encodedBoard != null ){
        try{
        var bs = new BitStream( encodedBoard ); 
        var tmp = bs.GetBit(); 
        if( tmp != 0 ){ 
            boardOutput.Reset(); 
            return;
        }
       
        boardOutput.isWhiteTurn = (bs.GetBit() == 1)? true : false;
        boardOutput.whiteBoard = ""; 
        this.selectedpacket = bs.Get2Bits(); 

        while( boardOutput.whiteBoard.length < 64 ){ 
            if( bs.GetBit() == 0 ){ 
                boardOutput.whiteBoard += '.'; 
            }else{ 
                if( bs.GetBit() == 0 ){
                    if( bs.GetBit() == 1 ){ 
                        boardOutput.whiteBoard += 'P';
                    }else{ 
                        boardOutput.whiteBoard += 'p'; 
                    } 
                }else{ 
                    var code = bs.GetNibble(); 
                    if( code == 7 ){ 
                        boardOutput.whiteBoard += '........';
                    }else if( code == 15 ){ 
                        if( this.selectedpacket < 3 ){ 
                            boardOutput.whiteBoard += this.DecompressEmptyWithPacket( this.selectedpacket ); 
                        }else{
                            boardOutput.whiteBoard += this.DecompressEmptyWithRLE( bs ); 
                        }
                    }else{ 
                        var pieces = 'RCNBQKE';
                        var p = pieces[code%8]; 
                        if( code < 8 ){
                            p = p.toLowerCase(); 
                        }
                        boardOutput.whiteBoard += p; 
                    }
                }
            } 
        }
        }catch( e ){
            boardOutput.Reset();
        }
        /*
        boardOutput.finishedGame = false;
        boardOutput.isDrawGame = false;  
        boardOutput.whiteBoard = encodedBoard.substr( 0, 64 );
        if( encodedBoard.substr( 64, 1 ) == '0' ){ 
            boardOutput.isWhiteTurn = false; 
        } 
        */
    }else{ 
        boardOutput.Reset(); 
    }
}
