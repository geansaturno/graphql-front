const listaAlunos = document.querySelector('#listaAlunos')

const GraphQl = {
    endpoint: 'https://us1.prisma.sh/gean-saturno-goncalves-b57c02/prisma-test/dev',
    exec: function(query, variables) {
        return fetch(GraphQl.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({query: GraphQl.cleanQuery(query), variables})
        }).then(response => response.json())
    },
    cleanQuery(query) {
        return query.replace(/\t|\n/g,'').replace(/\s{2,}/g, ' ').trim()
    }
}

const Aluno = {
    lista: [],
    buscar: function() {
        const query = `
            query{
                alunoes{
                    id
                    nomeCompleto
                    idade
                }
            }
        `;

        return GraphQl.exec(query)
    },
    criar: function(novoAluno) {
        const query = `
            mutation($nomeCompleto: String!, $idade: Int!){
                createAluno(data:{
                    nomeCompleto: $nomeCompleto
                    idade: $idade
                })
                {
                    id
                    nomeCompleto
                    idade
                }
            }
        `
        return GraphQl.exec(query, novoAluno)
    },
    apagar: function(id) {
        const query = `
            mutation($id: ID!){
                deleteAluno(where:{
                    id: $id
                })
                {
                    id
                }
            }
        `;

        return GraphQl.exec(query, {id})
    }
}

const Template = {
    iniciar: function() {
        Aluno.buscar().then(({data: {alunoes}}) => {
            Aluno.lista = alunoes;
            Template.listarAlunos();
        })
    },
    listarAlunos: function() {
        let html = '';
        Aluno.lista.forEach(aluno => {
            html += `
                <li>
                    Nome: ${aluno.nomeCompleto} - Idade : ${aluno.idade}
                    <button onclick="Template.apagarAluno('${aluno.id}')">X</button>
                </li>
            `
        })
        listaAlunos.innerHTML = html;
    },
    inserirAlunoLista: function(novoAluno) {
        Aluno.lista.push(novoAluno)
        Template.listarAlunos()
    },
    criarAluno: function() {
        event.preventDefault();
        const form = document.forms.novoAluno
        const novoAluno = {
            nomeCompleto: form.nomeCompleto.value,
            idade: parseInt(form.idade.value)
        }

        form.nomeCompleto.value = ''
        form.idade.value = ''

        Aluno.criar(novoAluno).then(({data: {createAluno}}) => {
            Template.inserirAlunoLista(createAluno)
        })
    },
    removerAlunoLista: function(id) {
        const alunoIndex = Aluno.lista.findIndex(aluno => aluno.id === id)
        if(alunoIndex >= 0){
            Aluno.lista.splice(alunoIndex, 1);
            Template.listarAlunos();
        }
    },
    apagarAluno: function(id) {
        Aluno.apagar(id).then(()=>{
            Template.removerAlunoLista(id);
        })
    }
}

Template.iniciar()