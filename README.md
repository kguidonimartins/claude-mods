# claude-mods

Marketplace de [mods do Claude Code](https://code.claude.com/docs/en/plugins/mods/overview):
plugins de *function hooks* que rodam dentro do Claude Code (painéis, comandos, regras de
tool call). Requer Claude Code v2.1.287 ou mais novo.

## Instalar

```sh
claude plugin marketplace add kguidonimartins/claude-mods
claude plugin install grill-answer@claude-mods
```

Numa sessão aberta, rode `/reload-plugins` para carregar sem reiniciar.

Um mod roda com as suas permissões. Para ver o que ele faz antes de instalar:

```sh
claude plugin validate plugins/grill-answer
```

## Mods

| Mod | O que faz |
|---|---|
| [`grill-answer`](plugins/grill-answer) | Painel para responder as rodadas de perguntas da skill `grilling` / `grill-me` |
