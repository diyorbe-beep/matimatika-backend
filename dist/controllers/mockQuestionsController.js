"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockQuestionsController = void 0;
const logger_1 = require("../utils/logger");
class MockQuestionsController {
    static generateQuestions(moduleId, lessonIndex) {
        const lessonData = this.getLessonData(moduleId, lessonIndex);
        return lessonData.map((q, index) => ({
            id: `${moduleId}-lesson${lessonIndex}-q${index + 1}`,
            question: q.question,
            options: q.options,
            correct: q.correct,
            difficulty: (Math.min(index + 1 + lessonIndex, 5))
        }));
    }
    static getLessonData(moduleId, lessonIndex) {
        const allLessons = this.getAllModuleLessons(moduleId);
        const lessonKey = `lesson${lessonIndex}`;
        if (allLessons[lessonKey]) {
            return allLessons[lessonKey];
        }
        return this.getDefaultQuestions();
    }
    static getAllModuleLessons(moduleId) {
        const lessons = {
            'addition-subtraction': {
                lesson1: [
                    { question: "2 + 3 = ?", options: ["5", "6", "4", "7"], correct: 0 },
                    { question: "7 - 2 = ?", options: ["4", "5", "6", "3"], correct: 1 },
                    { question: "4 + 1 = ?", options: ["5", "6", "4", "7"], correct: 0 },
                    { question: "9 - 3 = ?", options: ["5", "6", "7", "4"], correct: 1 },
                    { question: "3 + 3 = ?", options: ["5", "6", "7", "8"], correct: 1 }
                ],
                lesson2: [
                    { question: "5 + 4 = ?", options: ["9", "8", "10", "7"], correct: 0 },
                    { question: "12 - 5 = ?", options: ["6", "7", "8", "5"], correct: 1 },
                    { question: "8 + 7 = ?", options: ["15", "14", "16", "13"], correct: 0 },
                    { question: "15 - 8 = ?", options: ["6", "7", "8", "5"], correct: 1 },
                    { question: "6 + 9 = ?", options: ["15", "14", "16", "13"], correct: 0 }
                ],
                lesson3: [
                    { question: "13 + 7 = ?", options: ["20", "19", "21", "18"], correct: 0 },
                    { question: "25 - 12 = ?", options: ["12", "13", "14", "11"], correct: 1 },
                    { question: "17 + 8 = ?", options: ["25", "24", "26", "23"], correct: 0 },
                    { question: "30 - 15 = ?", options: ["14", "15", "16", "13"], correct: 1 },
                    { question: "14 + 11 = ?", options: ["25", "24", "26", "23"], correct: 0 }
                ],
                lesson4: [
                    { question: "23 + 18 = ?", options: ["41", "40", "42", "39"], correct: 0 },
                    { question: "45 - 27 = ?", options: ["17", "18", "19", "16"], correct: 1 },
                    { question: "31 + 29 = ?", options: ["60", "59", "61", "58"], correct: 0 },
                    { question: "60 - 35 = ?", options: ["24", "25", "26", "23"], correct: 1 },
                    { question: "27 + 33 = ?", options: ["60", "59", "61", "58"], correct: 0 }
                ],
                lesson5: [
                    { question: "47 + 36 = ?", options: ["83", "82", "84", "81"], correct: 0 },
                    { question: "82 - 48 = ?", options: ["33", "34", "35", "32"], correct: 1 },
                    { question: "58 + 44 = ?", options: ["102", "101", "103", "100"], correct: 0 },
                    { question: "100 - 67 = ?", options: ["32", "33", "34", "31"], correct: 1 },
                    { question: "39 + 61 = ?", options: ["100", "99", "101", "98"], correct: 0 }
                ]
            },
            'multiplication-division': {
                lesson1: [
                    { question: "2 × 3 = ?", options: ["6", "5", "7", "4"], correct: 0 },
                    { question: "6 ÷ 2 = ?", options: ["2", "3", "4", "1"], correct: 1 },
                    { question: "3 × 4 = ?", options: ["12", "11", "13", "10"], correct: 0 },
                    { question: "8 ÷ 4 = ?", options: ["1", "2", "3", "4"], correct: 1 },
                    { question: "5 × 2 = ?", options: ["10", "9", "11", "8"], correct: 0 }
                ],
                lesson2: [
                    { question: "4 × 6 = ?", options: ["24", "23", "25", "22"], correct: 0 },
                    { question: "15 ÷ 3 = ?", options: ["4", "5", "6", "3"], correct: 1 },
                    { question: "7 × 7 = ?", options: ["49", "48", "50", "47"], correct: 0 },
                    { question: "24 ÷ 6 = ?", options: ["3", "4", "5", "2"], correct: 1 },
                    { question: "8 × 8 = ?", options: ["64", "63", "65", "62"], correct: 0 }
                ],
                lesson3: [
                    { question: "6 × 8 = ?", options: ["48", "47", "49", "46"], correct: 0 },
                    { question: "36 ÷ 6 = ?", options: ["5", "6", "7", "4"], correct: 1 },
                    { question: "9 × 7 = ?", options: ["63", "62", "64", "61"], correct: 0 },
                    { question: "56 ÷ 7 = ?", options: ["7", "8", "9", "6"], correct: 1 },
                    { question: "12 × 5 = ?", options: ["60", "59", "61", "58"], correct: 0 }
                ]
            },
            'advanced-math': {
                lesson1: [
                    { question: "15² = ?", options: ["225", "224", "226", "223"], correct: 0 },
                    { question: "√144 = ?", options: ["11", "12", "13", "10"], correct: 1 },
                    { question: "2³ = ?", options: ["8", "6", "9", "7"], correct: 0 },
                    { question: "√81 = ?", options: ["8", "9", "10", "7"], correct: 1 },
                    { question: "3³ = ?", options: ["27", "26", "28", "25"], correct: 0 }
                ]
            },
            'geometry': {
                lesson1: [
                    { question: "A triangle has how many sides?", options: ["3", "4", "5", "2"], correct: 0 },
                    { question: "A square has how many sides?", options: ["3", "4", "5", "6"], correct: 1 },
                    { question: "How many degrees in a right angle?", options: ["90°", "45°", "180°", "270°"], correct: 0 },
                    { question: "How many sides does a hexagon have?", options: ["5", "6", "7", "8"], correct: 1 },
                    { question: "How many degrees in a circle?", options: ["360°", "180°", "270°", "90°"], correct: 0 }
                ]
            },
            'fractions': {
                lesson1: [
                    { question: "1/2 + 1/2 = ?", options: ["1", "1/2", "1/4", "2"], correct: 0 },
                    { question: "3/4 - 1/4 = ?", options: ["1/2", "1/4", "3/4", "1"], correct: 0 },
                    { question: "2/3 + 1/3 = ?", options: ["1", "2/3", "1/3", "4/3"], correct: 0 },
                    { question: "5/6 - 1/6 = ?", options: ["2/3", "1/2", "3/4", "4/6"], correct: 0 },
                    { question: "1/4 + 1/2 = ?", options: ["3/4", "1/2", "1", "2/3"], correct: 0 }
                ]
            }
        };
        return lessons[moduleId] || {};
    }
    static getDefaultQuestions() {
        return [
            { question: "What is 2 + 2?", options: ["3", "4", "5", "6"], correct: 1 },
            { question: "What is 10 - 3?", options: ["6", "7", "8", "9"], correct: 1 },
            { question: "What is 3 × 3?", options: ["6", "7", "8", "9"], correct: 3 },
            { question: "What is 8 ÷ 2?", options: ["3", "4", "5", "6"], correct: 1 },
            { question: "What is 5 + 7?", options: ["11", "12", "13", "14"], correct: 1 }
        ];
    }
    static async getLessonQuestions(req, res) {
        try {
            const { moduleId, lessonIndex } = req.params;
            const lessonNum = parseInt(lessonIndex);
            if (isNaN(lessonNum) || lessonNum < 1 || lessonNum > 10) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid lesson index. Must be between 1 and 10.'
                });
            }
            const questions = MockQuestionsController.generateQuestions(moduleId, lessonNum);
            (0, logger_1.logUserAction)('questions_loaded', 'system', { moduleId, lessonIndex });
            res.json({
                success: true,
                data: questions,
                count: questions.length
            });
        }
        catch (error) {
            console.error('Get lesson questions error:', error);
            (0, logger_1.logError)(error, {
                moduleId: req.params.moduleId,
                lessonIndex: req.params.lessonIndex,
                method: 'getLessonQuestions'
            });
            res.status(500).json({
                success: false,
                error: 'Failed to get questions'
            });
        }
    }
    static async getAllQuestions(req, res) {
        try {
            const allQuestions = {
                'addition-subtraction': {},
                'multiplication-division': {},
                'advanced-math': {},
                'geometry': {},
                'fractions': {}
            };
            Object.keys(allQuestions).forEach(moduleId => {
                for (let i = 1; i <= 10; i++) {
                    allQuestions[moduleId][`lesson${i}`] = MockQuestionsController.generateQuestions(moduleId, i);
                }
            });
            res.json({
                success: true,
                data: allQuestions
            });
        }
        catch (error) {
            console.error('Get all questions error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get questions'
            });
        }
    }
}
exports.MockQuestionsController = MockQuestionsController;
//# sourceMappingURL=mockQuestionsController.js.map