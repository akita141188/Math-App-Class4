# Grade 4 content rigor & visual policy — V14

This patch is intentionally conservative with saved progress:

- canonical `generatorParams` are not changed;
- existing question IDs therefore stay stable;
- only visuals, test eligibility, labels and explanatory wording are strengthened.

## Foundation-only refresher types

These remain available for explicit practice/remediation but are removed from test assembly:

- multiplication-facts
- equal-groups
- division-facts
- sharing-equally
- recognize-shapes
- read-clock

They are labelled `(Ôn nền)` in the catalog so a Grade 4 learner is not misled into thinking
they represent the main difficulty level of the grade.

## Grade-4 visual requirements

### Angle measurement

`measure-angle-degrees` uses a true protractor view:

- semicircular scale;
- 5-degree ticks;
- major labels every 30 degrees;
- vertex O and rays OA/OB;
- an angle arc.

### Angle classification

`classify-angles` uses a clean angle-only diagram with:

- vertex/ray labels;
- angle arc;
- right-angle marker for 90 degrees;
- no protractor scale, because the task is classification rather than measurement.

### Clock

Analog clocks render:

- 60 minute ticks;
- 12 numerals;
- hour hand position adjusted by minutes;
- distinct hour/minute hand legend.

### Duration

Every `calculate-duration` question gets a time-line:

- start time;
- duration;
- unknown end time.

## Regression gates

The installer rebuilds the full 8,000-question bank, then runs:

- schema/content validation;
- deep audit;
- duplicate audit;
- Grade 4 rigor policy tests;
- visual renderer tests;
- test-assembler regressions;
- typecheck;
- lint;
- full tests;
- production build;
- diff check.
