class PlayerWinningStatus {
  winCount: number;
  highestWin: number;

  constructor({ winCount, highestWin }: PlayerWinningStatus) {
    this.winCount = winCount;
    this.highestWin = highestWin;
  }
}

export default PlayerWinningStatus;
