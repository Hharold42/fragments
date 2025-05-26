import { Block, Matrix } from "../data/types";
import { DifficultyEvaluator } from "./difficulty";
import { findAllValidPositions } from "./positions";
import { BlockSetFinder } from "./blockSetFinder";

// Все возможные варианты фигур
const ALL_BLOCKS: Matrix[] = [
    // I (палка) - 2 варианта
    [
        [1, 1, 1, 1]
    ],
    [
        [1],
        [1],
        [1],
        [1]
    ],

    // O (квадрат) - 1 вариант
    [
        [1, 1],
        [1, 1]
    ],

    // T - 4 варианта
    [
        [1, 1, 1],
        [0, 1, 0]
    ],
    [
        [0, 1, 0],
        [1, 1, 1]
    ],
    [
        [1, 0],
        [1, 1],
        [1, 0]
    ],
    [
        [0, 1],
        [1, 1],
        [0, 1]
    ],

    // L - 4 варианта
    [
        [1, 0],
        [1, 0],
        [1, 1]
    ],
    [
        [0, 1],
        [0, 1],
        [1, 1]
    ],
    [
        [1, 1],
        [1, 0],
        [1, 0]
    ],
    [
        [1, 1],
        [0, 1],
        [0, 1]
    ],

    // J - 4 варианта (зеркальные L)
    [
        [0, 1],
        [0, 1],
        [1, 1]
    ],
    [
        [1, 0],
        [1, 0],
        [1, 1]
    ],
    [
        [1, 1],
        [0, 1],
        [0, 1]
    ],
    [
        [1, 1],
        [1, 0],
        [1, 0]
    ],

    // S - 4 варианта
    [
        [0, 1, 1],
        [1, 1, 0]
    ],
    [
        [1, 1, 0],
        [0, 1, 1]
    ],
    [
        [1, 0],
        [1, 1],
        [0, 1]
    ],
    [
        [0, 1],
        [1, 1],
        [1, 0]
    ],

    // Z - 4 варианта (зеркальные S)
    [
        [1, 1, 0],
        [0, 1, 1]
    ],
    [
        [0, 1, 1],
        [1, 1, 0]
    ],
    [
        [0, 1],
        [1, 1],
        [1, 0]
    ],
    [
        [1, 0],
        [1, 1],
        [0, 1]
    ],

    // 2x3 фигуры
    [
        [1, 1, 1],
        [1, 1, 1]
    ],
    [
        [1, 1],
        [1, 1],
        [1, 1]
    ],
    [
        [1, 1, 1],
        [0, 1, 0]
    ],
    [
        [0, 1, 0],
        [1, 1, 1]
    ],

    // 3x3 фигуры
    [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1]
    ],

    // Дополнительные фигуры
    [
        [1, 1, 1],
        [1, 0, 0]
    ],
    [
        [1, 1, 1],
        [0, 0, 1]
    ],
    [
        [1, 0, 0],
        [1, 1, 1]
    ],
    [
        [0, 0, 1],
        [1, 1, 1]
    ]
];

// Проверяем все матрицы на правильность формы
ALL_BLOCKS.forEach((matrix, index) => {
    if (!matrix || !matrix.length || !matrix[0] || !matrix[0].length) {
        console.error(`Invalid matrix at index ${index}:`, matrix);
    }
});

// Группируем фигуры по сложности
const BLOCKS_BY_DIFFICULTY = {
    easy: [0, 1, 2], // I, O
    medium: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], // T, L, J, S, Z
    hard: [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43] // 2x3, 3x3, дополнительные
};

export class BlockGenerator {
    private readonly evaluator: DifficultyEvaluator;
    private readonly blockSetFinder: BlockSetFinder;
    private readonly minPlacementOptions: number = 3;
    private readonly maxDifficulty: number = 80;
    private readonly minScorePotential: number = 30;
    private lastGeneratedBlocks: Block[] = [];
    private blockBag: Block[] = [];
    private previewBlock: Block | null = null;
    private readonly criticalThreshold: number = 0.3; // Порог для определения критической ситуации

    constructor() {
        this.evaluator = new DifficultyEvaluator();
        // Создаем блоки из матриц
        const blocks: Block[] = ALL_BLOCKS.map((matrix, index) => ({
            id: `block-${index}`,
            name: `Block ${index + 1}`,
            matrix,
            difficulty: this.getDifficultyForIndex(index)
        }));
        this.blockSetFinder = new BlockSetFinder(blocks);
        this.fillBlockBag();
    }

    private getDifficultyForIndex(index: number): 'easy' | 'medium' | 'hard' {
        if (BLOCKS_BY_DIFFICULTY.easy.includes(index)) return 'easy';
        if (BLOCKS_BY_DIFFICULTY.medium.includes(index)) return 'medium';
        return 'hard';
    }

