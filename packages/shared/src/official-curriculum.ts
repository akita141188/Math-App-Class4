export type OfficialCurriculumLessonKind = 'CORE' | 'PRACTICE' | 'REVIEW' | 'EXPERIENCE';

export interface OfficialCurriculumLesson {
  number: number;
  id: string;
  chapterId: string;
  title: string;
  semester: 1 | 2;
  kind: OfficialCurriculumLessonKind;
  problemTypeIds: string[];
}

export interface OfficialCurriculumChapter {
  id: string;
  order: number;
  title: string;
  semester: 1 | 2;
  lessonNumbers: number[];
}

export interface OfficialCurriculumGuide {
  grade: 4;
  schoolYear: string;
  framework: string;
  officialTextbookSeries: string;
  policyDecision: string;
  chapters: OfficialCurriculumChapter[];
  lessons: OfficialCurriculumLesson[];
  referenceSeries: string[];
}
