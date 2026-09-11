import type { DemoProblem } from '@math-app/shared';
import { Injectable } from '@nestjs/common';

const demoProblem: DemoProblem = {
  id: 'demo-multiplication-01',
  grade: 4,
  topic: 'Phép nhân với số có một chữ số',
  statement:
    'Một cửa hàng có 245 hộp bánh. Mỗi hộp có 6 chiếc bánh. Hỏi cửa hàng có tất cả bao nhiêu chiếc bánh?',
  question: 'Cửa hàng có tất cả bao nhiêu chiếc bánh?',
  hints: [
    'Tìm hai số cho biết số hộp và số bánh trong mỗi hộp.',
    'Mỗi hộp đều có 6 chiếc bánh. Em nên dùng phép tính nào?',
    'Đặt tính 245 × 6 và nhân lần lượt từ hàng đơn vị.',
  ],
};

@Injectable()
export class ProblemService {
  getDemoProblem(): DemoProblem {
    return demoProblem;
  }
}
