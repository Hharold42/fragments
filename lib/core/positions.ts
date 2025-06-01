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
    // Проверяем, что матрица блока существует и имеет правильную форму
    if (!block.matrix || !block.matrix.length || !block.matrix[0] || !block.matrix[0].length) {
        console.warn('Invalid block matrix:', block);
        return [];
    }

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
    // Проверяем, что матрица блока существует и имеет правильную форму
    if (!block.matrix || !block.matrix.length || !block.matrix[0] || !block.matrix[0].length) {
        return false;
    }

    const { x, y } = position;
    const [blockRows, blockCols] = [block.matrix.length, block.matrix[0].length];

    // Проверяем каждую клетку блока
    for (let i = 0; i < blockRows; i++) {
        for (let j = 0; j < blockCols; j++) {
            if (block.matrix[i][j].value === 1) {
                // Проверяем, что клетка не выходит за пределы доски
                if (y + i >= board.length || x + j >= board[0].length) {
                    return false;
                }
                // Проверяем, что клетка не занята
                if (board[y + i][x + j].value === 1) {
                    return false;
                }
            }
        }
    }

    return true;
}

// export function findAllValidPositions(board: Matrix, block: Block): Position[] {
//     const validPositions: Position[] = [];
    
//     // Перебираем все возможные позиции на доске
//     for (let y = 0; y < board.length; y++) {
//         for (let x = 0; x < board[0].length; x++) {
//             // Проверяем, можно ли разместить блок в этой позиции
//             if (canPlaceBlock(board, block, { x, y })) {
//                 validPositions.push({ x, y });
//             }
//         }
//     }
    
//     return validPositions;
// }

// function canPlaceBlock(board: Matrix, block: Block, position: Position): boolean {
//     const { matrix } = block;
    
//     // Проверяем каждую клетку блока
//     for (let y = 0; y < matrix.length; y++) {
//         for (let x = 0; x < matrix[0].length; x++) {
//             if (matrix[y][x] === 1) {
//                 const boardX = position.x + x;
//                 const boardY = position.y + y;
                
//                 // Проверяем границы доски
//                 if (boardX < 0 || boardX >= board[0].length || boardY < 0 || boardY >= board.length) {
//                     return false;
//                 }
                
//                 // Проверяем, что клетка на доске свободна
//                 if (board[boardY][boardX] === 1) {
//                     return false;
//                 }
//             }
//         }
//     }
    
//     return true;
// }
