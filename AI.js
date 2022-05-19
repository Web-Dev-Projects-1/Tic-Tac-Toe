class AI {
  constructor(side, difficulty) {
    this.side = side === "x" ? 1 : -1;
    this.winChecker = /012|345|678|.*0.*3.*6|.*1.*4.*7|.*2.*5.*8|.*0.*4.*8|.*2.*4.*6/;
    this.movesDepth = difficulty === "easy" ? 0 : difficulty === "normal" ? 1 : 8;
  }

  findBestMove([xIndices, oIndices]) {
    let board = Array(9).fill(0);
    let emptyIndices = [];
    xIndices.forEach((e) => {
      board[e] = 1;
    });
    oIndices.forEach((e) => {
      board[e] = -1;
    });
    board.forEach((e, i) => {
      if (e == 0) {
        emptyIndices.push(i);
      }
    });
    // if win is one move away, choose that move
    for (let i = 0; i < emptyIndices.length; i++) {
      let aiIndices = this.side === 1 ? xIndices : oIndices;
      if (this.winChecker.test(aiIndices.concat(emptyIndices[i]).sort().join(""))) {
        return emptyIndices[i];
      }
    }
    // finding the set of best moves
    const moves = this.generateMoves(board, true, true);
    const moveEvals = moves.map((e) => this.minimax(e, this.movesDepth, -1000, 1000, false));
    const max = Math.max(...moveEvals);
    const bestMoves = moveEvals.map((e, i) => (e === max ? i : "")).filter(String);
    // if opponent can win in more than one way, prevent one of the possible wins
    if (moveEvals.filter((e) => e != -100).length == 0) {
      for (let i = 0; i < emptyIndices.length; i++) {
        const opponentIndices = this.side === 1 ? oIndices : xIndices;
        if (this.winChecker.test(opponentIndices.concat(emptyIndices[i]).sort().join(""))) {
          return emptyIndices[i];
        }
      }
    }
    return emptyIndices[bestMoves[Math.floor(Math.random() * bestMoves.length)]];
  }

  evalBoard(arr) {
    let xIndices = [],
      oIndices = [];
    for (let i = 0; i < 9; i++) {
      if (arr[i] == 1) {
        xIndices.push(i);
      } else if (arr[i] == -1) {
        oIndices.push(i);
      }
    }
    // -1 indicates that the game is still ongoing
    if (this.winChecker.test(xIndices.join(""))) {
      return this.side === 1 ? 100 : -100;
    } else if (this.winChecker.test(oIndices.join(""))) {
      return this.side === -1 ? 100 : -100;
    } else if (xIndices.length + oIndices.length == 9) {
      return 0;
    } else return -1;
  }

  generateMoves(arr, aiTurn, firstMove) {
    let allPossibleMoves = [];
    let emptyIndices = [],
      markedIndices = [];
    const num = aiTurn ? this.side : -this.side;

    for (let i = 0; i < arr.length; i++) {
      if (arr[i] == 0) {
        emptyIndices.push(i);
      } else if (arr[i] == num) {
        markedIndices.push(i);
      }
    }

    for (let i = 0; i < emptyIndices.length; i++) {
      let possibleMove = arr.slice();
      possibleMove[emptyIndices[i]] = num;
      // ordering moves by best first
      if (
        !firstMove &&
        this.winChecker.test(markedIndices.concat(emptyIndices[i]).sort().join(""))
      ) {
        allPossibleMoves.unshift(possibleMove);
      } else {
        allPossibleMoves.push(possibleMove);
      }
    }
    return allPossibleMoves;
  }

  minimax(arr, depth, alpha, beta, maximizingPlayer) {
    if (depth <= 0 || this.evalBoard(arr) != -1) {
      return this.evalBoard(arr);
    }
    if (maximizingPlayer) {
      let maxEvaluation = -1000;
      const moves = this.generateMoves(arr, true, false);
      for (let i = 0; i < moves.length; i++) {
        const evaluation = this.minimax(moves[i], depth - 1, alpha, beta, false);
        maxEvaluation = Math.max(maxEvaluation, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) {
          break;
        }
      }
      return maxEvaluation;
    } else {
      let minEvaluation = 1000;
      const moves = this.generateMoves(arr, false, false);
      for (let i = 0; i < moves.length; i++) {
        const evaluation = this.minimax(moves[i], depth - 1, alpha, beta, true);
        minEvaluation = Math.min(minEvaluation, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) {
          break;
        }
      }
      return minEvaluation;
    }
  }
}
