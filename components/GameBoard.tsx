"use client";

import React, { useEffect, useRef, useState, useCallback, use } from "react";
import { useGameStore } from "../lib/state/store";
import { getCellsToClear } from "@/lib/core/engine";
import { findNearestValidPosition } from "../lib/core/positions";
import { DraggablePiece } from "./DraggablePiece";
import { Block, BlockColor, Matrix, Position } from "../lib/data/types";
import { getEventCoordinates } from "@/utils/events";
import { ScoreDisplay } from "./board/ScoreDisplay";
import { BlockGenerator } from "../lib/core/blockGenerator";
import { DifficultyEvaluator } from "../lib/core/difficulty";
import { GameOver } from "./GameOver";
import { ScoreCalculator } from "../lib/core/scoreCalculator";
import { Piece } from "./pieces/Piece";
import { ComboVisualizer } from "./board/ComboVisualizer";
import { SVGPreloader } from "@/utils/SVGPreloader";

const DEFAULT_CELL_SIZE = 43.75;

// Добавьте константу для размера зазора в пикселях
const GAP_SIZE_PX = 2; // Исходя из gap-0.5 в TailwindCSS (0.125rem * 16px)

interface GameBoardProps {
  width?: number;
  height?: number;
  onScoreUpdate: (score: number) => void;
  onGameOver: () => void;
  onExitGame: () => void;
}

// Динамически определяет размер клетки для корректной работы DnD
const useBoardAndCellSizes = () => {
  const boardRef = useRef<HTMLDivElement>(null);
  const cellRef = useRef<HTMLDivElement>(null);

  const [boardRect, setBoardRect] = useState<DOMRect | null>(null);
  const [dynamicCellSize, setDynamicCellSize] = useState(DEFAULT_CELL_SIZE);

  useEffect(() => {
    const updateSizes = () => {
      if (boardRef.current) {
        setBoardRect(boardRef.current.getBoundingClientRect());
      }
      if (cellRef.current) {
        setDynamicCellSize(cellRef.current.getBoundingClientRect().width);
        console.log(
          "Updated dynamicCellSize:",
          cellRef.current.getBoundingClientRect().width
        );
      }
    };

    // Update sizes initially
    updateSizes();

    // Add resize observer to boardRef for more accurate updates
    const resizeObserver = new ResizeObserver((entries) => {
      // Only update if boardRef is among the observed entries
      if (entries.some((entry) => entry.target === boardRef.current)) {
        updateSizes();
      }
    });

    if (boardRef.current) {
      resizeObserver.observe(boardRef.current);
    }

    // Also listen to window resize as a fallback/additional measure
    window.addEventListener("resize", updateSizes);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateSizes);
    };
  }, [boardRef, cellRef]);

  return { boardRef, cellRef, boardRect, dynamicCellSize };
};

const useGridPosition = () => {
  const { validPositions } = useGameStore();

  const { boardRef, cellRef, boardRect, dynamicCellSize } =
    useBoardAndCellSizes();

  // Для удобного "ускорения" движения призрака фигуры
  const calculateDynamicOffset = useCallback(
    (cursorX: number, cursorY: number) => {
      const referenceHeight = window.innerHeight;
      const referenceWidth = window.innerWidth;
      const referenceCenter = referenceWidth / 2;
      const minOffsetY = 1.5;
      const maxOffsetY = 3.5;
      const maxOffsetX = 2;

      const normalizedCursorY = Math.max(
        0,
        Math.min(1, cursorY / referenceHeight)
      );
      const normalizedCursorX = (cursorX - referenceCenter) / referenceCenter;

      const dynamicOffsetY =
        minOffsetY + (1 - normalizedCursorY) * (maxOffsetY - minOffsetY);

      const dynamicOffsetX = 1 - normalizedCursorX * maxOffsetX;

      return [dynamicOffsetX, dynamicOffsetY];
    },
    []
  );

  const calculateGridPosition = useCallback(
    (
      e: MouseEvent | TouchEvent,
      currentDragPosition: Position | null,
      lastHighlightedPosition: Position | null
    ) => {
      const rect = boardRect;

      if (!rect || !currentDragPosition) {
        console.warn(
          "boardRect or dragPosition not available in calculateGridPosition"
        );
        return null;
      }

      const { clientX, clientY } = getEventCoordinates(e);

      const { draggedPiece } = useGameStore.getState();
      if (!draggedPiece) return null;

      const [dynamicOffsetX, dynamicOffsetY] = calculateDynamicOffset(
        currentDragPosition.x,
        currentDragPosition.y
      );

      const pieceWidthCells = draggedPiece.matrix[0].length;
      const pieceHeightCells = draggedPiece.matrix.length;

      const offsetYMultiplier = pieceHeightCells < 2 ? 2 : 1;

      const offsetX =
        ((pieceWidthCells * dynamicCellSize) / 2) * dynamicOffsetX;
      const offsetY =
        pieceHeightCells * dynamicCellSize * dynamicOffsetY * offsetYMultiplier;

      const relativeX = clientX - rect.left;
      const relativeY = clientY - rect.top;

      // Здесь мы учитываем gap при вычислении индекса клетки
      const pitch = dynamicCellSize + GAP_SIZE_PX;

      const baseX = Math.round((relativeX - offsetX) / pitch);
      const baseY = Math.round((relativeY - offsetY) / pitch);

      const nearestPosition = findNearestValidPosition(
        validPositions,
        { x: baseX, y: baseY },
        lastHighlightedPosition
      );

      return nearestPosition;
    },
    [validPositions, boardRect, dynamicCellSize, calculateDynamicOffset]
  );

  return {
    boardRef,
    calculateGridPosition,
    dynamicCellSize,
    cellRef,
    boardRect,
    calculateDynamicOffset,
  };
};

