import { Block, Matrix, BlockColor, BLOCK_COLORS } from "../data/types";
import { DifficultyEvaluator } from "./difficulty";
import { findAllValidPositions } from "./positions";
import { BlockSetFinder } from "./blockSetFinder";

// Все возможные варианты фигур
const ALL_BLOCKS: Matrix[] = [
    // I (палка) - 2 варианта
    [
        [{ value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }]
    ],
    [
        [{ value: 1 }],
        [{ value: 1 }],
        [{ value: 1 }],
        [{ value: 1 }]
    ],

    // O (квадрат) - 1 вариант
    [
        [{ value: 1 }, { value: 1 }],
        [{ value: 1 }, { value: 1 }]
    ],

    // T - 4 варианта
    [
        [{ value: 1 }, { value: 1 }, { value: 1 }],
        [{ value: 0 }, { value: 1 }, { value: 0 }]
    ],
    [
        [{ value: 0 }, { value: 1 }, { value: 0 }],
        [{ value: 1 }, { value: 1 }, { value: 1 }]
    ],
    [
        [{ value: 1 }, { value: 0 }],
        [{ value: 1 }, { value: 1 }],
        [{ value: 1 }, { value: 0 }]
    ],
    [
        [{ value: 0 }, { value: 1 }],
        [{ value: 1 }, { value: 1 }],
        [{ value: 0 }, { value: 1 }]
    ],

    // L - 4 варианта
    [
        [{ value: 1 }, { value: 0 }],
        [{ value: 1 }, { value: 0 }],
        [{ value: 1 }, { value: 1 }]
    ],
    [
        [{ value: 0 }, { value: 1 }],
        [{ value: 0 }, { value: 1 }],
        [{ value: 1 }, { value: 1 }]
    ],
    [
        [{ value: 1 }, { value: 1 }],
        [{ value: 1 }, { value: 0 }],
        [{ value: 1 }, { value: 0 }]
    ],
    [
        [{ value: 1 }, { value: 1 }],
        [{ value: 0 }, { value: 1 }],
        [{ value: 0 }, { value: 1 }]
    ],

    // J - 4 варианта (зеркальные L)
    [
        [{ value: 0 }, { value: 1 }],
        [{ value: 0 }, { value: 1 }],
        [{ value: 1 }, { value: 1 }]
    ],
    [
        [{ value: 1 }, { value: 0 }],
        [{ value: 1 }, { value: 0 }],
        [{ value: 1 }, { value: 1 }]
    ],
    [
        [{ value: 1 }, { value: 1 }],
        [{ value: 0 }, { value: 1 }],
        [{ value: 0 }, { value: 1 }]
    ],
    [
        [{ value: 1 }, { value: 1 }],
        [{ value: 1 }, { value: 0 }],
        [{ value: 1 }, { value: 0 }]
    ],

    // S - 4 варианта
    [
        [{ value: 0 }, { value: 1 }, { value: 1 }],
        [{ value: 1 }, { value: 1 }, { value: 0 }]
    ],
    [
        [{ value: 1 }, { value: 1 }, { value: 0 }],
        [{ value: 0 }, { value: 1 }, { value: 1 }]
    ],
    [
        [{ value: 1 }, { value: 0 }],
        [{ value: 1 }, { value: 1 }],
        [{ value: 0 }, { value: 1 }]
    ],
    [
        [{ value: 0 }, { value: 1 }],
        [{ value: 1 }, { value: 1 }],
        [{ value: 1 }, { value: 0 }]
    ],

    // Z - 4 варианта (зеркальные S)
    [
        [{ value: 1 }, { value: 1 }, { value: 0 }],
        [{ value: 0 }, { value: 1 }, { value: 1 }]
    ],
    [
        [{ value: 0 }, { value: 1 }, { value: 1 }],
        [{ value: 1 }, { value: 1 }, { value: 0 }]
    ],
    [
        [{ value: 0 }, { value: 1 }],
        [{ value: 1 }, { value: 1 }],
        [{ value: 1 }, { value: 0 }]
    ],
    [
        [{ value: 1 }, { value: 0 }],
        [{ value: 1 }, { value: 1 }],
        [{ value: 0 }, { value: 1 }]
    ],

    // 2x3 фигуры
    [
        [{ value: 1 }, { value: 1 }, { value: 1 }],
        [{ value: 1 }, { value: 1 }, { value: 1 }]
    ],
    [
        [{ value: 1 }, { value: 1 }],
        [{ value: 1 }, { value: 1 }],
        [{ value: 1 }, { value: 1 }]
    ],
    [
        [{ value: 1 }, { value: 1 }, { value: 1 }],
        [{ value: 0 }, { value: 1 }, { value: 0 }]
    ],
    [
        [{ value: 0 }, { value: 1 }, { value: 0 }],
        [{ value: 1 }, { value: 1 }, { value: 1 }]
    ],

    // 3x3 фигуры
    [
        [{ value: 1 }, { value: 1 }, { value: 1 }],
        [{ value: 1 }, { value: 1 }, { value: 1 }],
        [{ value: 1 }, { value: 1 }, { value: 1 }]
    ],

    // Дополнительные фигуры
    [
        [{ value: 1 }, { value: 1 }, { value: 1 }],
        [{ value: 1 }, { value: 0 }, { value: 0 }]
    ],
    [
        [{ value: 1 }, { value: 1 }, { value: 1 }],
        [{ value: 0 }, { value: 0 }, { value: 1 }]
    ],
    [
        [{ value: 1 }, { value: 0 }, { value: 0 }],
        [{ value: 1 }, { value: 1 }, { value: 1 }]
    ],
    [
        [{ value: 0 }, { value: 0 }, { value: 1 }],
        [{ value: 1 }, { value: 1 }, { value: 1 }]
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
    private lastTwoGeneratedBlocks: Block[] = []; // Хранит последние две выданные фигуры

    constructor() {
        this.evaluator = new DifficultyEvaluator();
        // Создаем блоки из матриц
        const blocks: Block[] = ALL_BLOCKS.map((matrix, index) => ({
            id: `block-${index}`,
            name: `Block ${index + 1}`,
            matrix,
            difficulty: this.getDifficultyForIndex(index),
            FIGURE_TO_OFTEN: 0, // Инициализируем маркер
            color: this.getRandomColor() // Добавляем случайный цвет
        }));
        this.blockSetFinder = new BlockSetFinder(blocks);
        this.fillBlockBag();
    }

    private getDifficultyForIndex(index: number): 'easy' | 'medium' | 'hard' {
        if (BLOCKS_BY_DIFFICULTY.easy.includes(index)) return 'easy';
        if (BLOCKS_BY_DIFFICULTY.medium.includes(index)) return 'medium';
        return 'hard';
    }

    private getBaseFigureType(block: Block): string {
        const rows = block.matrix.length;
        const cols = block.matrix[0].length;
        const size = this.calculateBlockSize(block);

        // Определяем базовый тип фигуры
        if (size === 4) {
            if (rows === 2 && cols === 2) return 'square';
            if (rows === 1 || cols === 1) return 'line';
        }
        if (size === 3) {
            // Проверяем L-образные фигуры
            if (this.isLShape(block)) return 'L';
            // Проверяем T-образные фигуры
            if (this.isTShape(block)) return 'T';
            // Проверяем S/Z-образные фигуры
            if (this.isSShape(block)) return 'S';
        }
        return 'other';
    }

    private isLShape(block: Block): boolean {
        const matrix = block.matrix;
        const rows = matrix.length;
        const cols = matrix[0].length;
        
        // Проверяем все возможные L-образные формы
        const patterns = [
            [[1,0], [1,0], [1,1]], // L
            [[0,1], [0,1], [1,1]], // L отраженная
            [[1,1], [1,0], [1,0]], // L перевернутая
            [[1,1], [0,1], [0,1]]  // L перевернутая отраженная
        ];

        return patterns.some(pattern => {
            if (pattern.length !== rows || pattern[0].length !== cols) return false;
            return pattern.every((row, y) =>
                row.every((val, x) => matrix[y][x].value === val)
            );
        });
    }

    private isTShape(block: Block): boolean {
        const matrix = block.matrix;
        const rows = matrix.length;
        const cols = matrix[0].length;
        
        // Проверяем все возможные T-образные формы
        const patterns = [
            [[1,1,1], [0,1,0]], // T
            [[0,1,0], [1,1,1]], // T перевернутая
            [[1,0], [1,1], [1,0]], // T повернутая
            [[0,1], [1,1], [0,1]]  // T повернутая отраженная
        ];

        return patterns.some(pattern => {
            if (pattern.length !== rows || pattern[0].length !== cols) return false;
            return pattern.every((row, y) =>
                row.every((val, x) => matrix[y][x].value === val)
            );
        });
    }

    private isSShape(block: Block): boolean {
        const matrix = block.matrix;
        const rows = matrix.length;
        const cols = matrix[0].length;
        
        // Проверяем все возможные S-образные формы
        const patterns = [
            [[0,1,1], [1,1,0]], // S
            [[1,1,0], [0,1,1]], // S отраженная
            [[1,0], [1,1], [0,1]], // S повернутая
            [[0,1], [1,1], [1,0]]  // S повернутая отраженная
        ];

        return patterns.some(pattern => {
            if (pattern.length !== rows || pattern[0].length !== cols) return false;
            return pattern.every((row, y) =>
                row.every((val, x) => matrix[y][x].value === val)
            );
        });
    }

    private areMatricesSimilar(matrix1: Matrix, matrix2: Matrix): boolean {
        if (matrix1.length !== matrix2.length || matrix1[0].length !== matrix2[0].length) {
            return false;
        }

        return matrix1.every((row, y) =>
            row.every((cell, x) => cell.value === matrix2[y][x].value)
        );
    }

    private calculateBlockSize(block: Block): number {
        return block.matrix.reduce(
            (sum, row) => sum + row.reduce((rowSum, cell) => rowSum + cell.value, 0),
            0
        );
    }

    private getRandomColor(): BlockColor {
        const randomIndex = Math.floor(Math.random() * BLOCK_COLORS.length);
        return BLOCK_COLORS[randomIndex];
    }

    private fillBlockBag() {
        // Создаем мешок со всеми блоками
        this.blockBag = ALL_BLOCKS.map((matrix, index) => ({
            id: `block-${index}`,
            name: `Block ${index + 1}`,
            matrix,
            difficulty: this.getDifficultyForIndex(index),
            color: this.getRandomColor(),
            initialIndex: index,
        }));

        // Перемешиваем мешок
        for (let i = this.blockBag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.blockBag[i], this.blockBag[j]] = [this.blockBag[j], this.blockBag[i]];
        }

        // Устанавливаем preview блок
        this.previewBlock = this.blockBag[0];
    }

    private updateFigureFrequency(block: Block) {
        // Обновляем маркер частоты
        block.FIGURE_TO_OFTEN = (block.FIGURE_TO_OFTEN || 0) + 1;
        
        // Обновляем историю последних выданных фигур
        this.lastTwoGeneratedBlocks.push(block);
        if (this.lastTwoGeneratedBlocks.length > 2) {
            this.lastTwoGeneratedBlocks.shift();
        }

        // Проверяем и обнуляем маркеры для фигур, которые не выдавались 2 раза подряд
        this.blockBag.forEach(b => {
            if (!this.lastTwoGeneratedBlocks.includes(b)) {
                b.FIGURE_TO_OFTEN = 0;
            }
        });
    }

    private getNextBlock(): Block {
        if (this.blockBag.length === 0) {
            this.fillBlockBag();
        }
        const block = this.blockBag.pop()!;
        return {
            ...block,
            color: this.getRandomColor()
        };
    }

    private isCriticalSituation(board: Matrix): boolean {
        // Проверяем заполненность верхних рядов
        const topRowsFilled = board.slice(0, 2).some(row => 
            row.some(cell => cell.value === 1)
        );

        // Проверяем количество доступных позиций для размещения
        const availablePositions = board.reduce((count, row) => 
            count + row.filter(cell => cell.value === 0).length, 0
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
                if (board[y][x].value === 0 && !visited.has(`${x},${y}`)) {
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

            if (board[y][x].value === 0) {
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
                        board[ny][nx].value === 0 &&
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
                this.lastGeneratedBlocks = bestSet.blocks.map((block, index) => ({
                    ...block,
                    initialIndex: index,
                    color: block.color,
                }));
                return this.lastGeneratedBlocks;
            }
        }

        // В обычной ситуации генерируем случайные блоки
        console.log('Normal situation: Generating random blocks');
        const blocks = this.generateRandomBlocks(board);
        this.lastGeneratedBlocks = blocks.map((block, index) => ({
            ...block,
            initialIndex: index,
            color: block.color,
        }));
        return this.lastGeneratedBlocks;
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