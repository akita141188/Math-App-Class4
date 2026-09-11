# CODEX PROMPT — APPROVED JSON BANK ARCHITECTURE + FULL IMPLEMENTATION

Repository:

```text
D:\Math-app-class4
```

The JSON-per-problem-type storage approach is APPROVED.

Proceed with the full implementation now.

Do not ask me for confirmation again for normal implementation decisions.

Only stop if you need to introduce:

- database,
- paid external service,
- destructive Git operation,
- real AI/OCR integration.

---

# 1. DECISION — QUESTION BANK STORAGE

Use:

```text
REVIEWED TEMPLATE / GENERATOR
        ↓
DETERMINISTIC GENERATION
        ↓
CANONICAL MATERIALIZED JSON BANK
        ↓
VALIDATION / AUDIT
        ↓
API SERVING
        ↓
RANDOMIZED PRACTICE SESSION
```

Do NOT:

- hand-write thousands of JSON questions;
- create one JSON file per question;
- place the whole bank inside the React bundle;
- generate uninspectable questions only at runtime.

---

# 2. JSON STRUCTURE

Shard by:

```text
grade → problem type
```

Suggested structure:

```text
apps/api/src/content/banks/
  grade-4/
    v2/
      manifest.json
      natural-number-place-value.json
      compare-natural-numbers.json
      addition-column.json
      subtraction-column.json
      multiplication-one-digit.json
      ...
```

One finalized problem type = one JSON bank file.

Do NOT create 4,000 individual files.

---

# 3. MANIFEST

Create a manifest similar to:

```json
{
  "grade": 4,
  "contentVersion": "grade4-v2",
  "generationSeed": "grade4-bank-v2",
  "generatedAt": "...",
  "problemTypes": [
    {
      "problemTypeId": "...",
      "questionCount": 100,
      "easy": 25,
      "medium": 50,
      "hard": 25,
      "templates": 6
    }
  ]
}
```

`generatedAt` must NOT participate in deterministic question IDs/fingerprints.

---

# 4. SOURCE OF TRUTH

JSON is the canonical MATERIALIZED BANK used by runtime/API.

But mathematical generation rules must live in reviewed generator/template code.

Meaning:

Generator/template:

- defines parameters;
- defines valid parameter ranges;
- computes answer;
- creates stem;
- creates visual;
- creates hints;
- creates explanation.

Then:

```text
content:build-bank
```

materializes deterministic JSON.

Never manually maintain answer separately from the parameters that produced it.

---

# 5. QUESTION IDs

Question IDs must be stable and deterministic.

Example concept:

```text
grade + problemType + template + normalized parameters
```

Do not use:

- random UUID during each build;
- timestamps;
- array index that changes when ordering changes.

Rebuilding the same content seed should generate exactly the same IDs and fingerprints.

---

# 6. BUILD REPRODUCIBILITY

This must hold:

```text
same source
+ same generation seed
+ same content version
=
same question bank
```

Add a reproducibility test.

Run build twice and verify content fingerprints remain identical.

---

# 7. >= 100 QUESTIONS PER FINAL PROBLEM TYPE

This requirement remains HARD.

After curriculum/taxonomy audit is finalized:

EVERY problem type:

```text
>= 100 UNIQUE VALID questions
```

Do not stop at the current 40 types if Grade 4 curriculum needs more.

If final taxonomy becomes:

```text
52 problem types
```

then minimum bank is:

```text
5,200 valid unique questions
```

No exception.

---

# 8. QUALITY BEFORE QUANTITY

Do NOT immediately generate 100 for every existing type.

Execution order remains:

1. curriculum audit;
2. benchmark;
3. taxonomy correction;
4. existing 200-question audit;
5. validator/oracle improvement;
6. finalize problem types;
7. create reviewed generators;
8. then expand >=100/type.

The previously reported 200 REVIEWED questions are NOT trusted automatically.

Revalidate all of them.

---

# 9. TEMPLATE DIVERSITY

Do not satisfy 100 questions with one template and 100 number substitutions.

Where educationally appropriate target at least:

```text
5 meaningful templates / problem type
```

Example for multiplication:

Template A:
direct calculation

Template B:
missing factor

Template C:
equal groups word problem

Template D:
identify correct expression

Template E:
find an error in another student's solution

Template F:
visual groups

Not every problem type needs exactly the same templates,
but diversity must be meaningful.

---

# 10. RANDOM SESSION DESIGN

Question bank generation is deterministic.

PRACTICE SELECTION is random.

These are two separate concerns.

Runtime selection:

```text
bank
→ filter selected problem types
→ difficulty policy
→ exclude recent history
→ template balancing
→ random sample
→ Fisher-Yates shuffle
→ session snapshot
```

Do not randomize the canonical bank itself on every request.

---

# 11. RECENT QUESTION HISTORY

Because we intentionally do not have authentication/database yet:

store recent question history locally on the student device.

Track at least:

```text
problemTypeId
questionId
fingerprint
lastSeenAt
```

Do not store unnecessary raw student personal data.

When requesting a new session, frontend may send an exclusion/history list
to the API.

API must choose from the server-side bank.

Do NOT send the entire 100-question bank to React just so React can randomize it.

---

# 12. ROTATION POLICY

For a problem type with 100 questions and a session of 10:

Ideal behavior:

```text
Session 1:
10 unique random questions

Session 2:
10 different eligible questions

Session 3:
another different set

...
```

Do not repeat recent questions while enough unseen questions remain.

When almost all 100 have been seen:

