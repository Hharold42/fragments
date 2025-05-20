import { create } from "zustand";
import { Block, GameState, Position } from "../data/types";
import { generateRandomBlocks, placeBlock, clearLines, isGameOver } from "../core/engine";

interface ExtendedGameState extends GameState {
    round: number;
    piecesPlaced: number;
}

export const useGameStore = create<ExtendedGameState & {
    selectPiece: (block: Block) => void;
    placePiece: (x: number, y: number) => void;
    resetGame: () => void;
}>((set, get) => ({
    board: Array(8).fill(0).map(() => Array(8).fill(0)),
    currentPieces: generateRandomBlocks(),
    selectedPiece: null,
    score: 0,
    gameOver: false,
    round: 1,
    piecesPlaced: 0,

    selectPiece: (block) => set({ selectedPiece: block }),

    placePiece: (x: number, y: number) => {
        const { board, selectedPiece, currentPieces, piecesPlaced, round } = get();
        
        if (!selectedPiece) return;

        const newBoard = placeBlock(board, selectedPiece, { x, y });
        
        // Если блок не был размещен, выходим
        if (newBoard === board) return;

        // Очищаем заполненные линии
        const { newBoard: clearedBoard, clearedLines } = clearLines(newBoard);
        
        // Проверяем окончание игры
        const gameOver = isGameOver(clearedBoard);
        
        // Обновляем счет
        const newScore = get().score + (clearedLines * 100);
        
        // Обновляем количество размещенных блоков и раунд
        let newPiecesPlaced = piecesPlaced + 1;
        let newRound = round;
        let newCurrentPieces = currentPieces.filter(piece => piece.id !== selectedPiece.id);
        
        // Если все блоки размещены, начинаем новый раунд
        if (newCurrentPieces.length === 0) {
            newRound = round + 1;
            newPiecesPlaced = 0;
            newCurrentPieces = generateRandomBlocks();
        }

        set({
            board: clearedBoard,
            selectedPiece: null,
            score: newScore,
            gameOver,
            round: newRound,
            piecesPlaced: newPiecesPlaced,
            currentPieces: newCurrentPieces
        });
    },

    resetGame: () => set({
        board: Array(8).fill(0).map(() => Array(8).fill(0)),
        currentPieces: generateRandomBlocks(),
        selectedPiece: null,
        score: 0,
        gameOver: false,
        round: 1,
        piecesPlaced: 0
    })
}));
