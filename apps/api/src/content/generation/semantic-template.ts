import type { ProblemBlueprint } from '../catalog.data';
import type { GeneratedCore } from './generator-types';
import { formatVi } from './content-math';

/** Applies student-visible template structures without changing the oracle. */
export function applySemanticTemplate(
  blueprint: ProblemBlueprint,
  core: GeneratedCore,
  template: number,
): GeneratedCore {
  const p = core.params;
  let stem = core.stem;
  if (
    (blueprint.id === 'mental-addition' || blueprint.id === 'column-addition') &&
    'a' in p &&
    'b' in p
  ) {
    const a = Number(p.a);
    const b = Number(p.b);
    if (template === 1) stem = `Điền số thích hợp: ${formatVi(a)} + ${formatVi(b)} = □.`;
    if (template === 2)
      stem = `Thư viện có ${formatVi(a)} quyển sách và nhận thêm ${formatVi(b)} quyển. Thư viện có tất cả bao nhiêu quyển sách?`;
    if (template === 3)
      stem = `Bạn An tính ${formatVi(a)} + ${formatVi(b)}. Hãy kiểm tra kết quả của bạn An.`;
    if (template === 4) stem = `Trình bày cách đặt tính và tính ${formatVi(a)} + ${formatVi(b)}.`;
  }
  if (
    (blueprint.id === 'mental-subtraction' || blueprint.id === 'column-subtraction') &&
    'a' in p &&
    'b' in p
  ) {
    const a = Number(p.a);
    const b = Number(p.b);
    if (template === 1) stem = `Điền số thích hợp: ${formatVi(a)} − ${formatVi(b)} = □.`;
    if (template === 2)
      stem = `Kho có ${formatVi(a)} kg gạo, đã chuyển đi ${formatVi(b)} kg. Kho còn lại bao nhiêu ki-lô-gam gạo?`;
    if (template === 3)
      stem = `Bạn An tính ${formatVi(a)} − ${formatVi(b)}. Hãy kiểm tra kết quả của bạn An.`;
    if (template === 4) stem = `Trình bày cách đặt tính và tính ${formatVi(a)} − ${formatVi(b)}.`;
  }
  if (
    ['multiplication-facts', 'multiply-one-digit', 'multiply-two-digits'].includes(blueprint.id) &&
    'multiplicand' in p &&
    'factor' in p
  ) {
    const a = Number(p.multiplicand);
    const b = Number(p.factor);
    if (template === 1) stem = `Điền số thích hợp: ${formatVi(a)} × ${b} = □.`;
    if (template === 2)
      stem = `Có ${b} thùng như nhau, mỗi thùng có ${formatVi(a)} sản phẩm. Có tất cả bao nhiêu sản phẩm?`;
    if (template === 3)
      stem = `Bạn An tính ${formatVi(a)} × ${b}. Hãy kiểm tra kết quả của bạn An.`;
    if (template === 4) stem = `Trình bày cách tính ${formatVi(a)} × ${b} và nêu kết quả.`;
  }
  if (
    ['division-facts', 'divide-one-digit', 'divide-two-digits'].includes(blueprint.id) &&
    'dividend' in p &&
    'divisor' in p
  ) {
    const dividend = Number(p.dividend);
    const divisor = Number(p.divisor);
    if (template === 1) stem = `Điền số thích hợp: ${formatVi(dividend)} : ${divisor} = □.`;
    if (template === 2)
      stem = `Chia đều ${formatVi(dividend)} sản phẩm vào ${divisor} nhóm. Mỗi nhóm có bao nhiêu sản phẩm?`;
    if (template === 3)
      stem = `Bạn An tính ${formatVi(dividend)} : ${divisor}. Hãy kiểm tra kết quả của bạn An.`;
    if (template === 4)
      stem = `Trình bày cách tính ${formatVi(dividend)} : ${divisor} và dùng phép nhân để thử lại.`;
  }
  return stem === core.stem ? core : { ...core, stem };
}
