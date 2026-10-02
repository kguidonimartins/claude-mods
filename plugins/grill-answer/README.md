# grill-answer

A pane for answering the question rounds of the `grilling` skill (and its `/grill-me` shortcut).

When one of Claude's replies holds questions in the skill's format, the mod opens a pane with
each question, its recommendation and an answer field. On send, your answers become your next
prompt:

```
**Q1** - <title>: <your answer>

**Q2** - <title>: I accept the recommendation
```

## Recognized format

```
❓ **Q1** - **<title>**: <body>

➡️ <recommendation>

---
```

Only the main conversation is read, never a subagent's. A reply without this format opens nothing.

## Usage

| Key / command | Action |
|---|---|
| `ctrl+x tab` or click | gives the pane the keyboard (the cursor goes to the first pending field) |
| `Enter` in a field | saves the answer and jumps to the next pending field |
| `Tab` / arrows | walk between fields and buttons |
| `1`–`9` | accepts question N's recommendation (with the focus on a button) |
| `a` | accepts the recommendation of every pending question |
| `s` | sends the answers |
| `Esc` | hands the keyboard back to the prompt |
| `/grill-answer` | reopens the pane for the last round |

A pane that opens on its own only shows from 144 columns; below that, use `/grill-answer`.
Text typed without `Enter` is sent too. Mobile has no text field: only the accept buttons.

## Develop

```sh
claude --plugin-dir plugins/grill-answer   # loads it for this session only
claude plugin validate plugins/grill-answer
claude plugin test plugins/grill-answer
tsc -p plugins/grill-answer                # once the mod has loaded at least once
```
