import type {
  FractionAnswer,
  StudentAnswer,
  StudentQuestion,
  TestQuestion,
} from '@math-app/shared';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface Props {
  question: StudentQuestion | TestQuestion;
  value: StudentAnswer | null;
  onChange: (value: StudentAnswer) => void;
  disabled?: boolean;
}

function asRecord(value: StudentAnswer | null): Record<string, string> {
  return value && typeof value === 'object' && !Array.isArray(value) && !isFractionAnswer(value)
    ? value
    : {};
}

function isFractionAnswer(value: StudentAnswer): value is FractionAnswer {
  if (typeof value !== 'object' || Array.isArray(value) || value === null) return false;
  const candidate = value as Partial<FractionAnswer>;
  return (
    candidate.kind === 'FRACTION' &&
    typeof candidate.numerator === 'number' &&
    typeof candidate.denominator === 'number'
  );
}

function asFraction(value: StudentAnswer | null): FractionAnswer {
  return value && isFractionAnswer(value)
    ? value
    : { kind: 'FRACTION', numerator: -1, denominator: -1 };
}

export function AnswerInput({ question, value, onChange, disabled = false }: Props) {
  if (question.format === 'MULTIPLE_CHOICE') {
    return (
      <fieldset className={'answer-options'}>
        <legend>Chọn một đáp án</legend>
        {question.options?.map((option) => (
          <label key={option.id} className={'answer-option'}>
            <input
              type={'radio'}
              name={question.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
              disabled={disabled}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>
    );
  }

  if (question.format === 'MULTIPLE_SELECT') {
    const selected = Array.isArray(value) ? value : [];
    return (
      <fieldset className={'answer-options'}>
        <legend>Em có thể chọn nhiều đáp án</legend>
        {question.options?.map((option) => (
          <label key={option.id} className={'answer-option'}>
            <input
              type={'checkbox'}
              checked={selected.includes(option.id)}
              onChange={() =>
                onChange(
                  selected.includes(option.id)
                    ? selected.filter((id) => id !== option.id)
                    : [...selected, option.id],
                )
              }
              disabled={disabled}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>
    );
  }

  if (question.format === 'TRUE_FALSE') {
    return (
      <fieldset className={'answer-options answer-options-two'}>
        <legend>Chọn đúng hoặc sai</legend>
        <button
          type={'button'}
          className={value === true ? 'answer-option selected' : 'answer-option'}
          onClick={() => onChange(true)}
          disabled={disabled}
        >
          Đúng
        </button>
        <button
          type={'button'}
          className={value === false ? 'answer-option selected' : 'answer-option'}
          onClick={() => onChange(false)}
          disabled={disabled}
        >
          Sai
        </button>
      </fieldset>
    );
  }

  if (question.visual?.type === 'FRACTION_CIRCLE' || question.visual?.type === 'FRACTION_BAR') {
    const fraction = asFraction(value);
    return (
      <fieldset className={'fraction-answer'}>
        <legend>Viết phân số</legend>
        <label>
          <span>Tử số</span>
          <input
            type={'number'}
            min={'0'}
            inputMode={'numeric'}
            aria-label={'Tử số'}
            value={fraction.numerator >= 0 ? fraction.numerator : ''}
            onChange={(event) =>
              onChange({
                ...fraction,
                numerator: event.target.value === '' ? -1 : Number(event.target.value),
              })
            }
            disabled={disabled}
          />
        </label>
        <span className={'fraction-divider'} aria-hidden={'true'}>
          /
        </span>
        <label>
          <span>Mẫu số</span>
          <input
            type={'number'}
            min={'2'}
            inputMode={'numeric'}
            aria-label={'Mẫu số'}
            value={fraction.denominator >= 0 ? fraction.denominator : ''}
            onChange={(event) =>
              onChange({
                ...fraction,
                denominator: event.target.value === '' ? -1 : Number(event.target.value),
              })
            }
            disabled={disabled}
          />
        </label>
      </fieldset>
    );
  }

  if (question.format === 'ORDERING') {
    const defaultOrder = question.orderingItems?.map((item) => item.id) ?? [];
    const order = Array.isArray(value) ? value : defaultOrder;
    const labels = new Map(question.orderingItems?.map((item) => [item.id, item.label]));
    const move = (index: number, direction: -1 | 1) => {
      const target = index + direction;
      if (target < 0 || target >= order.length) return;
      const next = [...order];
      const currentItem = next[index];
      const targetItem = next[target];
      if (!currentItem || !targetItem) return;
      next[index] = targetItem;
      next[target] = currentItem;
      onChange(next);
    };
    return (
      <fieldset className={'ordering-list'}>
        <legend>Sắp xếp bằng các nút lên và xuống</legend>
        {order.map((id, index) => (
          <div key={id} className={'ordering-item'}>
            <strong>
              {index + 1}. {labels.get(id)}
            </strong>
            <span>
              <button
                type={'button'}
                onClick={() => move(index, -1)}
                disabled={disabled || index === 0}
                aria-label={`Đưa ${labels.get(id)} lên`}
              >
                <ArrowUp />
              </button>
              <button
                type={'button'}
                onClick={() => move(index, 1)}
                disabled={disabled || index === order.length - 1}
                aria-label={`Đưa ${labels.get(id)} xuống`}
              >
                <ArrowDown />
              </button>
            </span>
          </div>
        ))}
      </fieldset>
    );
  }

  if (question.format === 'MATCHING') {
    const matches = asRecord(value);
    return (
      <fieldset className={'matching-list'}>
        <legend>Chọn kết quả tương ứng</legend>
        {question.matchingPairs?.map((pair) => (
          <label key={pair.leftId}>
            <strong>{pair.leftLabel}</strong>
            <select
              value={matches[pair.leftId] ?? ''}
              onChange={(event) => onChange({ ...matches, [pair.leftId]: event.target.value })}
              disabled={disabled}
            >
              <option value={''}>Chọn kết quả</option>
              {question.matchingPairs?.map((candidate) => (
                <option key={candidate.rightId} value={candidate.rightId}>
                  {candidate.rightLabel}
                </option>
              ))}
            </select>
          </label>
        ))}
      </fieldset>
    );
  }

  if (question.format === 'WRITTEN_SOLUTION') {
    const written = asRecord(value);
    return (
      <div className={'written-answer'}>
        <label>
          Phép tính
          <input
            value={written.calculation ?? ''}
            onChange={(event) => onChange({ ...written, calculation: event.target.value })}
            disabled={disabled}
          />
        </label>
        <label>
          Cách em suy nghĩ
          <textarea
            rows={3}
            value={written.explanation ?? ''}
            onChange={(event) => onChange({ ...written, explanation: event.target.value })}
            disabled={disabled}
          />
        </label>
        <label>
          Đáp số
          <input
            value={written.final ?? ''}
            onChange={(event) => onChange({ ...written, final: event.target.value })}
            disabled={disabled}
          />
        </label>
      </div>
    );
  }

  return (
    <label className={'short-answer'}>
      {question.format === 'FILL_BLANK' ? 'Điền vào chỗ trống' : 'Đáp án của em'}
      <input
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => onChange(event.target.value)}
        inputMode={question.format === 'SHORT_ANSWER' ? 'decimal' : 'text'}
        disabled={disabled}
        autoComplete={'off'}
      />
    </label>
  );
}
