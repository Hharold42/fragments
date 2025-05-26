import { Block, Matrix, Position } from "../data/types";
import { findAllValidPositions } from "./positions";
import { getCellsToClear } from "./engine";

interface BlockSet {
    blocks: Block[];
    scorePotential: number;
    comboPotential: number;
    totalSize: number;
}

export class BlockSetFinder {
    private readonly allBlocks: Block[];
    private readonly minScorePotential: number = 30;
    private readonly minComboPotential: number = 1;
    private readonly maxCombinations: number = 100; // Ограничиваем количество проверяемых комбинаций

    constructor(allBlocks: Block[]) {
        this.allBlocks = allBlocks;
    }

    findSuitableBlockSets(board: Matrix): BlockSet[] {
        const suitableSets: BlockSet[] = [];
        const blockCount = this.allBlocks.length;
        let combinationsChecked = 0;

        // Сначала проверяем блоки с наибольшим потенциалом очков
        const sortedBlocks = [...this.allBlocks].sort((a, b) => {
            const sizeA = this.calculateBlockSize(a);
            const sizeB = this.calculateBlockSize(b);
            return sizeB - sizeA;
        });

        // Перебираем комбинации, начиная с самых больших блоков
        for (let i = 0; i < blockCount && combinationsChecked < this.maxCombinations; i++) {
            for (let j = 0; j < blockCount && combinationsChecked < this.maxCombinations; j++) {
                if (j === i) continue;
                for (let k = 0; k < blockCount && combinationsChecked < this.maxCombinations; k++) {
                    if (k === i || k === j) continue;
                    combinationsChecked++;

                    const blockSet = [sortedBlocks[i], sortedBlocks[j], sortedBlocks[k]];
                    const evaluation = this.evaluateBlockSet(blockSet, board);

                    if (evaluation) {
                        suitableSets.push(evaluation);
                        // Если нашли достаточно хороший набор, прекращаем поиск
                        if (evaluation.scorePotential >= 200 && evaluation.comboPotential >= 2) {
                            return [evaluation];
                        }
                    }
                }
            }
        }

        // Сортируем наборы по приоритету
        return suitableSets.sort((a, b) => {
            if (a.scorePotential !== b.scorePotential) {
                return b.scorePotential - a.scorePotential;
            }
            if (a.comboPotential !== b.comboPotential) {
                return b.comboPotential - a.comboPotential;
            }
            return b.totalSize - a.totalSize;
        });
    }

    private evaluateBlockSet(blocks: Block[], board: Matrix): BlockSet | null {
        let currentBoard = board.map(row => [...row]);
        let totalScorePotential = 0;
        let totalComboPotential = 0;
        let totalSize = 0;
        let isValidSequence = true;

        for (const block of blocks) {
            // Находим все возможные позиции для текущего блока
            const validPositions = findAllValidPositions(currentBoard, block);
            
            if (validPositions.length === 0) {
                isValidSequence = false;
                break;
            }

            // Оцениваем каждую позицию
            let bestScorePotential = 0;
            let bestComboPotential = 0;
            let bestPosition: Position | null = null;

            for (const position of validPositions) {
                const cellsToClear = getCellsToClear(currentBoard, block, position);
                const scorePotential = this.calculateScorePotential(cellsToClear);
                const comboPotential = this.calculateComboPotential(cellsToClear);

                if (scorePotential > bestScorePotential || 
                    (scorePotential === bestScorePotential && comboPotential > bestComboPotential)) {
                    bestScorePotential = scorePotential;
                    bestComboPotential = comboPotential;
                    bestPosition = position;
                }
            }

            if (!bestPosition) {
                isValidSequence = false;
                break;
            }

            // Проверяем, что после размещения блока остается достаточно места для следующих блоков
            const remainingSpace = this.calculateRemainingSpace(currentBoard, bestPosition, block);
            if (remainingSpace < 4) { // Минимальное пространство для следующего блока
                isValidSequence = false;
                break;
            }

            // Обновляем доску и накапливаем потенциал
            totalScorePotential += bestScorePotential;
            totalComboPotential += bestComboPotential;
            totalSize += this.calculateBlockSize(block);

            // Обновляем доску для следующего блока
            for (let y = 0; y < block.matrix.length; y++) {
                for (let x = 0; x < block.matrix[0].length; x++) {
                    if (block.matrix[y][x] === 1) {
                        currentBoard[bestPosition.y + y][bestPosition.x + x] = 1;
                    }
                }
            }
        }

        if (!isValidSequence) {
            return null;
        }

        return {
            blocks,
            scorePotential: totalScorePotential,
            comboPotential: totalComboPotential,
            totalSize
        };
    }

    private calculateRemainingSpace(board: Matrix, position: Position, block: Block): number {
        let space = 0;
        const rows = board.length;
        const cols = board[0].length;

        // Проверяем пространство вокруг размещенного блока
        for (let y = Math.max(0, position.y - 1); y < Math.min(rows, position.y + block.matrix.length + 1); y++) {
            for (let x = Math.max(0, position.x - 1); x < Math.min(cols, position.x + block.matrix[0].length + 1); x++) {
                if (board[y][x] === 0) {
                    space++;
                }
            }
        }

        return space;
    }

    private calculateScorePotential(cellsToClear: boolean[][]): number {
        let score = 0;
        const rows = cellsToClear.length;
        const cols = cellsToClear[0].length;

        // Проверяем строки
        for (let y = 0; y < rows; y++) {
            if (cellsToClear[y].every(cell => cell)) {
                score += 100;
            }
        }

        // Проверяем столбцы
        for (let x = 0; x < cols; x++) {
            if (cellsToClear.every(row => row[x])) {
                score += 100;
            }
        }

        return score;
    }

    private calculateComboPotential(cellsToClear: boolean[][]): number {
        let combo = 0;
        const rows = cellsToClear.length;
        const cols = cellsToClear[0].length;

        // Проверяем строки
        for (let y = 0; y < rows; y++) {
            if (cellsToClear[y].every(cell => cell)) {
                combo++;
            }
        }

        // Проверяем столбцы
        for (let x = 0; x < cols; x++) {
            if (cellsToClear.every(row => row[x])) {
                combo++;
            }
        }

        return combo;
    }

    private calculateBlockSize(block: Block): number {
        return block.matrix.reduce(
            (sum, row) => sum + row.reduce((rowSum, cell) => rowSum + cell, 0),
            0
        );
    }
} 