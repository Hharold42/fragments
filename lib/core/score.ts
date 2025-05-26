import { Block, Matrix } from "../data/types";

// Combo bonus table (1-100)
const COMBO_BONUS_TABLE: { [key: number]: number } = {
  1: 1.0, 2: 2.25, 3: 3.625, 4: 4.875, 5: 6.25,
  6: 7.5, 7: 8.875, 8: 10.125, 9: 11.375, 10: 12.75,
  11: 14.0, 12: 15.375, 13: 16.625, 14: 18.0, 15: 19.25,
  16: 20.5, 17: 21.875, 18: 23.125, 19: 24.5, 20: 25.75,
  21: 27.125, 22: 28.375, 23: 29.625, 24: 31.0, 25: 32.25,
  26: 33.625, 27: 34.875, 28: 36.25, 29: 37.5, 30: 38.75,
  31: 40.125, 32: 41.375, 33: 42.75, 34: 44.0, 35: 45.375,
  36: 46.625, 37: 47.875, 38: 49.25, 39: 50.5, 40: 51.875,
  41: 53.125, 42: 54.5, 43: 55.75, 44: 57.0, 45: 58.375,
  46: 59.625, 47: 61.0, 48: 62.25, 49: 63.625, 50: 64.875,
  51: 66.125, 52: 67.5, 53: 68.75, 54: 70.125, 55: 71.375,
  56: 72.75, 57: 74.0, 58: 75.25, 59: 76.625, 60: 77.875,
  61: 79.25, 62: 80.5, 63: 81.875, 64: 83.125, 65: 84.375,
  66: 85.75, 67: 87.0, 68: 88.375, 69: 89.625, 70: 91.0,
  71: 92.25, 72: 93.5, 73: 94.875, 74: 96.125, 75: 97.5,
  76: 98.75, 77: 100.125, 78: 101.375, 79: 102.625, 80: 104.0,
  81: 105.25, 82: 106.625, 83: 107.875, 84: 109.25, 85: 110.5,
  86: 111.75, 87: 113.125, 88: 114.375, 89: 115.75, 90: 117.0,
  91: 118.375, 92: 119.625, 93: 120.875, 94: 122.25, 95: 123.5,
  96: 124.875, 97: 126.125, 98: 127.5, 99: 128.75, 100: 130.0
};

interface ScoreResult {
  totalPoints: number;
  clearedLines: number;
  cellsPlaced: number;
  placedBlocksPoints: number;
  clearedLinesPoints: number;
  clearedBlocksPoints: number;
  comboLevel: number;
  comboBonus: number;
  isBoardCleared: boolean;
}

export class ScoreCalculator {
  private comboCounter: number = 0;
  private lastSuccessfulMove: number = 0;
  private moveCounter: number = 0;
  private isComboOpened: boolean = false;

  private readonly LINE_POINTS = {
    1: 10,
    2: 20,
    3: 60,
    4: 120,
    5: 200
  };

  private readonly BOARD_CLEAR_BONUS = 300;

  resetCombo() {
    this.comboCounter = 0;
    this.lastSuccessfulMove = 0;
    this.moveCounter = 0;
    this.isComboOpened = false;
  }

  private calculateComboBonus(clearedLines: number): number {
    this.moveCounter++;
    
    if (clearedLines > 0) {
      if (!this.isComboOpened) {
        // Открываем комбо, но не увеличиваем счетчик
        this.isComboOpened = true;
        this.lastSuccessfulMove = this.moveCounter;
        return 1;
      } else {
        // Последующие успешные ходы увеличивают комбо
        this.comboCounter += clearedLines;
        this.lastSuccessfulMove = this.moveCounter;
        return this.comboCounter;
      }
    } else if (this.moveCounter - this.lastSuccessfulMove >= 3) {
      // Сбрасываем комбо если прошло 3 хода без успешных
      this.comboCounter = 0;
      this.isComboOpened = false;
      return 1;
    }

    return this.isComboOpened ? this.comboCounter : 1;
  }

  private isFullFigureCleared(block: Block, cellsInLines: number): boolean {
    const totalCells = block.matrix.reduce(
      (sum, row) => sum + row.reduce((rowSum, cell) => rowSum + cell, 0),
      0
    );
    return cellsInLines === totalCells;
  }

  private getFigureMultiplier(block: Block, cellsInLines: number): number {
    if (!this.isFullFigureCleared(block, cellsInLines)) {
      return 1;
    }

    const [rows, cols] = [block.matrix.length, block.matrix[0].length];
    return (rows === 1 || cols === 1) ? 2 : 5;
  }

  private isBoardCleared(board: Matrix): boolean {
    return board.every(row => row.every(cell => cell === 0));
  }

  calculateScore(
    board: Matrix,
    clearedLines: number,
    cellsPlaced: number,
    cellsInLines: number,
    block: Block
  ): ScoreResult {
    // Базовые очки за размещенные клетки
    const placedBlocksPoints = cellsPlaced;

    // Очки за очищенные линии
    const clearedLinesPoints = this.LINE_POINTS[clearedLines as keyof typeof this.LINE_POINTS] || 0;

    // Рассчитываем комбо
    const comboBonus = this.calculateComboBonus(clearedLines);

    // Множитель за полную очистку фигуры
    const figureMultiplier = this.getFigureMultiplier(block, cellsInLines);

    // Очки за очищенные блоки
    const clearedBlocksPoints = cellsInLines * figureMultiplier;

    // Проверяем полную очистку поля
    const isBoardCleared = this.isBoardCleared(board);
    const boardClearBonus = isBoardCleared ? this.BOARD_CLEAR_BONUS : 0;

    // Итоговый подсчет
    const totalPoints = 
      placedBlocksPoints + 
      (clearedLinesPoints * comboBonus) + 
      clearedBlocksPoints + 
      boardClearBonus;

    return {
      totalPoints,
      clearedLines,
      cellsPlaced,
      placedBlocksPoints,
      clearedLinesPoints,
      clearedBlocksPoints,
      comboLevel: this.comboCounter,
      comboBonus,
      isBoardCleared
    };
  }
} 