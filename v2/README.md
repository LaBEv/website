# LaBEv v2

Abra [`index.html`](index.html) no navegador para visualizar o site localmente. Use o Node.js 24 para atualizar a lista de pessoas ou a galeria após editar os arquivos na sua cópia local.

## Preencher um perfil

1. No fim de **People**, clique em **Update your profile** e digite a senha do laboratório. O formulário abre em uma nova aba tanto no GitHub Pages quanto ao abrir `index.html` localmente no navegador.
2. Preencha o nome e os campos que quiser publicar, selecione uma foto em JPEG, PNG ou WebP se tiver e salve o **Perfil** como arquivo `.txt`. Para acompanhar o idioma do site, preencha os textos em inglês. O formulário também abre um `.txt` existente para atualizar seus dados.
3. Envie o `.txt` baixado ao responsável pelo site. Quando a foto é escolhida no formulário, ela já vai dentro desse arquivo.

Para trocar a senha, altere `profileAccessPassword` em [`assets/site.js`](assets/site.js). A senha é uma etapa de confirmação no navegador e fica visível no código-fonte. O formulário também pode ser aberto diretamente ou compartilhado como arquivo. [Formulário de perfil](People/editar-perfil.html)

Quem preferir um editor de texto pode preencher o [`modelo-perfil.txt`](People/modelo-perfil.txt), manter os nomes dos campos e salvar em UTF-8. Só o nome da pessoa é obrigatório. Nesse caso, coloque a foto em `People/Photos/` e preencha o campo `Foto` com o nome do arquivo, incluindo a extensão, por exemplo `retrato.jpg`. Use a mesma grafia e capitalização nos dois lugares. Os campos preenchidos e a foto ficam visíveis no site.

## Organizar os perfis

Coloque cada `.txt` na pasta em que a pessoa deve aparecer.

| Pasta | Seção no site |
| --- | --- |
| `People/Current Lab Members/` | Current Lab Members |
| `People/Alumni-Visitors/` | Alumni/Visitors |
| `People/Collaborators/` | Collaborators |

Para atualizar um perfil, substitua o `.txt` existente. Para mudar a seção, mova o arquivo para a pasta de destino. A foto acompanha o perfil ou continua na pasta compartilhada `People/Photos/`, conforme a forma de preenchimento. Os arquivos de cada pasta são lidos por ordem de nome. Os prefixos numéricos dos perfis iniciais mantêm a ordem da lista do laboratório.

Para atualizar a visualização local, abra um terminal em `v2` e execute o comando abaixo. Depois, recarregue `index.html`.

```sh
node scripts/build-people.mjs
```

O script gera `People/people-data.js` a partir dos `.txt`. Para editar o conteúdo de Research ou Contact, use `index.html` e as imagens em `assets/`.

## Adicionar fotos à galeria pelo GitHub

Abra a pasta [`Group Photos`](Group%20Photos) do repositório, dentro de `v2` se ela estiver em uma subpasta. Cada foto tem um arquivo `.txt` com o mesmo nome antes da extensão.

1. Em **Add file → Upload files**, envie a foto. Por exemplo, `03-reuniao-do-lab.jpg`. A galeria aceita `.jpg`, `.jpeg`, `.png` e `.webp`. [Como enviar um arquivo](https://docs.github.com/pt/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)
2. Na mesma pasta, escolha **Add file → Create new file** e dê ao arquivo o nome `03-reuniao-do-lab.txt`. No conteúdo, escreva apenas a legenda. Você pode incluir o crédito da foto no próprio texto. [Como criar um arquivo](https://docs.github.com/pt/repositories/working-with-files/managing-files/creating-new-files)
3. Salve as alterações em **Commit changes**. Quando a foto e a legenda estiverem na branch padrão, o GitHub Actions publica o par. Os dois arquivos podem ser salvos em commits separados.

Se o GitHub pedir que você crie uma branch, adicione a foto e a legenda nessa branch e abra um **Pull Request** para a branch padrão.

Para corrigir uma legenda, abra o `.txt` e clique no lápis para editar. Para retirar uma foto da galeria, remova a foto e a legenda. A galeria segue a ordem dos nomes dos arquivos, por isso `01-`, `02-` e `03-` ajudam a definir a sequência.

Para conferir alterações na sua cópia local, execute o comando abaixo em `v2` e recarregue `index.html`.

```sh
node scripts/build-group-photos.mjs
```

## Publicar no GitHub Pages

1. Se este for um repositório dedicado ao novo site, coloque o conteúdo de `v2` na raiz do repositório, incluindo a pasta oculta `.github`. Se preferir manter `v2` como subpasta do repositório, coloque também uma cópia de [`pages.yml`](.github/workflows/pages.yml) no caminho `.github/workflows/pages.yml` da raiz.
2. No GitHub, abra **Settings → Pages → Build and deployment** e selecione **GitHub Actions** em **Source**. [Instruções do GitHub](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow)
3. Envie os arquivos à branch padrão do repositório ou execute **Publicar LaBEv no GitHub Pages** na aba **Actions**, selecionando essa branch. O workflow atualiza a lista de pessoas e a galeria e publica os arquivos estáticos. O endereço aparece no resultado da execução.

Após a configuração inicial, basta registrar e enviar as mudanças de perfis, fotos ou legendas à branch padrão. A publicação roda novamente a cada envio. O formulário também pode ser compartilhado pelo endereço `People/editar-perfil.html` dentro do site publicado.

## Crédito da figura de Research

`assets/research-tree.webp` reproduz a Figura 4 de Congrains et al. (2023), convertida para WebP e redimensionada. [Artigo original](https://doi.org/10.1111/eva.13589) · [Licença CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

## Fotos da abertura

As fotos e seus créditos estão em `index.html`. A primeira fica em `hero-slides` e as demais em `hero-photo-list`. As imagens foram redimensionadas e convertidas para WebP. O recorte se adapta ao tamanho da tela e a foto de Gerson Tavares é apresentada espelhada.

- *Anastrepha fraterculus* de Paulo Lanzetta, usada na versão anterior do site do LaBEv. [Crédito na Revista Cultivar](https://revistacultivar.com.br/fitossanidade/anastrepha-fraterculus) · [Imagem do site original](https://labev.github.io/website/images/bg.jpg)
- *Anastrepha fraterculus*, de Gerson Tavares. [Imagem original](https://commons.wikimedia.org/wiki/File:Anastrepha-fraterculus.jpg) · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- Foto de abertura de *Anastrepha ludens*, de Jack Dykinga, USDA ARS. [Imagem original](https://www.flickr.com/photos/usdagov/8456922792) · [Domínio público](https://www.ars.usda.gov/oc/images/copyright/)
- *Anastrepha fraterculus* em Cobiça, Espírito Santo, de Luan Faitanin Volpato. [Imagem original](https://commons.wikimedia.org/wiki/File:Mosca-das-frutas.jpg) · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- Pitanga (*Eugenia uniflora*) fotografada em Minas Gerais por EvaldoResende. [Imagem original](https://commons.wikimedia.org/wiki/File:Pitanga_Eugenia_uniflora.jpg) · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- Laranjeiras com frutos maduros em Avaré, São Paulo, de José Reynaldo da Fonseca. [Imagem original](https://commons.wikimedia.org/wiki/File:Laranja_(Avar%C3%A9)_REFON_1.JPG) · [CC BY 2.5](https://creativecommons.org/licenses/by/2.5/)
