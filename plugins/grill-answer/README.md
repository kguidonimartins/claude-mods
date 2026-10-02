# grill-answer

Painel para responder as rodadas de perguntas da skill `grilling` (e do atalho `/grill-me`).

Quando uma resposta do Claude traz perguntas no formato da skill, o mod abre um painel com
cada pergunta, a recomendação e um campo de resposta. Ao enviar, as respostas viram o seu
próximo prompt:

```
**Q1** - <título>: <sua resposta>

**Q2** - <título>: aceito a recomendação
```

## Formato reconhecido

```
❓ **Q1** - **<título>**: <corpo>

➡️ <recomendação>

---
```

Só a conversa principal é lida (subagentes não). Uma resposta sem esse formato não abre nada.

## Uso

| Tecla / comando | Ação |
|---|---|
| `ctrl+x tab` ou clique | dá o teclado ao painel (o cursor vai ao primeiro campo pendente) |
| `Enter` num campo | grava a resposta e pula para o próximo campo pendente |
| `Tab` / setas | anda entre campos e botões |
| `1`–`9` | aceita a recomendação da pergunta N (com o foco num botão) |
| `a` | aceita a recomendação de todas as pendentes |
| `e` | envia as respostas |
| `Esc` | devolve o teclado ao prompt |
| `/grill-answer` | reabre o painel da última rodada |

O painel aberto sem pedido só aparece a partir de 144 colunas; abaixo disso, use
`/grill-answer`. Texto digitado sem `Enter` também é enviado. No mobile não há campo de
texto: só os botões de aceitar.

## Desenvolver

```sh
claude --plugin-dir plugins/grill-answer   # carrega só nesta sessão
claude plugin validate plugins/grill-answer
claude plugin test plugins/grill-answer
tsc -p plugins/grill-answer                # depois que o mod carregou uma vez
```
