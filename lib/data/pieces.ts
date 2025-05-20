import { Block } from './types';

export const BLOCKS: Block[] = [
    {
        id: 'hor-2',
        name: 'Horizontal 2',
        difficulty: 'easy',
        matrix: [[1, 1]],
    },
    {
        id: 'hor-3',
        name: 'Horizontal 3',
        difficulty: 'easy',
        matrix: [[1, 1, 1]],
    },
    {
        id: 'hor-4',
        name: 'Horizontal 4',
        difficulty: 'medium',
        matrix: [[1, 1, 1, 1]],
    },
    {
        id: 'hor-5',
        name: 'Horizontal 5',
        difficulty: 'hard',
        matrix: [[1, 1, 1, 1, 1]],
    },
    {
        id: 'square-2x2',
        name: 'Square 2x2',
        difficulty: 'easy',
        matrix: [
            [1, 1],
            [1, 1],
        ],
    },
    {
        id: 'square-3x3',
        name: 'Square 3x3',
        difficulty: 'hard',
        matrix: [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1],
        ],
    },
    {
        id: 'vert-2',
        name: 'Vertical 2',
        difficulty: 'easy',
        matrix: [
            [1],
            [1],
        ],
    },
    {
        id: 'vert-3',
        name: 'Vertical 3',
        difficulty: 'easy',
        matrix: [
            [1],
            [1],
            [1],
        ],
    },
    {
        id: 'vert-4',
        name: 'Vertical 4',
        difficulty: 'medium',
        matrix: [
            [1],
            [1],
            [1],
            [1],
        ],
    },
    {
        id: 'vert-5',
        name: 'Vertical 5',
        difficulty: 'hard',
        matrix: [
            [1],
            [1],
            [1],
            [1],
            [1],
        ],
    },
    {
        id: 'corner-2',
        name: 'Corner 2',
        difficulty: 'medium',
        matrix: [
            [1, 0],
            [1, 1],
        ],
    },
    {
        id: 'corner-3',
        name: 'Corner 3',
        difficulty: 'hard',
        matrix: [
            [1, 1, 1],
            [1, 0, 0],
            [1, 0, 0],
        ],
    },
    {
        id: 'L-shape',
        name: 'L Shape',
        difficulty: 'hard',
        matrix: [
            [1, 0],
            [1, 0],
            [1, 1],
        ],
    },
    {
        id: 'rect-2x3',
        name: 'Rectangle 2x3',
        difficulty: 'hard',
        matrix: [
            [1, 1, 1],
            [1, 1, 1],
        ],
    },
    {
        id: 't-shape',
        name: 'T Shape',
        difficulty: 'medium',
        matrix: [
            [1, 1, 1],
            [0, 1, 0],
        ],
    },
    {
        id: 's-shape',
        name: 'S Shape',
        difficulty: 'hard',
        matrix: [
            [0, 1, 1],
            [1, 1, 0],
        ],
    },
    {
        id: '3-dots-diagonal',
        name: '3 Dots Diagonal',
        difficulty: 'hard',
        matrix: [
            [0, 0, 1],
            [0, 1, 0],
            [1, 0, 0],
        ],
    },
];
