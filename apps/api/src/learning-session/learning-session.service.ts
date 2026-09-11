import type { CheckAnswerResponse } from '@math-app/shared';
import { Injectable } from '@nestjs/common';
import { CheckAnswerDto } from './check-answer.dto';

@Injectable()
export class LearningSessionService {
  checkDemoAnswer(input: CheckAnswerDto): CheckAnswerResponse {
    const normalizedAnswer = input.answer.toLocaleLowerCase('vi').replace(/[.\s]/g, '');
    const correct =
      input.problemId === 'demo-multiplication-01' && normalizedAnswer.includes('1470');

    if (correct) {
      return {
        correct: true,
        feedback: 'Đúng rồi! 245 × 6 = 1 470 chiếc bánh.',
        nextState: 'SOLVED',
      };
    }

    return {
      correct: false,
      feedback: 'Em kiểm tra lại phép nhân 245 × 6, nhất là phần nhớ ở hàng chục nhé.',
      nextState: 'ERROR_DIAGNOSIS',
    };
  }
}
