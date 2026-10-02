# claude-mods

A marketplace of [Claude Code mods](https://code.claude.com/docs/en/plugins/mods/overview):
plugins of function hooks that run inside Claude Code (panes, commands, tool call rules).
Requires Claude Code v2.1.287 or later.

## Install

```sh
claude plugin marketplace add kguidonimartins/claude-mods
claude plugin install grill-answer@claude-mods
```

In a session that is already open, run `/reload-plugins` to load it without restarting.

A mod runs with your permissions. To see what one does before you install it:

```sh
claude plugin validate plugins/grill-answer
```

## Mods

| Mod | What it does |
|---|---|
| [`grill-answer`](plugins/grill-answer) | A pane for answering the question rounds of the `grilling` / `grill-me` skill |

## License

[MIT](LICENSE)
