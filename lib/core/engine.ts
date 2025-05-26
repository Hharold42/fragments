import { Block, Matrix, Position } from "../data/types";

export function canPlaceBlock(
  board: Matrix,
  block: Block,
  position: Position
): boolean {
  const { matrix } = block;
  const { x, y } = position;

  // Проверяем границы поля
  if (
    x < 0 ||
    y < 0 ||
    x + matrix[0].length > board[0].length ||
    y + matrix.length > board.length
  ) {
    return false;
  }

  // Проверяем коллизии с существующими блоками
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] === 1 && board[y + i][x + j] === 1) {
        return false;
      }
    }
  }

  return true;
}

export function placeBlock(
  board: Matrix,
  block: Block,
  position: Position
): Matrix {
  if (!canPlaceBlock(board, block, position)) {
    return board;
  }

  const newBoard = board.map((row) => [...row]);
  const { matrix } = block;
  const { x, y } = position;

  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] === 1) {
        newBoard[y + i][x + j] = 1;
      }
    }
  }

  return newBoard;
}

function findCellsToClear(board: Matrix): boolean[][] {
  const height = board.length;
  const width = board[0].length;

  // Создаем матрицу для пометки клеток, которые нужно очистить
  const cellsToClear = board.map((row) => row.map(() => false));

  // Проверяем строки
  for (let y = 0; y < height; y++) {
    if (board[y].every((cell) => cell === 1)) {
      // Помечаем все клетки в строке для очистки
      for (let x = 0; x < width; x++) {
        cellsToClear[y][x] = true;
      }
    }
  }

  // Проверяем столбцы
  for (let x = 0; x < width; x++) {
    if (board.every((row) => row[x] === 1)) {
      // Помечаем все клетки в столбце для очистки
      for (let y = 0; y < height; y++) {
        cellsToClear[y][x] = true;
      }
    }
  }

  return cellsToClear;
}

export function clearLines(board: Matrix): {
  newBoard: Matrix;
  clearedLines: number;
  clearedCells: boolean[][];
} {
  const cellsToClear = findCellsToClear(board);

  // Подсчитываем количество очищенных клеток
  const clearedCells = cellsToClear.reduce(
    (sum, row) => sum + row.filter((cell) => cell).length,
    0
  );

  // Создаем новую доску, очищая помеченные клетки
  const newBoard = board.map((row, y) =>
    row.map((cell, x) => (cellsToClear[y][x] ? 0 : cell))
  );

  // Подсчитываем количество очищенных линий
  const clearedLines = Math.floor(clearedCells / board[0].length);

  return {
    newBoard,
    clearedLines,
    clearedCells: cellsToClear,
  };
}

export function getCellsToClear(
  board: Matrix,
  block: Block,
  position: Position
): boolean[][] {
  // Создаем временную доску с размещенным блоком
  const tempBoard = placeBlock(board, block, position);

  // Используем общую функцию для определения клеток, которые будут очищены
  return findCellsToClear(tempBoard);
}

export function isGameOver(board: Matrix): boolean {
  // Проверяем, есть ли заполненные клетки в верхней строке
  return board[0].some((cell) => cell === 1);
}
