import { Block, Matrix } from "../data/types";
import { DifficultyEvaluator } from "./difficulty";
import { findAllValidPositions } from "./positions";

export class BlockGenerator {
    private readonly evaluator: DifficultyEvaluator;
    private readonly minPlacementOptions: number = 3;
    private readonly maxDifficulty: number = 80;
    private readonly minScorePotential: number = 30;

    constructor() {
        this.evaluator = new DifficultyEvaluator();
    }

    generateNextBlocks(board: Matrix): Block[] {
        const blocks: Block[] = [];
        let attempts = 0;
        const maxAttempts = 50;

        // Генерируем первую фигуру
        while (blocks.length === 0 && attempts < maxAttempts) {
            const block = this.generateRandomBlock();
            const evaluation = this.evaluator.evaluateBlock(block, board);
            
            if (evaluation.placementOptions >= this.minPlacementOptions) {
                blocks.push(block);
            }
            attempts++;
        }

        // Генерируем вторую и третью фигуры
        while (blocks.length < 3 && attempts < maxAttempts) {
            const block = this.generateRandomBlock();
            const evaluation = this.evaluator.evaluateBlock(block, board);
            
            if (this.isBlockSuitable(block, board, evaluation)) {
                blocks.push(block);
            }
            attempts++;
        }

        return blocks;
    }

    private isBlockSuitable(
        block: Block,
        board: Matrix,
        evaluation: ReturnType<DifficultyEvaluator['evaluateBlock']>
    ): boolean {
        // Проверяем базовые требования
        if (evaluation.placementOptions < this.minPlacementOptions) {
            return false;
        }

        // Проверяем сложность
        if (evaluation.difficulty > this.maxDifficulty) {
            return false;
        }

        // Проверяем потенциал очков
        if (evaluation.scorePotential < this.minScorePotential) {
            return false;
        }

        return true;
    }

    private generateRandomBlock(): Block {
        // Список возможных фигур
        const blocks = [
            // Линейные фигуры
            { matrix: [[1, 1, 1]] },
            { matrix: [[1], [1], [1]] },
            // Квадратные фигуры
            { matrix: [[1, 1], [1, 1]] },
            // L-образные фигуры
            { matrix: [[1, 0], [1, 1]] },
            { matrix: [[0, 1], [1, 1]] },
            { matrix: [[1, 1], [1, 0]] },
            { matrix: [[1, 1], [0, 1]] },
            // T-образные фигуры
            { matrix: [[1, 1, 1], [0, 1, 0]] },
            { matrix: [[0, 1, 0], [1, 1, 1]] },
            { matrix: [[1, 0], [1, 1], [1, 0]] },
            { matrix: [[0, 1], [1, 1], [0, 1]] },
            // S-образные фигуры
            { matrix: [[0, 1, 1], [1, 1, 0]] },
            { matrix: [[1, 1, 0], [0, 1, 1]] },
            { matrix: [[1, 0], [1, 1], [0, 1]] },
            { matrix: [[0, 1], [1, 1], [1, 0]] }
        ];

        // Выбираем случайную фигуру
        const randomIndex = Math.floor(Math.random() * blocks.length);
        return blocks[randomIndex];
    }
} 