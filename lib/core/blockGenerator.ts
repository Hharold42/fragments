import { Block, Matrix, BlockColor, BLOCK_COLORS, Position, Cell } from "../data/types";
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
    easy: [0, 1, 2, 24, 25], // I, O (2x2), 2x3, 3x3
    medium: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], // T, L, J, S, Z
    hard: [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43] // остальные
};

export class BlockGenerator {
    private readonly evaluator: DifficultyEvaluator;
    private readonly blockSetFinder: BlockSetFinder;
    private lastGeneratedBlocks: Block[] = [];
    private blockBag: Block[] = [];
    private previewBlock: Block | null = null;
    private readonly comboThreshold: number = 0.3; // Уменьшаем порог для более частых комбо
    private readonly maxRepeatedBlocks: number = 2; // Уменьшаем количество повторений
    private readonly minComboPotential: number = 2; // Минимальное количество потенциальных линий для комбо
    private readonly comboChance: number = 0.6; // Шанс генерации комбо-набора
    private readonly complementaryChance: number = 0.3; // Шанс генерации комплементарных фигур

    constructor() {
        this.evaluator = new DifficultyEvaluator();
        const blocks: Block[] = ALL_BLOCKS.map((matrix, index) => ({
            id: `block-${index}`,
            uniqueId: `block-${index}_${Date.now()}`,
            name: `Block ${index + 1}`,
            matrix,
            difficulty: this.getDifficultyForIndex(index),
            color: this.getRandomColor()
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
        this.blockBag = ALL_BLOCKS.map((matrix, index) => ({
            id: `block-${index}`,
            uniqueId: `block-${index}_${Date.now()}`,
            name: `Block ${index + 1}`,
            matrix,
            difficulty: this.getDifficultyForIndex(index),
            color: this.getRandomColor()
        }));

        // Перемешиваем мешок
        for (let i = this.blockBag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.blockBag[i], this.blockBag[j]] = [this.blockBag[j], this.blockBag[i]];
        }

        // Устанавливаем preview блок
        this.previewBlock = this.blockBag[0];
    }

    private findComboOpportunities(board: Matrix): { positions: Position[], score: number }[] {
        const opportunities: { positions: Position[], score: number }[] = [];
        const rows = board.length;
        const cols = board[0].length;

        // Проверяем каждую позицию на доске
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                // Пропускаем занятые клетки
                if (board[y][x].value === 1) continue;

                // Проверяем все возможные фигуры
                for (const block of this.blockBag) {
                    const positions = findAllValidPositions(board, block);
                    
                    for (const pos of positions) {
                        // Проверяем, сколько линий может быть очищено
                        const linesToClear = this.countLinesToClear(board);
                        if (linesToClear >= this.minComboPotential) {
                            opportunities.push({
                                positions: [pos],
                                score: linesToClear
                            });
                        }
                    }
                }
            }
        }

        // Сортируем возможности по количеству потенциальных линий
        return opportunities.sort((a, b) => b.score - a.score);
    }

    private countLinesToClear(board: Matrix): number {
        let count = 0;
        
        // Проверяем строки
        for (let y = 0; y < board.length; y++) {
            if (board[y].every(cell => cell.value === 1)) count++;
        }
        
        // Проверяем столбцы
        for (let x = 0; x < board[0].length; x++) {
            if (board.every(row => row[x].value === 1)) count++;
        }
        
        return count;
    }

    private findComplementaryBlocks(board: Matrix, firstBlock: Block, firstPosition: Position): Block[] {
        const complementaryBlocks: Block[] = [];
        const rows = board.length;
        const cols = board[0].length;

        // Создаем временную доску с размещенной первой фигурой
        const tempBoard = board.map(row => [...row]);
        firstBlock.matrix.forEach((row, dy) => {
            row.forEach((cell, dx) => {
                if (cell.value === 1) {
                    tempBoard[firstPosition.y + dy][firstPosition.x + dx] = { value: 1, color: firstBlock.color };
                }
            });
        });

        // Ищем фигуры, которые могут создать комбо с первой
        for (const block of this.blockBag) {
            if (block.id === firstBlock.id) continue;

            const positions = findAllValidPositions(tempBoard, block);
            for (const pos of positions) {
                const linesToClear = this.countLinesToClear(tempBoard);
                if (linesToClear >= this.minComboPotential) {
                    complementaryBlocks.push(block);
                    break;
                }
            }
        }

        return complementaryBlocks;
    }

    generateNextBlocks(board: Matrix): Block[] {
        // Сначала проверяем возможность создания комбо
        if (Math.random() < this.comboChance) {
            const comboOpportunities = this.findComboOpportunities(board);
            if (comboOpportunities.length > 0) {
                // Выбираем лучшую возможность
                const bestOpportunity = comboOpportunities[0];
                const firstBlock = this.blockBag[Math.floor(Math.random() * this.blockBag.length)];
                
                // Ищем комплементарные блоки
                const complementaryBlocks = this.findComplementaryBlocks(board, firstBlock, bestOpportunity.positions[0]);
                
                if (complementaryBlocks.length >= 2) {
                    // Создаем набор из 3 фигур: первая + 2 комплементарные
                    const selectedBlocks = [
                        firstBlock,
                        complementaryBlocks[0],
                        complementaryBlocks[1]
                    ];

                    // Добавляем уникальные ID и цвета
                    return selectedBlocks.map((block, index) => ({
                        ...block,
                        uniqueId: `${block.id}_${Date.now()}_${index}`,
                        color: this.getRandomColor()
                    }));
                }
            }
        }

        // Если не удалось создать комбо, используем случайную генерацию
        return this.generateRandomBlocks(board);
    }

    private generateRandomBlocks(board: Matrix): Block[] {
        const selectedBlocks: Block[] = [];
        const usedTypes = new Set<string>();

        while (selectedBlocks.length < 3) {
            // Выбираем случайную фигуру из мешка
            const randomIndex = Math.floor(Math.random() * this.blockBag.length);
            const block = this.blockBag[randomIndex];
            
            // Проверяем, не превышен ли лимит повторений
            const blockType = this.getBaseFigureType(block);
            const typeCount = selectedBlocks.filter(b => this.getBaseFigureType(b) === blockType).length;
            
            if (typeCount < this.maxRepeatedBlocks) {
                selectedBlocks.push({
                    ...block,
                    uniqueId: `${block.id}_${Date.now()}_${selectedBlocks.length}`,
                    color: this.getRandomColor()
                });
                usedTypes.add(blockType);
            }
        }

        return selectedBlocks;
    }

    getPreviewBlock(): Block | null {
        return this.previewBlock;
    }
} 