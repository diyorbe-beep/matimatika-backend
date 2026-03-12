"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopItemType = exports.League = exports.AchievementRequirementType = exports.AchievementRarity = exports.ProgressStatus = exports.QuestionType = exports.DifficultyLevel = exports.GradeLevel = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["STUDENT"] = "student";
    UserRole["PARENT"] = "parent";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var GradeLevel;
(function (GradeLevel) {
    GradeLevel[GradeLevel["GRADE_3"] = 3] = "GRADE_3";
    GradeLevel[GradeLevel["GRADE_4"] = 4] = "GRADE_4";
    GradeLevel[GradeLevel["GRADE_5"] = 5] = "GRADE_5";
    GradeLevel[GradeLevel["GRADE_6"] = 6] = "GRADE_6";
})(GradeLevel || (exports.GradeLevel = GradeLevel = {}));
var DifficultyLevel;
(function (DifficultyLevel) {
    DifficultyLevel[DifficultyLevel["VERY_EASY"] = 1] = "VERY_EASY";
    DifficultyLevel[DifficultyLevel["EASY"] = 2] = "EASY";
    DifficultyLevel[DifficultyLevel["MEDIUM"] = 3] = "MEDIUM";
    DifficultyLevel[DifficultyLevel["HARD"] = 4] = "HARD";
    DifficultyLevel[DifficultyLevel["VERY_HARD"] = 5] = "VERY_HARD";
})(DifficultyLevel || (exports.DifficultyLevel = DifficultyLevel = {}));
var QuestionType;
(function (QuestionType) {
    QuestionType["MULTIPLE_CHOICE"] = "multiple_choice";
    QuestionType["DRAG_DROP"] = "drag_drop";
    QuestionType["INPUT"] = "input";
    QuestionType["TRUE_FALSE"] = "true_false";
})(QuestionType || (exports.QuestionType = QuestionType = {}));
var ProgressStatus;
(function (ProgressStatus) {
    ProgressStatus["NOT_STARTED"] = "not_started";
    ProgressStatus["IN_PROGRESS"] = "in_progress";
    ProgressStatus["COMPLETED"] = "completed";
})(ProgressStatus || (exports.ProgressStatus = ProgressStatus = {}));
var AchievementRarity;
(function (AchievementRarity) {
    AchievementRarity["COMMON"] = "common";
    AchievementRarity["RARE"] = "rare";
    AchievementRarity["EPIC"] = "epic";
    AchievementRarity["LEGENDARY"] = "legendary";
})(AchievementRarity || (exports.AchievementRarity = AchievementRarity = {}));
var AchievementRequirementType;
(function (AchievementRequirementType) {
    AchievementRequirementType["XP_THRESHOLD"] = "xp_threshold";
    AchievementRequirementType["STREAK"] = "streak";
    AchievementRequirementType["PERFECT_SCORE"] = "perfect_score";
    AchievementRequirementType["LESSONS_COMPLETED"] = "lessons_completed";
    AchievementRequirementType["TIME_SPENT"] = "time_spent";
})(AchievementRequirementType || (exports.AchievementRequirementType = AchievementRequirementType = {}));
var League;
(function (League) {
    League["BRONZE"] = "bronze";
    League["SILVER"] = "silver";
    League["GOLD"] = "gold";
    League["DIAMOND"] = "diamond";
})(League || (exports.League = League = {}));
var ShopItemType;
(function (ShopItemType) {
    ShopItemType["AVATAR"] = "avatar";
    ShopItemType["ACCESSORY"] = "accessory";
    ShopItemType["BACKGROUND"] = "background";
    ShopItemType["EFFECT"] = "effect";
})(ShopItemType || (exports.ShopItemType = ShopItemType = {}));
//# sourceMappingURL=index.js.map