    private getBlockType(block: Block): string {
        // Определяем тип блока по его форме
        const rows = block.matrix.length;
        const cols = block.matrix[0].length;
        const size = this.calculateBlockSize(block);

        if (size === 4 && rows === 2 && cols === 2) return 'square';
        if (size === 4 && (rows === 4 || cols === 4)) return 'line';
        if (size === 3 && (rows === 3 || cols === 3)) return 'L';
        if (size === 3 && (rows === 2 || cols === 2)) return 'small';
        return 'other';
    }

    private calculateBlockSize(block: Block): number {
        return block.matrix.reduce(
            (sum, row) => sum + row.reduce((rowSum, cell) => rowSum + cell, 0),
            0
        );
    }

    private fillBlockBag() {
        // Создаем мешок со всеми блоками
        this.blockBag = ALL_BLOCKS.map((matrix, index) => ({
            id: `block-${index}`,
            name: `Block ${index + 1}`,
            matrix,
            difficulty: this.getDifficultyForIndex(index)
        }));

        // Перемешиваем мешок
        for (let i = this.blockBag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.blockBag[i], this.blockBag[j]] = [this.blockBag[j], this.blockBag[i]];
        }

        // Устанавливаем preview блок
        this.previewBlock = this.blockBag[0];
    }

    private getNextBlock(): Block {
        if (this.blockBag.length === 0) {
            this.fillBlockBag();
        }
        const block = this.blockBag.shift()!;
        this.previewBlock = this.blockBag[0] || null;
        return block;
    }

    private isCriticalSituation(board: Matrix): boolean {
        // Проверяем заполненность верхних рядов
        const topRowsFilled = board.slice(0, 2).some(row => 
            row.some(cell => cell === 1)
        );

        // Проверяем количество доступных позиций для размещения
        const availablePositions = board.reduce((count, row) => 
            count + row.filter(cell => cell === 0).length, 0
        );
        const totalCells = board.length * board[0].length;
        const fillRatio = 1 - (availablePositions / totalCells);

        // Проверяем наличие больших пустых областей
        const hasLargeEmptyAreas = this.checkForLargeEmptyAreas(board);

        return topRowsFilled || fillRatio > 0.7 || hasLargeEmptyAreas;
    }

    private checkForLargeEmptyAreas(board: Matrix): boolean {
        const visited = new Set<string>();
        const rows = board.length;
        const cols = board[0].length;

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (board[y][x] === 0 && !visited.has(`${x},${y}`)) {
                    const areaSize = this.getEmptyAreaSize(board, x, y, visited);
                    if (areaSize > 12) { // Если пустая область больше 12 клеток
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private getEmptyAreaSize(board: Matrix, startX: number, startY: number, visited: Set<string>): number {
        const queue = [[startX, startY]];
        let size = 0;

        while (queue.length > 0) {
            const [x, y] = queue.shift()!;
            const key = `${x},${y}`;

            if (visited.has(key)) continue;
            visited.add(key);

            if (board[y][x] === 0) {
                size++;
                // Проверяем соседние клетки
                const neighbors = [
                    [x + 1, y], [x - 1, y],
                    [x, y + 1], [x, y - 1]
                ];

                for (const [nx, ny] of neighbors) {
                    if (
                        nx >= 0 && nx < board[0].length &&
                        ny >= 0 && ny < board.length &&
                        board[ny][nx] === 0 &&
                        !visited.has(`${nx},${ny}`)
                    ) {
                        queue.push([nx, ny]);
                    }
                }
            }
        }
        return size;
    }

    generateNextBlocks(board: Matrix): Block[] {
        // Проверяем, является ли ситуация критической
        if (this.isCriticalSituation(board)) {
            // Ищем подходящие наборы блоков
            const suitableSets = this.blockSetFinder.findSuitableBlockSets(board);
            if (suitableSets.length > 0) {
                const bestSet = suitableSets[0];
                console.log('Critical situation: Using calculated block set');
                this.lastGeneratedBlocks = bestSet.blocks;
                return bestSet.blocks;
            }
        }

        // В обычной ситуации генерируем случайные блоки
        console.log('Normal situation: Generating random blocks');
        return this.generateRandomBlocks(board);
    }

    private generateRandomBlocks(board: Matrix): Block[] {
        const blocks: Block[] = [];
        const maxAttempts = 10;
        let attempts = 0;

        while (blocks.length < 3 && attempts < maxAttempts) {
            const block = this.getNextBlock();
            const validPositions = findAllValidPositions(board, block);
            
            if (validPositions.length > 0) {
                blocks.push(block);
            } else {
                // Если блок нельзя разместить, возвращаем его в конец мешка
                this.blockBag.push(block);
            }
            attempts++;
        }

        // Если не набрали достаточно блоков, добавляем любые доступные
        while (blocks.length < 3) {
            const block = this.getNextBlock();
            blocks.push(block);
        }

        this.lastGeneratedBlocks = blocks;
        return blocks;
    }

    getPreviewBlock(): Block | null {
        return this.previewBlock;
    }
} 