export const GameBoard: React.FC<GameBoardProps> = ({
  width = 8,
  height = 8,
  onScoreUpdate,
  onGameOver,
  onExitGame,
}) => {
  const {
    board,
    currentPieces,
    placePiece,
    draggedPiece,
    dragPosition,
    startDrag,
    updateDrag,
    endDrag,
    setHoverCell,
    hoverCell,
    validPositions,
    initializeGame,
    score,
    lastScoreResult,

    setCurrentPieces,
    previewBlock,
    setPreviewBlock,
    resetGame,
  } = useGameStore();

  const {
    boardRef,
    cellRef,
    calculateGridPosition,
    dynamicCellSize,
    boardRect,
    calculateDynamicOffset,
  } = useGridPosition();

  const [clearingCells, setClearingCells] = useState<boolean[][]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [nextBlocks, setNextBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [combo, setCombo] = useState(0);
  const [blockEvaluations, setBlockEvaluations] = useState<
    Array<{
      difficulty: number;
      scorePotential: number;
    }>
  >([]);
  const [pieceEvaluations, setPieceEvaluations] = useState<
    Array<{
      difficulty: number;
      scorePotential: number;
    }>
  >([]);
  const [potentialClearHighlight, setPotentialClearHighlight] = useState<
    boolean[][]
  >([]);
  const [placedPiecesCount, setPlacedPiecesCount] = useState(0);
  const [lastHighlightedPosition, setLastHighlightedPosition] =
    useState<Position | null>(null);

  // Добавим новые состояния для хранения линий
  const [clearingHorizontalLines, setClearingHorizontalLines] = useState<
    number[]
  >([]);
  const [clearingVerticalLines, setClearingVerticalLines] = useState<number[]>(
    []
  );

  const blockGenerator = new BlockGenerator();
  const scoreCalculator = new ScoreCalculator();
  const difficultyEvaluator = new DifficultyEvaluator();
  useEffect(() => {});

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setClearingCells([]);
        setIsAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  useEffect(() => {
    if (currentPieces.length === 0) {
      initializeGame();
    }
  }, [currentPieces.length, initializeGame]);

  useEffect(() => {
    if (currentPieces.length > 0) {
      // Оцениваем каждую текущую фигуру
      const evaluations = currentPieces.map((piece) =>
        difficultyEvaluator.evaluateBlock(piece, board)
      );
      setPieceEvaluations(evaluations);
    }
  }, [currentPieces, board]);

  const generateNewBlocks = useCallback(() => {
    const newBlocks = blockGenerator.generateNextBlocks(board);
    setCurrentPieces(newBlocks);
    setPreviewBlock(blockGenerator.getPreviewBlock());
    setPlacedPiecesCount(0); // Reset placed pieces count when generating new blocks
  }, [board, blockGenerator, setCurrentPieces, setPreviewBlock]);

  const handlePieceStart = useCallback(
    (piece: Block, x: number, y: number) => {
      if (boardRef.current) {
        startDrag(piece);
        updateDrag({ x, y });
      }
    },
    [startDrag, updateDrag, boardRef]
  );

  const handlePiecePlacement = (x: number, y: number) => {
    if (draggedPiece && hoverCell) {
      const cellsToClear = getCellsToClear(board, draggedPiece, hoverCell);
      const hasCellsToClear = cellsToClear.some((row) =>
        row.some((cell) => cell)
      );

      if (hasCellsToClear) {
        // Находим горизонтальные линии
        const horizontalLines = cellsToClear
          .map((row, index) => (row.every((cell) => cell) ? index : -1))
          .filter((index) => index !== -1);

        // Находим вертикальные линии
        const verticalLines = Array(width)
          .fill(0)
          .map((_, colIndex) => {
            const isFullLine = cellsToClear.every((row) => row[colIndex]);
            return isFullLine ? colIndex : -1;
          })
          .filter((index) => index !== -1);

        // Сначала размещаем фигуру
        placePiece(x, y);

        // Затем запускаем анимацию
        requestAnimationFrame(() => {
          setClearingHorizontalLines(horizontalLines);
          setClearingVerticalLines(verticalLines);
          setIsAnimating(true);

          // Очищаем состояния анимации через некоторое время
          setTimeout(() => {
            setClearingHorizontalLines([]);
            setClearingVerticalLines([]);
            setIsAnimating(false);
          }, 300);
        });
      } else {
        placePiece(x, y);
      }
    }
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!draggedPiece || !boardRef.current) return;

      if (e instanceof TouchEvent) {
        e.preventDefault();
      }

      const { clientX, clientY } = getEventCoordinates(e);
      const currentDragPosition = { x: clientX, y: clientY };
      updateDrag(currentDragPosition);

      const nearestPosition = calculateGridPosition(
        e,
        currentDragPosition,
        lastHighlightedPosition
      );

      // Обновляем последнюю подсвеченную позицию только если есть новая позиция
      if (nearestPosition) {
        setLastHighlightedPosition(nearestPosition);
      } else {
        // Сбрасываем lastHighlightedPosition когда хайлайт исчезает
        setLastHighlightedPosition(null);
      }

      setHoverCell(nearestPosition);
    };

    const handleStart = (e: TouchEvent) => {
      // e.preventDefault();
    };

    const handleEnd = (e: MouseEvent | TouchEvent) => {
      if (draggedPiece) {
        if (hoverCell) {
          handlePiecePlacement(hoverCell.x, hoverCell.y);
        } else {
          endDrag();
        }
      }
      setHoverCell(null);
      setLastHighlightedPosition(null); // Сбрасываем при окончании перетаскивания
    };

    window.addEventListener("touchstart", handleStart, { passive: false });
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchend", handleEnd);
    window.addEventListener("touchcancel", handleEnd);

    return () => {
      window.removeEventListener("touchstart", handleStart);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchend", handleEnd);
      window.removeEventListener("touchcancel", handleEnd);
    };
  }, [
    draggedPiece,
    updateDrag,
    endDrag,
    setHoverCell,
    board,
    calculateGridPosition,
    hoverCell,
    lastHighlightedPosition,
  ]);

  const calculatePotentialClearLines = useCallback(
    (piece: Block, position: Position) => {
      if (!position) return [];

      // Создаем временную копию доски
      const tempBoard = board.map((row) => [...row]);

      // Размещаем фигуру на временной доске
      piece.matrix.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell.value === 1) {
            const boardY = position.y + y;
            const boardX = position.x + x;
            if (
              boardY >= 0 &&
              boardY < height &&
              boardX >= 0 &&
              boardX < width
            ) {
              tempBoard[boardY][boardX] = { value: 1, color: piece.color };
            }
          }
        });
      });

      // Проверяем горизонтальные линии (строки)
      const horizontalLines = tempBoard.map((row, y) => {
        return row.every((cell) => cell.value === 1);
      });

      // Проверяем вертикальные линии (столбцы)
      const verticalLines = Array(width)
        .fill(false)
        .map((_, x) => {
          return tempBoard.every((row) => row[x].value === 1);
        });

      // Создаем матрицу подсветки, где true означает, что ячейка входит в линию, которая будет очищена
      const highlightMatrix = tempBoard.map((row, y) => {
        return row.map((_, x) => {
          return horizontalLines[y] || verticalLines[x];
        });
      });

      return highlightMatrix;
    },
    [board, width, height]
  );

  useEffect(() => {
    if (draggedPiece && hoverCell) {
      const potentialLines = calculatePotentialClearLines(
        draggedPiece,
        hoverCell
      );
      setPotentialClearHighlight(potentialLines);
    } else {
      setPotentialClearHighlight([]);
    }
  }, [draggedPiece, hoverCell, calculatePotentialClearLines]);

  // const [ScoreResult, lastScoreResult] = useGameStore()
  const allColors: BlockColor[] = [
    "red",
    "blue",
    "green",
    "yellow",
    "purple",
    "orange",
  ]; // добавьте все ваши цвета
  return (
    <div className="flex flex-col items-center gap-8 min-h-screen bg-[var(--game-background)] p-4 no-select">
      <SVGPreloader colors={allColors} />
      {/* Top section: Score and Settings (placeholder) */}
      <div className="flex justify-between w-full items-center">
        <div className="text-2xl font-figtree font-bold text-white">
          500 {/* Placeholder for trophy */}
        </div>
        <ScoreDisplay newScore={score} moveScore={lastScoreResult} />

        <div className="text-2xl font-bold text-white" onClick={onExitGame}>
          ⚙️ {/* Placeholder for settings icon */}
        </div>
      </div>
      {/* <div className="w-1/2 break-all h-[3vh]">
        Debug: {JSON.stringify(lastScoreResult)}
      </div> */}
      {/* Middle section: Power-ups (placeholder) */}
      {/* <div className="flex justify-around w-full my-4">
        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white">⚡</div>
        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white">↩️</div>
        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white">💥</div>
        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white">🔄</div>
      </div> */}
      {/* Game Board Container - takes full width and maintains aspect ratio */}

      <div className="w-full aspect-square flex justify-center items-center p-4 md:max-w-xs md:max-h-xs">
        <div className="relative w-full h-full">
          <ComboVisualizer speed={4} lastScore={lastScoreResult} />

          <div
            ref={boardRef}
            className="relative z-10 grid grid-cols-8 grid-rows-8 gap-0.5 w-full h-full bg-gray-800 p-1 rounded-lg"
          >
            {board.map((row, y) => (
              <React.Fragment key={y}>
                {row.map((cell, x) => {
                  const isFirst = y === 0 && x === 0;
                  let highlight = false;
                  let isInClearingLine = false;
                  let isPotentiallyCleared = false;

                  if (draggedPiece && hoverCell) {
                    const pieceMatrix = draggedPiece.matrix;
                    const pieceX = x - hoverCell.x;
                    const pieceY = y - hoverCell.y;

                    if (
                      pieceY >= 0 &&
                      pieceY < pieceMatrix.length &&
                      pieceX >= 0 &&
                      pieceX < pieceMatrix[0].length
                    ) {
                      highlight = pieceMatrix[pieceY][pieceX].value === 1;
                    }
                  }

                  // Check if this cell is marked for potential clearing on hover
                  if (potentialClearHighlight[y]?.[x]) {
                    isPotentiallyCleared = true;
                  }
                  // Проверяем, находится ли ячейка в очищаемой линии
                  isInClearingLine =
                    clearingHorizontalLines.includes(y) ||
                    clearingVerticalLines.includes(x);

                  return (
                    <div
                      key={x}
                      ref={isFirst ? cellRef : null}
                      className={`rounded-[3px] ${
                        cell.value ? "bg-gray-700" : "bg-gray-900"
                      } ${highlight ? "ring-2 ring-blue-500" : ""} ${
                        isInClearingLine ? "clearing-line-horizontal" : ""
                      } ${isInClearingLine ? "clearing-line-vertical" : ""} ${
                        isPotentiallyCleared ? "potential-clear-highlight" : ""
                      }`}
                    >
                      {cell.value === 1 && cell.color && (
                        <Piece
                          color={cell.color}
                          size="100%"
                          isClearing={isInClearingLine}
                        />
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      {/* Draggable Pieces */}
      <div className="flex justify-center gap-4 mt-4 relative ">
        {currentPieces.map((piece) => {
          const isBeingDragged = draggedPiece?.uniqueId === piece.uniqueId;

          let itemStyle = {}; // Initialize an empty style object

          if (isBeingDragged && dragPosition) {
            const [dynamicGhostOffsetX, dynamicGhostOffsetY] =
              calculateDynamicOffset(dragPosition.x, dragPosition.y);
            // Calculate multiplier only when draggedPiece is guaranteed to exist
            const offsetYMultiplier = draggedPiece.matrix.length < 2 ? 2 : 1;

            itemStyle = {
              left:
                dragPosition.x -
                ((piece.matrix[0].length * dynamicCellSize) / 2) *
                  dynamicGhostOffsetX,
              top:
                dragPosition.y -
                piece.matrix.length *
                  dynamicCellSize *
                  dynamicGhostOffsetY *
                  offsetYMultiplier,
            };
          }

          return (
            <DraggablePiece
              key={piece.uniqueId}
              piece={piece}
              onStart={handlePieceStart}
              style={itemStyle}
              isGhost={isBeingDragged}
              ghostSize={dynamicCellSize}
              originalSize={dynamicCellSize * 0.6}
            />
          );
        })}
      </div>
      {isGameOver && <GameOver />}
    </div>
  );
};

export default GameBoard;
