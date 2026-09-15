import type { ContentStatus, Difficulty } from './curriculum';

export type QuestionFormat =
  | 'SHORT_ANSWER'
  | 'MULTIPLE_CHOICE'
  | 'MULTIPLE_SELECT'
  | 'TRUE_FALSE'
  | 'FILL_BLANK'
  | 'ORDERING'
  | 'MATCHING'
  | 'WRITTEN_SOLUTION';

export type AssessmentLevel = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3';

export type MisconceptionCode =
  | 'ARITHMETIC_SLIP'
  | 'WRONG_OPERATION'
  | 'PLACE_VALUE_ERROR'
  | 'MULTIPLICATION_FACT_GAP'
  | 'DIVISION_FACT_GAP'
  | 'UNIT_CONVERSION_ERROR'
  | 'QUESTION_MISREAD'
  | 'FRACTION_PART_WHOLE_CONFUSION'
  | 'GEOMETRY_PROPERTY_CONFUSION'
  | 'PROCEDURE_ERROR';

export interface AnswerOption {
  id: string;
  label: string;
}

export interface MatchingPair {
  leftId: string;
  leftLabel: string;
  rightId: string;
  rightLabel: string;
}

export type ExpectedAnswer =
  | { kind: 'NUMBER'; value: number; unit?: string }
  | {
      kind: 'FRACTION';
      numerator: number;
      denominator: number;
      requireExactForm?: boolean;
    }
  | { kind: 'TEXT'; accepted: string[] }
  | { kind: 'OPTION'; optionId: string }
  | { kind: 'OPTIONS'; optionIds: string[] }
  | { kind: 'BOOLEAN'; value: boolean }
  | { kind: 'ORDER'; itemIds: string[] }
  | { kind: 'MATCHES'; pairs: Array<{ leftId: string; rightId: string }> };

export interface SolutionStep {
  id: string;
  instruction: string;
  expression?: string;
}

export interface Hint {
  level: number;
  text: string;
}

export interface CommonError {
  code: MisconceptionCode;
  feedback: string;
}

export type QuestionVisual =
  | { type: 'FRACTION_BAR'; alt: string; equalParts: number; shadedParts: number }
  | { type: 'FRACTION_CIRCLE'; alt: string; equalParts: number; shadedParts: number }
  | {
      type: 'SHAPE';
      alt: string;
      shape: 'SQUARE' | 'RECTANGLE' | 'TRIANGLE' | 'CIRCLE';
      rotationDegrees?: number;
    }
  | { type: 'RECTANGLE_GRID'; alt: string; rows: number; columns: number; shaded: number }
  | { type: 'NUMBER_LINE'; alt: string; start: number; end: number; marker: number }
  | { type: 'CLOCK'; alt: string; hour: number; minute: number }
  | { type: 'RULER'; alt: string; lengthCm: number }
  | { type: 'MONEY'; alt: string; notes: number[] }
  | { type: 'BAR_CHART'; alt: string; bars: Array<{ label: string; value: number }> }
  | { type: 'TABLE'; alt: string; headers: string[]; rows: string[][] }
  | { type: 'OBJECT_GROUPS'; alt: string; groups: number; itemsPerGroup: number }
  | {
      type: 'GEOMETRY_DIAGRAM';
      alt: string;
      shape: 'RECTANGLE' | 'SQUARE';
      width: number;
      height: number;
      unit: string;
    }
  | {
      type: 'ANGLE';
      alt: string;
      degrees: number;
      rotationDegrees?: number;
      mode?: 'MEASURE' | 'CLASSIFY';
      vertexLabel?: string;
      rayLabels?: [string, string];
    }
  | {
      type: 'TIME_LINE';
      alt: string;
      startHour: number;
      startMinute: number;
      durationMinutes: number;
      endHour?: number;
      endMinute?: number;
      hideEnd?: boolean;
    }
  | {
      type: 'LINE_RELATION';
      alt: string;
      relation: 'PARALLEL' | 'PERPENDICULAR';
      rotationDegrees?: number;
      separation?: number;
    }
  | {
      type: 'QUADRILATERAL';
      alt: string;
      shape: 'PARALLELOGRAM' | 'RHOMBUS';
      rotationDegrees?: number;
      skew?: number;
    };

export interface Question {
  id: string;
  contentVersion: string;
  templateId: string;
  fingerprint: string;
  generatorParams: Record<string, string | number | boolean>;
  grade: number;
  domainId: string;
  topicId: string;
  skillId: string;
  problemTypeId: string;
  format: QuestionFormat;
  difficulty: Difficulty;
  assessmentLevel: AssessmentLevel;
  testEligible: boolean;
  scoreWeight: number;
  stem: string;
  visual?: QuestionVisual;
  options?: AnswerOption[];
  orderingItems?: AnswerOption[];
  matchingPairs?: MatchingPair[];
  expectedAnswer: ExpectedAnswer;
  solutionSteps: SolutionStep[];
  hints: Hint[];
  commonErrors: CommonError[];
  prerequisiteSkillIds: string[];
  explanation: string;
  status: ContentStatus;
  version: number;
}

export type StudentQuestion = Omit<
  Question,
  'expectedAnswer' | 'solutionSteps' | 'commonErrors' | 'explanation' | 'generatorParams'
>;

export interface FractionAnswer {
  kind: 'FRACTION';
  numerator: number;
  denominator: number;
}

export type StudentAnswer = string | string[] | boolean | FractionAnswer | Record<string, string>;

export interface AnswerResult {
  correct: boolean;
  feedback: string;
  misconception?: MisconceptionCode;
  explanation?: string;
}
