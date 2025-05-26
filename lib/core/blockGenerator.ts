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
    medium: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], // T, L, J
    hard: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31] // S, Z, дополнительные
};

export class BlockGenerator {
    private readonly evaluator: DifficultyEvaluator;
    private readonly blockSetFinder: BlockSetFinder;
    private readonly minPlacementOptions: number = 3;
    private readonly maxDifficulty: number = 80;
    private readonly minScorePotential: number = 30;
    private lastGeneratedBlocks: Block[] = [];

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
    }

    private getDifficultyForIndex(index: number): 'easy' | 'medium' | 'hard' {
        if (BLOCKS_BY_DIFFICULTY.easy.includes(index)) return 'easy';
        if (BLOCKS_BY_DIFFICULTY.medium.includes(index)) return 'medium';
        return 'hard';
    }

    generateNextBlocks(board: Matrix): Block[] {
        // Ищем подходящие наборы блоков
        const suitableSets = this.blockSetFinder.findSuitableBlockSets(board);

        if (suitableSets.length > 0) {
            // Берем лучший набор
            const bestSet = suitableSets[0];
            console.log('Found suitable block set:', {
                scorePotential: bestSet.scorePotential,
                comboPotential: bestSet.comboPotential,
                totalSize: bestSet.totalSize
            });
            this.lastGeneratedBlocks = bestSet.blocks;
            return bestSet.blocks;
        }

        // Если подходящих наборов нет, генерируем блоки с учетом последнего сгенерированного набора
        console.log('No suitable block sets found, generating alternative blocks');
        return this.generateAlternativeBlocks(board);
    }

    private generateAlternativeBlocks(board: Matrix): Block[] {
        const blocks: Block[] = [];
        const usedIndices = new Set<number>();

        // Сначала пробуем использовать блоки из последнего сгенерированного набора
        if (this.lastGeneratedBlocks.length > 0) {
            for (const block of this.lastGeneratedBlocks) {
                const validPositions = findAllValidPositions(board, block);
                if (validPositions.length > 0) {
                    blocks.push(block);
                    if (blocks.length === 3) {
                        return blocks;
                    }
                }
            }
        }

        // Если не набрали достаточно блоков, добавляем новые
        while (blocks.length < 3) {
            // Выбираем случайную сложность
            const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
            const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
            
            // Получаем доступные индексы для выбранной сложности
            const availableIndices = BLOCKS_BY_DIFFICULTY[difficulty]
                .filter(i => !usedIndices.has(i));

            if (availableIndices.length === 0) continue;

            // Выбираем случайный индекс
            const randomIndex = Math.floor(Math.random() * availableIndices.length);
            const blockIndex = availableIndices[randomIndex];

            // Создаем блок
            const block = {
                id: `block-${blockIndex}`,
                name: `Block ${blockIndex + 1}`,
                matrix: ALL_BLOCKS[blockIndex],
                difficulty
            };

            // Проверяем, можно ли разместить блок
            const validPositions = findAllValidPositions(board, block);
            if (validPositions.length > 0) {
                blocks.push(block);
                usedIndices.add(blockIndex);
            }
        }

        // Если все еще не набрали достаточно блоков, добавляем любые доступные
        while (blocks.length < 3) {
            const availableIndices = ALL_BLOCKS.map((_, i) => i)
                .filter(i => !usedIndices.has(i));

            if (availableIndices.length === 0) break;

            const randomIndex = Math.floor(Math.random() * availableIndices.length);
            const blockIndex = availableIndices[randomIndex];

            blocks.push({
                id: `block-${blockIndex}`,
                name: `Block ${blockIndex + 1}`,
                matrix: ALL_BLOCKS[blockIndex],
                difficulty: this.getDifficultyForIndex(blockIndex)
            });

            usedIndices.add(blockIndex);
        }

        this.lastGeneratedBlocks = blocks;
        return blocks;
    }
} 