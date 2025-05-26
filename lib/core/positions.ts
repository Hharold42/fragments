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
    currentPosition: Position
): Position | null {
    if (validPositions.length === 0) return null;

    const nearest =  validPositions.reduce((nearest, current) => {
        const currentDistance = Math.sqrt(
            Math.pow(current.x - currentPosition.x, 2) + 
            Math.pow(current.y - currentPosition.y, 2)
        );
        const nearestDistance = Math.sqrt(
            Math.pow(nearest.x - currentPosition.x, 2) + 
            Math.pow(nearest.y - currentPosition.y, 2)
        );

        return currentDistance < nearestDistance ? current : nearest;
    });

    const distance = Math.sqrt(
      Math.pow(nearest.x - currentPosition.x, 2) +
      Math.pow(nearest.y - currentPosition.y, 2) 
    )

    return distance <= DISTANCE_THRESHOLD ? nearest : null
}

export function findAllValidPositions(board: Matrix, block: Block): Position[] {
    const validPositions: Position[] = [];
    
    // Перебираем все возможные позиции на доске
    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[0].length; x++) {
            // Проверяем, можно ли разместить блок в этой позиции
            if (canPlaceBlock(board, block, { x, y })) {
                validPositions.push({ x, y });
            }
        }
    }
    
    return validPositions;
}

function canPlaceBlock(board: Matrix, block: Block, position: Position): boolean {
    const { matrix } = block;
    
    // Проверяем каждую клетку блока
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[0].length; x++) {
            if (matrix[y][x] === 1) {
                const boardX = position.x + x;
                const boardY = position.y + y;
                
                // Проверяем границы доски
                if (boardX < 0 || boardX >= board[0].length || boardY < 0 || boardY >= board.length) {
                    return false;
                }
                
                // Проверяем, что клетка на доске свободна
                if (board[boardY][boardX] === 1) {
                    return false;
                }
            }
        }
    }
    
    return true;
}
