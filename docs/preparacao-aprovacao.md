# Preparação para solicitar revisão do AdSense

Site: https://jornaldocinema.com.br
Revisão técnica: 4 de novembro de 2026. Nenhuma solicitação enviada ao Google.

## Resultado atual

As dez verificações públicas automatizadas passaram na VPS: páginas principais e institucionais, identificação do publisher, ads.txt, robots, sitemap, resposta 404 e consulta ao feed específico do jornal. Isso não verifica a situação da conta Google, aprovação editorial, direitos ou conformidade jurídica.

O inventário consultado contém 25 registros, dois confirmados como cinema. Os dois são republicações do Correio da Manhã; nenhum possui canonical de produção própria do Jornal do Cinema. Os [três novos guias](editorial/README.md) permanecem rascunhos fora do site.

## Ordem das próximas ações

1. Revisar os três guias com um editor responsável, aprovar a redação final e definir autoria. Verificar exemplos, referências e eventuais imagens antes da publicação. Não publicar apenas para cumprir uma contagem: qualidade e utilidade são os critérios.
2. Ampliar a seleção relevante e atual de cinema. Não usar notícias econômicas ou políticas como crítica de cinema. Não apresentar programação vencida como serviço atual.
3. Confirmar a identificação real do responsável pela operação, as informações institucionais e os direitos de republicação. Não inferir razão social, equipe ou licenças a partir do CNPJ ou dos nomes dos arquivos.
4. No AdSense da conta correta, adicionar/verificar `jornaldocinema.com.br` usando a metatag ou ads.txt já instalados. Conferir todas as tarefas de configuração da conta. Dados financeiros, identidade e aceite de termos devem ser concluídos pelo titular.
5. Preparar em Privacidade e mensagens a solução de consentimento aplicável ao público, incluindo CMP certificada quando exigida para anúncios no EEE, Reino Unido e Suíça. Vincular a política real do jornal e revisar os textos antes de publicar a mensagem. Não ativar anúncios enquanto essa configuração estiver pendente.
6. Atualizar Privacidade/Cookies para descrever a configuração efetivamente ativada. Um banner próprio que apenas simula aceite não substitui a CMP.
7. Rodar novamente a checagem na VPS e conferir o site em celular. Somente então decidir enviar a revisão na área Sites do AdSense. Não há garantia de aprovação ou prazo de análise prometido.

## Verificação repetível

No checkout isolado da VPS, com Node instalado no contêiner:

```sh
node scripts/readiness-vps.mjs
```

O resultado é salvo em `review-output/readiness.json`. `technicalChecksPassed` indica apenas testes técnicos. `submissionReady` permanece `false`: não é promovido automaticamente por quantidade de artigos, presença de ads.txt ou conclusão dos testes. O relatório exige decisão humana sobre os itens editoriais, direitos, identidade e conta.

## Referências oficiais

- [Páginas prontas para o AdSense](https://support.google.com/adsense/answer/7299563?hl=pt-BR).
- [Qualificação](https://support.google.com/adsense/answer/9724?hl=pt-BR).
- [Conteúdo replicado](https://support.google.com/publisherpolicies/answer/11190248?hl=pt-BR).
- [Conectar o site](https://support.google.com/adsense/answer/7584263?hl=pt-BR).
- [Requisitos de consentimento para editores](https://support.google.com/adsense/answer/13554116?hl=pt-BR).
