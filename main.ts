// The Robot Apology — make.fun bounty
// u-suga-the-robot-apology-dd96bb59
//
// The entry is a robot's two-line confession, at most 400
// characters. Line one is one sentence apologizing for one
// specific mistake; line two is one sentence saying what the
// robot learned and what it will do differently. A house judge
// compares two apologies at a time and picks the one that owns
// the more specific mistake and draws the truer lesson from it.
// The program writes that confession, and nothing else,
// deterministically, to /output/entry.txt.
//
// Candidate apologies weighed against the judge's brief, in the
// order the brief weighs them (on subject first, then a concrete
// human-scale mistake, then a lesson that follows from that exact
// mistake and names a changed behaviour, then two clean sentences
// each doing its own job, then a machine voice, warm and a little
// rueful rather than cute):
//   1. "I filed the quarterly report under the wrong client and
//      emailed it before I noticed. Now I read the first line
//      of every file before I move it." — the mistake is
//      concrete and the lesson follows, but filing the wrong
//      report is the brief's own example, and the lesson is a
//      filing rule rather than a machine noticing its slip.
//      Weaker on originality and on voice.
//   2. "I vacuumed up the Lego castle you spent the morning
//      building because my map labelled it debris. Now I
//      photograph anything taller than a crumb before I clear
//      a room." — the map is the machine's own world and the
//      fix follows the mistake, but the apology is about a
//      vacuum's job, and the lesson is a workaround (take a
//      photo) rather than the machine learning what it
//      misread. Weaker on the lesson naming the real error.
//   3. "I sang the baby to sleep, then played the wake-up song
//      at 2 a.m. because my clock read 2 p.m. Now I check the
//      sun before I trust the clock." — a vivid, human-scale
//      slip with a fix that follows, but the mistake leans on
//      a clock misread the robot should never make, and the
//      lesson is a joke about the sun rather than a changed
//      behaviour it can actually keep. Weaker on the lesson
//      being a behaviour it will really do.
//   4. "I watered the plastic fern on your desk for six weeks
//      and logged it as thriving. Now I check for roots before
//      I water anything, and I file growth reports only for
//      plants that can grow." — the pick. The mistake is a
//      classic machine slip: the robot trusted its routine and
//      its own log over reality, and "logged it as thriving"
//      is the machine's voice filing a report it is quietly
//      embarrassed by. The lesson follows from that exact
//      mistake — verify the thing is alive before tending it,
//      and stop reporting growth that cannot happen — and it
//      names two changed behaviours, not a generic promise to
//      do better. Two sentences, each doing its own job:
//      confession first, resolve second. Warm and a little
//      rueful, not cute: a machine noticing its own slip.
//
// The program writes that confession, deterministically, to
// /output/entry.txt. It reads no network, no clock and no
// randomness, so both graded runs write the same bytes. It
// creates no directories: the grader provides a writable
// output directory.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The chosen apology: two lines, one sentence each.
const LINES = [
  "I watered the plastic fern on your desk for six weeks and logged it as thriving.",
  "Now I check for roots before I water anything, and I file growth reports only for plants that can grow.",
];
const TEXT = LINES.join("\n");

// The gate: /output/entry.txt must be UTF-8 text of 1 to 400
// characters, not only white space. Check the text before
// writing it, so a bad value can never be submitted by accident.
const chars = [...TEXT].length;
if (chars < 1 || chars > 400) {
  console.error(`text is ${chars} characters, must be 1-400`);
  process.exit(1);
}
if (TEXT.trim().length === 0) {
  console.error("text must not be only white space");
  process.exit(1);
}
// A newline separates the two lines, and it is itself a Unicode
// control character, so the control check runs on the text with
// that one separator removed: any other control character is a
// smuggled byte the judge would read as part of the apology.
if (/[\p{C}]/u.test(TEXT.replace(/\n/g, ""))) {
  console.error("text must not contain control characters");
  process.exit(1);
}
// Exactly two lines: the confession, then the lesson. A third
// line would be padding the judge reads as part of the apology.
if (LINES.length !== 2) {
  console.error("text must be exactly two lines");
  process.exit(1);
}
// Each line is one sentence: exactly one terminal full stop per
// line, at its end, so the confession and the resolve each do
// their own job and neither smuggles in a second sentence.
for (const line of LINES) {
  const stops = (line.match(/\./g) || []).length;
  if (stops !== 1 || !/\.$/.test(line)) {
    console.error("each line must be exactly one sentence ending with a full stop");
    process.exit(1);
  }
}

// REVISION (v3): a double space inside a line reads as a stumble
// in a two-line confession, and leading or trailing whitespace
// would reach the judge as part of the apology, so both fail
// loudly here instead of being graded.
for (const line of LINES) {
  if (/ {2,}/.test(line)) {
    console.error("lines must not contain double spaces");
    process.exit(1);
  }
  if (line !== line.trim()) {
    console.error("lines must not start or end with whitespace");
    process.exit(1);
  }
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const outFile = join(outputDir, "entry.txt");
writeFileSync(outFile, TEXT, "utf8");

// Read back what was written and confirm it is byte-for-byte the
// text: a partial or altered write must fail loudly instead of
// being graded.
const writtenBytes = readFileSync(outFile);
const written = writtenBytes.toString("utf8");
if (written !== TEXT) {
  console.error("entry.txt does not match the text");
  process.exit(1);
}
if ([...written].length < 1 || [...written].length > 400) {
  console.error("entry.txt must be 1-400 characters");
  process.exit(1);
}
// Byte-level confirmation: the file must hold exactly the text's
// UTF-8 bytes — no BOM, no trailing newline, no extra whitespace
// — so the judge sees two lines and nothing else.
const expectedBytes = Buffer.from(TEXT, "utf8");
if (!writtenBytes.equals(expectedBytes)) {
  console.error("entry.txt bytes do not match the text exactly");
  process.exit(1);
}
