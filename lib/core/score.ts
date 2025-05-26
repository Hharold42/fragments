import { Matrix } from "../data/types";

// Таблица базовых очков за количество очищенных линий
const LINE_CLEAR_POINTS: { [key: number]: number } = {
  1: 10,
  2: 20,
  3: 60,
  4: 120,
  5: 200
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

  private calculateFigureBonus(matrix: number[][]): number {
    const rows = matrix.length;
    const cols = matrix[0].length;
    
    // Определяем F в зависимости от размеров фигуры
    const F = (rows === 1 || cols === 1) ? 2 : 5;
    
    // Подсчитываем количество клеток в фигуре
    const cells = matrix.reduce((sum, row) => 
      sum + row.reduce((rowSum, cell) => rowSum + cell, 0), 0
    );
    
    return F * cells;
  }

  public calculateScore(
    board: Matrix,
    clearedLines: number,
    cellsPlaced: number,
    cellsInLines: number,
    placedPieceMatrix?: number[][]
  ): ScoreResult {
    // Базовые очки за размещение блоков (1 очко за блок)
    const placedBlocksPoints = cellsPlaced;
    
    // Базовые очки за очищенные линии
    const baseLinePoints = LINE_CLEAR_POINTS[clearedLines] || 0;
    
    // Обновление комбо
    if (clearedLines > 0) {
      if (this.currentCombo === 0) {
        // Первый успешный ход активирует комбо
        this.currentCombo = clearedLines;
      } else {
        // Последующие успешные ходы увеличивают комбо
        this.currentCombo += clearedLines;
      }
      this.consecutiveNoClears = 0;
    } else {
      this.consecutiveNoClears++;
      if (this.consecutiveNoClears >= 3) {
        this.currentCombo = 0;
        this.consecutiveNoClears = 0;
      }
    }

    // Бонус за фигуру (если вся фигура участвовала в очистке)
    let figureBonus = 0;
    if (placedPieceMatrix && cellsInLines === cellsPlaced) {
      figureBonus = this.calculateFigureBonus(placedPieceMatrix);
    }
    
    // Проверка на очистку всего поля
    const isBoardCleared = this.isBoardEmpty(board);
    const boardClearBonus = isBoardCleared ? 300 : 0;
    
    // Общий подсчет очков
    const totalPoints = placedBlocksPoints + 
                       (baseLinePoints * this.currentCombo) + 
                       baseLinePoints + 
                       figureBonus + 
                       boardClearBonus;
    
    const result: ScoreResult = {
      placedBlocksPoints,
      clearedLinesPoints: baseLinePoints,
      clearedBlocksPoints: cellsInLines,
      comboBonus: this.currentCombo,
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