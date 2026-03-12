"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mockQuestionsController_1 = require("../controllers/mockQuestionsController");
const router = (0, express_1.Router)();
router.get('/:moduleId/:lessonIndex', mockQuestionsController_1.MockQuestionsController.getLessonQuestions);
router.get('/', mockQuestionsController_1.MockQuestionsController.getAllQuestions);
exports.default = router;
//# sourceMappingURL=questions.js.map