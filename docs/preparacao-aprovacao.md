# Preparação para solicitar revisão do AdSense

Atualização final de 06/11/2026: propriedade verificada por metatag e revisão efetivamente enviada com autorização do titular. O painel confirmou `Revisão solicitada` e status `Preparando`. Ver [registro de envio](adsense-submission-2026-11-06.md). As notas de pedido pendente abaixo são históricas. Isso não significa aprovação nem ativação de anúncios.

Site: https://jornaldocinema.com.br

## Atualização de 6 de novembro de 2026

O titular aprovou publicar os três guias com a identificação transparente de assistência de IA e revisão por Matheus Moura. Publicação confirmada em `/guias/` e sitemap. Foram executados oito testes automatizados e verificação visual na VPS em 320, 390 e 1440 pixels. Nenhum script de publicidade foi ativado.

O AdSense foi consultado na conta `cmdev072@gmail.com`, publisher `pub-7037572686437222`. Na lista observada havia Turismo Hoje e Correio da Manhã, mas não Jornal do Cinema. Nenhuma configuração desses dois domínios foi alterada. O pedido do Jornal do Cinema ainda não foi enviado nesta atualização; a conclusão depende do cadastro/verificação do novo domínio e do fluxo efetivamente apresentado pelo painel. Três guias aprovados não garantem aprovação, e as pendências de direitos, identificação e consentimento abaixo não são automaticamente resolvidas pela publicação.

Os parágrafos seguintes preservam o diagnóstico de 4 de novembro como histórico, não o inventário atualizado.

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
