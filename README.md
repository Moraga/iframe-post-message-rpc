
# User preferences


## O que é?

É um ambiente compartilhado para armazenamento e consulta de dados de usuários em páginas, domínios e parceiros.


## O que armazenamos?

- Preferências
- Histórico de navegação


## Quais vantagens comparado a outros mecanismos?

- Disponível em domínios e subdominios e parceiros
- Dados armazenados num formato para ocupar menos espaços e dificultar visualização
- Protegido por estratégia de domínio e serialização. Difícil acesso para o usuário
- Se o usuário apagar dados de navegação em uma página com o script o histórico é remontado
- No limite, dados antigos são apagados automaticamente antes de inserir novos
- Execução de recursos assíncronos entre cliente e servidor (possibilita criação de eventos)


## Dados

Informações gerais sobre consulta e armazenamento das informações.


### Preferências do usuário

Dados de preferência originam da capturados automática e envio por API. Esses dados persistem enquanto a navegação do usuário existir (apagar histórico de navegação) ou não forem apagados via API.

#### Captura de preferências

O script captura automaticamente informações do usuário nos cookies, local storage, session storage, variáveis javascript e markup da página. Assim que capturado, os dados são enviados para fonte de armazenamento.

Algumas dessas preferências:

GID: Identificador criado pelo Google (Analytics, Adsense).


#### Envio de preferências

Envio de dados via API.

```js
ifrrpc('pref', ['color', 'blue']);
```

#### Consulta de preferências

Consulta de dados via API.

```js
ifrrpc('pref', ['color'], value => {
    console.log(value);
})
```

#### Remoção de preferências

Para apagar dados use a API e passe null como valor para a preferência.

```js
ifrrpc('pref', ['color', null])
```

OBS: Preferências capturadas automaticamente são recapturadas em todo acesso.
Se estiver tentando apagar uma dessas preferências pode ser que ele seja recriada.


### Preferência com valor múltiplo

Uma preferência pode ter múltiplos valores, o usuário pode ter mais de um time ou carros favoritos.

```js
// consultando uma preferência com múltiplos valores
ifrrpc('array', ['vehicles'], vehicles => {
    // vehicles sempre será um array, existindo ou não
});

// adicionar um ou mais itens a uma preferência
ifrrpc('push', ['vehicles', 'Audi A3', 'Mercedes C180'], vehicles => {});

// remover um item específico
ifrrpc('pop', ['vehicles', 'Mercedes C180'], vehicles => {});

// remover último item
ifrrpc('pop', ['vehicles'], vehicles => {});

// verificar se um item existe
ifrrpc('has', ['vehicles', 'Audi A3'], yes => {
    // yes : boolean
});

// toggle: adicionar se não existe ou então remover
ifrrpc('toggle', ['vehicles', 'Audi A3'], added => {
    // added : boolean
});
```


### Histórico de navegação

O script envia automaticamente uma referência da página acessada (ID, metatag canonical, URL) para fonte de armazenamento onde são acrescentados mais informações, como data e hora.

Ao sair da página o script envia um último sinal para a fonte para contabilizar o tempo de permanência e encerrar a sessão.

Há um limite de 200 registros para o histórico de navegação. Ao exceder esse limite os dados mais antigos são apagados automaticamente ao inserir novos, somente essa condição, os dados não expiram por si só.


## Projeto

Funcionamento e manutenção.


### Como é divido

O projeto frontend é divido em duas partes:

- Script front: deve ser adicionado em todas as páginas
- Script back: incorporado automaticamente pelo script front


### Responsabilidades

- Script front é responsável coletar informações, receber dados (e sugestões) e decidir em usar ou ignorar e por toda interação na página do usuário, como modificações na UI, adição ou remoção de componentes, etc.

- Script back é responsável pelo armazenamento e processamento de dados e integrações com APIs/backends.

#### Coleta de preferências e histório e persistência da informação

O script front faz parte da navegação principal do usuário, portanto tem acesso as informações como cookies, histórico, local storage e acesso a métodos, funções e variáveis de demais scripts. Então nesse ponto é onde reunimos todas as informações relevantes e enviamos para o script back via iframe postMessage.

O script back é incorporado pelo front via iframe. Ele recebe as informações e decide como armazena-las, onde e como torná-las acessíveis. Por ser um iframe, podemos hospedá-lo em outro domínio (é recomendado) para persistir as informações, mesmo que o usuário limpe os dados de navegação da página principal que está acessando.

A comunicação entre os scripts é feito de forma assíncrona via postMessage. Todos os métodos disponíveis tanto no front quanto no back devem ser declarados no objeto "rpc" para manter o protocolo de comunicação entre ambos.


#### Consulta de preferências e histórico

O script front consulta informações de preferências e histórico no script back via método rpc. A execução acontece de forma assíncrona e o script front deve ter um método definido em seu objeto "rpc" para receber essas informações.


#### Interações avançadas

A comunição entre os scripts front e back são assíncronas e pode ser acionadas a qualquer momento por qualquer umas das partes.

O script back pode, dadas suas regras, resolver internamente ou executar APIs externas para buscar conteúdos personalizado e enviar para o script front.


## Observações gerais

- Para o script back hospedado em outro domínio funcionar é necessário habilitar CORS.
