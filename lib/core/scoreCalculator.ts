import { Block, Matrix, Position } from "../data/types";

interface ScoreResult {
    clearedLines: number;
    cellsPlaced: number;
    placedBlocksPoints: number;
    clearedLinesPoints: number;
    clearedBlocksPoints: number;
    comboLevel: number;
    comboBonus: number;
    isBoardCleared: boolean;
    totalPoints: number;
}

export class ScoreCalculator {
    private readonly BASE_POINTS_PER_CELL = 10;
    private readonly BASE_POINTS_PER_LINE = 100;
    private readonly COMBO_MULTIPLIER = 1.5;
    private readonly BOARD_CLEAR_BONUS = 300;

    calculateScore(
        board: Matrix,
        placedBlock: Block,
        position: Position,
        previousCombo: number
    ): ScoreResult {
        const cellsPlaced = this.countPlacedCells(placedBlock);
        const clearedLines = this.countClearedLines(board);
        const isBoardCleared = this.isBoardCleared(board);

        // Базовые очки за размещение
        const placedBlocksPoints = cellsPlaced * this.BASE_POINTS_PER_CELL;

        // Очки за очистку линий
        const clearedLinesPoints = clearedLines * this.BASE_POINTS_PER_LINE;

        // Очки за очистку блоков
        const clearedBlocksPoints = this.calculateClearedBlocksPoints(board);

        // Расчет комбо
        const comboLevel = clearedLines > 0 ? previousCombo + 1 : 0;
        const comboBonus = comboLevel > 1 ? Math.pow(this.COMBO_MULTIPLIER, comboLevel - 1) : 1;

        // Общий подсчет очков
        let totalPoints = placedBlocksPoints + clearedLinesPoints + clearedBlocksPoints;
        totalPoints = Math.round(totalPoints * comboBonus);
        
        if (isBoardCleared) {
            totalPoints += this.BOARD_CLEAR_BONUS;
        }

        return {
            clearedLines,
            cellsPlaced,
            placedBlocksPoints,
            clearedLinesPoints,
            clearedBlocksPoints,
            comboLevel,
            comboBonus,
            isBoardCleared,
            totalPoints
        };
    }

    private countPlacedCells(block: Block): number {
        return block.matrix.reduce(
            (sum, row) => sum + row.reduce((rowSum, cell) => rowSum + cell, 0),
            0
        );
    }

    private countClearedLines(board: Matrix): number {
        let clearedLines = 0;

        // Проверяем строки
        for (let y = 0; y < board.length; y++) {
            if (board[y].every(cell => cell === 1)) {
                clearedLines++;
            }
        }

        // Проверяем столбцы
        for (let x = 0; x < board[0].length; x++) {
            if (board.every(row => row[x] === 1)) {
                clearedLines++;
            }
        }

        return clearedLines;
    }

    private calculateClearedBlocksPoints(board: Matrix): number {
        let points = 0;
        const visited = new Set<string>();

        // Проверяем каждый блок
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board[0].length; x++) {
                if (board[y][x] === 1 && !visited.has(`${x},${y}`)) {
                    const blockSize = this.getBlockSize(board, x, y, visited);
                    points += blockSize * this.BASE_POINTS_PER_CELL;
                }
            }
        }

        return points;
    }

    private getBlockSize(
        board: Matrix,
        startX: number,
        startY: number,
        visited: Set<string>
    ): number {
        const queue: [number, number][] = [[startX, startY]];
        let size = 0;

        while (queue.length > 0) {
            const [x, y] = queue.shift()!;
            const key = `${x},${y}`;

            if (visited.has(key)) continue;
            visited.add(key);
            size++;

            // Проверяем соседние клетки
            const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
            for (const [dx, dy] of directions) {
                const newX = x + dx;
                const newY = y + dy;

                if (
                    newX >= 0 && newX < board[0].length &&
                    newY >= 0 && newY < board.length &&
                    board[newY][newX] === 1 &&
                    !visited.has(`${newX},${newY}`)
                ) {
                    queue.push([newX, newY]);
                }
            }
        }

        return size;
    }

    private isBoardCleared(board: Matrix): boolean {
        return board.every(row => row.every(cell => cell === 1));
    }
} 