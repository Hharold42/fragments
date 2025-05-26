import { Block, Matrix, Position } from "../data/types";
import { canPlaceBlock } from "./engine";

const DISTANCE_THRESHOLD = 1.5;

export function calculateValidPositions(
    board: Matrix,
    block: Block
): Position[] {

    
    const validPositions: Position[] = [];

    // Перебираем все возможные позиции на поле
    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[0].length; x++) {
            if (canPlaceBlock(board, block, { x, y })) {
                validPositions.push({ x, y });
            }
        }
    }

    return validPositions;
}

export function findNearestValidPosition(
    validPositions: Position[],
    target: Position
): Position | null {
    if (validPositions.length === 0) return null;

    let nearest = validPositions[0];
    let minDistance = Number.MAX_VALUE;

    for (const pos of validPositions) {
        const distance = Math.sqrt(
            Math.pow(pos.x - target.x, 2) + Math.pow(pos.y - target.y, 2)
        );
        if (distance < minDistance) {
            minDistance = distance;
            nearest = pos;
        }
    }

    return nearest;
}

export function findAllValidPositions(board: Matrix, block: Block): Position[] {
    const validPositions: Position[] = [];
    const [rows, cols] = [board.length, board[0].length];
    const [blockRows, blockCols] = [block.matrix.length, block.matrix[0].length];

    for (let y = 0; y <= rows - blockRows; y++) {
        for (let x = 0; x <= cols - blockCols; x++) {
            if (isValidPlacement(board, block, { x, y })) {
                validPositions.push({ x, y });
            }
        }
    }

    return validPositions;
}

function isValidPlacement(board: Matrix, block: Block, position: Position): boolean {
    const { x, y } = position;
    const [blockRows, blockCols] = [block.matrix.length, block.matrix[0].length];

    // Проверяем каждую клетку блока
    for (let i = 0; i < blockRows; i++) {
        for (let j = 0; j < blockCols; j++) {
            if (block.matrix[i][j] === 1) {
                // Проверяем, что клетка не выходит за пределы доски
                if (y + i >= board.length || x + j >= board[0].length) {
                    return false;
                }
                // Проверяем, что клетка не занята
                if (board[y + i][x + j] === 1) {
                    return false;
                }
            }
        }
    }

    return true;
}