reuse the OLDEST seen questions first.

This is a shuffle-bag / rotating-pool concept,
not naive independent random sampling.

---

# 13. SESSION STABILITY

Once the API creates a practice session, persist in that session:

```text
contentVersion
ordered question IDs
question snapshot / required immutable data
difficulty selection
selected problem types
```

React re-render MUST NOT generate different questions.

Submitting an answer MUST NOT re-randomize the question.

---

# 14. RANDOM OPTIONS

Multiple-choice option order may be randomized,
but must be frozen when the session is created.

Do not reshuffle options after:

- re-render,
- answering,
- showing a hint.

Otherwise the child can click the wrong option because positions moved.

---

# 15. SERVER-SIDE BANK

Do not import thousands of questions into the initial web bundle.

Full question bank belongs to API/content side.

Frontend should receive only:

- curriculum metadata;
- problem type metadata;
- active practice questions;
- required visual data.

---

# 16. CONTENT VERSION

Use:

```text
grade4-v2
```

or another clearly documented version.

Every session and question response should include/reference `contentVersion`.

When a mathematical error is fixed later we need to know which version contained it.

---

# 17. STRICT SCHEMA VALIDATION

Never trust generated JSON merely because our generator created it.

When API loads bank:

validate schema.

At build time:

validate schema.

At content audit:

validate again.

A malformed generated bank should fail loudly.

---

# 18. NO SILENT SKIPS

If a bank file contains an invalid question:

DO NOT silently drop it and continue reporting 100.

The problem type fails validation.

Example:

```text
99 valid
1 invalid
```

Result:

```text
FAIL
```

not:

```text
PASS 99
```

---

# 19. CONTENT COUNT DEFINITION

The >=100 requirement means:

>=100 questions that simultaneously pass:

- schema validation
- mathematical oracle validation
- unique fingerprint
- ambiguity check
- visual consistency
- option validation
- unit validation
- curriculum mapping

Invalid entries do not count.

---

# 20. QUESTION REVIEW PAGE

The HTML review export is important.

Make it useful for manually inspecting thousands of questions.

Need:

- filter domain;
- filter topic;
- filter problem type;
- filter difficulty;
- filter format;
- filter visual/non-visual;
- search question ID/text.

Each question card must show:

```text
Question ID
Problem type
Template ID
Difficulty
Format
Stem
Visual
Options
Correct answer
Hints
Explanation
Fingerprint
```

Provide quick navigation between questions.

This is an internal generated QA artifact, not student UI.

---

# 21. CURRICULUM AUDIT FIRST

Do not assume the current 40 problem types are enough.

Perform the Vietnamese Grade 4 curriculum audit before locking bank generation.

I want a reasonably granular taxonomy similar in principle to mature skill-based Math products.

However:

do not split a skill only to inflate problem-type count.

Each problem type must represent a meaningful separately-practicable learning task.

---

# 22. VERY IMPORTANT — VIETNAMESE MATHEMATICS QUALITY

Pay special attention to:

- Vietnamese number formatting;
- place value wording;
- units;
- money;
- elapsed time;
- fraction terminology;
- geometry terminology;
- word problems;
- expressions;
- division with remainder;
- contextual answer units.

Do not translate English Math phrasing mechanically into Vietnamese.

Questions must sound like Grade 4 Vietnamese school mathematics.

---

# 23. MANUAL QA IS REQUIRED

Automated tests alone are NOT enough.

After bank generation:

For every problem type inspect representative EASY/MEDIUM/HARD questions.

Visual-heavy types must receive additional visual review.

Generate:

```text
docs/CONTENT_QA_REPORT.md
```

with:

```text
problemType
questions inspected
issues found
issues fixed
remaining concerns
```

Do not simply write:

```text
manual review PASS
```

Give actual counts.

---

# 24. STOP CONDITIONS

You must NOT report completion merely because:

- typecheck passed;
- tests passed;
- 5,000 JSON records exist.

Completion requires:

```text
Problem types below 100 = 0
Math errors = 0
Ambiguous questions = 0
Visual mismatches = 0
Duplicate fingerprints = 0
Broken references = 0
```

and representative manual review completed.

---

# 25. CONTINUE IMPLEMENTATION

Proceed with:

A. benchmark documentation  
B. curriculum audit  
C. taxonomy correction  
D. deep content validators  
E. generator registry  
F. oracle/property tests  
G. bank materialization  
H. >=100/type expansion  
I. randomization + recent-history rotation  
J. session content snapshot/version  
K. review export  
L. manual sample QA  
M. visual QA  
N. full quality gates

Do not stop after building infrastructure.

The final requested result includes the populated bank.

---

# 26. FINAL REPORT

At the end I require exact numbers.

Do not tell me only:

```text
all tests passed
```

Give:

```text
Domains
Topics
Skills
Problem types

Total generated questions
Total valid questions
Minimum/type
Maximum/type
Median/type
Types below 100

EASY/MEDIUM/HARD counts

Question counts by format
Question counts by visual type

Questions rejected during generation
Ambiguities detected
Math errors detected
Visual inconsistencies detected
Duplicate fingerprints detected

Manual questions reviewed
Manual issues found
Manual issues corrected
Remaining issues
```

Randomization simulation:

- number of sessions;
- questions/session;
- duplicates within sessions;
- recent repeats;
- total unique questions reached before recycling.

Also report:

```text
Exact automated test count
Frontend bundle size
git status
git diff --stat
```

Do not commit.

Do not push.

Proceed now.
