# TWChess

[Under MIT License](LICENSE)

(Diclaimer: this code was made around 2012, as a project to
play with javascript)

TWChess tries to encode the status of a chess board in a few
characters, so it can fit in a tweet.

The user can make a move, and the encoded chessboard link
appeared after the movement was made, and it could be
tweeted directly, to respond to the game. This way, a
full chess game could be played through links.

## The code

Inside the [`./js`](./js) folder there are several files:

- `codec.js`: that encodes and decodes a chess board
- `board.js`: that checks moves are valid
- `canvasdraw.js`: to draw the actual board in a canvas element
- `cssdraw.js`: an alternative to draw the board using css (wip?)
- `boardcontroller.js`: that takes care of the actual user input
- `piecepromo.js`: to display / select the piece we want once
    a pawn reaches the last row
- `share.js`: to share the move in twitter
