import { Matrix } from "../data/types";

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
  placedBlocksPoints: number;
  clearedLinesPoints: number;
  clearedBlocksPoints: number;
  comboBonus: number;
  totalPoints: number;
  comboLevel: number;
  clearedLines: number;
  cellsPlaced: number;
  cellsInLines: number;
  isBoardCleared: boolean;
}

export class ScoreCalculator {
  private consecutiveNoClears: number = 0;
  private currentCombo: number = 0;

  private logScoreCalculation(result: ScoreResult) {
    console.log('=== Подсчет очков ===');
    console.log(`Очищено линий: ${result.clearedLines}`);
    console.log(`Размещено клеток: ${result.cellsPlaced}`);
    console.log(`Клеток в линиях: ${result.cellsInLines}`);
    console.log(`Очки за размещение: ${result.placedBlocksPoints}`);
    console.log(`Очки за линии: ${result.clearedLinesPoints}`);
    console.log(`Очки за очистку блоков: ${result.clearedBlocksPoints}`);
    console.log(`Уровень комбо: ${result.comboLevel}`);
    console.log(`Бонус комбо: +${result.comboBonus}`);
    console.log(`Очистка поля: ${result.isBoardCleared ? 'Да (+300)' : 'Нет'}`);
    console.log(`Итого очков: ${result.totalPoints}`);
    console.log('===================');
  }

  private isBoardEmpty(board: Matrix): boolean {
    return board.every(row => row.every(cell => cell === 0));
  }

  public calculateScore(
    board: Matrix,
    clearedLines: number,
    cellsPlaced: number,
    cellsInLines: number
  ): ScoreResult {
    // Базовые очки за размещение блоков (1 очко за блок)
    const placedBlocksPoints = cellsPlaced;
    
    // Очки за очищенные линии (10 очков за линию)
    const clearedLinesPoints = clearedLines * 10;
    
    // Очки за очищенные блоки с учетом комбо
    const clearedBlocksPoints = cellsInLines;
    const comboBonus = COMBO_BONUS_TABLE[this.currentCombo] || 0;
    const clearedBlocksWithBonus = clearedBlocksPoints * comboBonus;
    
    // Проверка на очистку всего поля
    const isBoardCleared = this.isBoardEmpty(board);
    const boardClearBonus = isBoardCleared ? 300 : 0;
    
    // Общий подсчет очков
    const totalPoints = placedBlocksPoints + clearedLinesPoints + clearedBlocksWithBonus + boardClearBonus;
    
    // Обновление комбо
    if (clearedLines > 0) {
      this.currentCombo++;
      this.consecutiveNoClears = 0;
    } else {
      this.consecutiveNoClears++;
      if (this.consecutiveNoClears >= 3) {
        this.currentCombo = 0;
        this.consecutiveNoClears = 0;
      }
    }

    const result: ScoreResult = {
      placedBlocksPoints,
      clearedLinesPoints,
      clearedBlocksPoints,
      comboBonus,
      totalPoints,
      comboLevel: this.currentCombo,
      clearedLines,
      cellsPlaced,
      cellsInLines,
      isBoardCleared
    };

    this.logScoreCalculation(result);
    return result;
  }

  public resetCombo() {
    this.currentCombo = 0;
    this.consecutiveNoClears = 0;
  }
} 