const express = require("express");//importando a biblioteca express para variavel express
const { Client } = require("pg");//importando um pedaço {clien} da biblioteca pg 
const cors = require("cors");//importando a biblioteca cors para variavel cors
const bodyparser = require("body-parser");//importando a biblioteca body-parser para variavel bodyparser
const config = require("./config");//importando o arquivo .config na variavel config

//inicialização
const app = express();//começa a api
app.use(express.json());//saida api codificada json
app.use(cors());//permite conexoes locais
app.use(bodyparser.json());//entrada da api codificada json

//TESTAR A CONECTION
var conString = config.urlConnection;
var client = new Client(conString);//client esta recebendo a funcao Client(da library pg) - ligacao com suario e senha no pg
client.connect((err) => {//conecta o usuario com o pg 
    if (err) {// se erro
        return console.error('Não foi possível conectar ao banco.', err);//ERRO DE CONECTION AO SERVER
    }

    client.query('SELECT NOW()', (err, result) => {//manda comando(de requisitar data/hora) SQL ja que pg é em SQL
        if (err) {//se der erro
            return console.error('Erro ao executar a query.', err);
        }
        console.log(result.rows[0]);//se nao retorna o dado(data/hora) -  dev verificar
    });
});

//API REQUISICOES
app.get("/", (req, res) => {//qndo chamarem(get) a api no endereço raiz(/) manda p variaveis da arrow function  req(require) -> resp(response) 
    console.log("Response ok.");// -  dev verificar
    res.send("Ok – Servidor disponível."); //para o requisitor o status da requisicao
});

//as demais rotas ... aqui ...  fixed routes(/...) ou unfixed  route(/.../..)

app.get("/usuarios", (req, res) => {
    try {
        client.query("SELECT * FROM Usuarios", (err, result) => {//manda comando(requisicao (get)) para o SQL (pg)
            if (err) {
                return console.error("Erro ao executar a qryde SELECT", err);
            }
            res.send(result.rows);//resposta recebe o resultado do get
            console.log("Rota: get usuarios");
        });

    } catch (error) {
        console.log(error);
    }
});


app.get("/usuarios/:id", (req, res) => {//: nao fixa (: não fixa pelo id)
    try {
        console.log("Rota: usuarios/" + req.params.id);
        client.query(
            "SELECT * FROM Usuarios WHERE id = $1", [req.params.id],//$1 = variavel
            (err, result) => {
                if (err) {
                    res.send("O dado: " + req.params.id + " informado não é valido!");
                    return console.error("Erro ao executar a qry de SELECT id", err);
                } else {
                    if (result.rowCount == 0) {
                        res.send("Não há usuario para o codigo: " + req.params.id);
                    } else {
                        res.send(result.rows[0]);
                        //console.log(result);
                    }
                }

            }
        );
    } catch (error) {
        console.log(error);
    }
});

app.delete("/usuarios/:id", (req, res) => {
    try {
        console.log("Rota: delete/" + req.params.id);//req.param.id = os id´s delete/2...
        client.query(
            "DELETE FROM Usuarios WHERE id = $1", [req.params.id], (err, result) => {
                if (err) {
                    res.send("O dado: " + req.params.id + " informado não é valido!");
                    return console.error("Erro ao executar a qry de DELETE", err);
                } else {
                    if (result.rowCount == 0) {
                        res.send("Não há usuario para o codigo: " + req.params.id);//por send
                        res.status(404).json({ info: "Registro não encontrado." });//por json status()
                    } else {
                        res.status(200).json({ info: `Registro excluído. Código: ${req.params.id}` });
                    }
                }
                console.log(result);
            }
        );
    } catch (error) {
        console.log(error);
    }
});

app.post("/usuarios", (req, res) => {
    try {
        console.log("Alguém enviou um post com os dados:", req.body);//criando novo user database -> json
        const { nome, email, altura, peso } = req.body;
        client.query(
            "INSERT INTO Usuarios (nome, email, altura, peso) VALUES ($1, $2,$3, $4) RETURNING * ", [nome, email, altura, peso],// * = tudo
            (err, result) => {
                if (err) {
                    res.send("Algum dado: " + req.body + " informado não é valido!");
                    return console.error("Erro ao executar a qry de INSERT", err);
                }
                const { id } = result.rows[0];//retorna apenas o id
                res.setHeader("id", `${id}`);
                res.status(201).json(result.rows[0]);
                console.log(result);
                res.send("Usuario criado com sucesso" + result.rows[0]);
            }
        );
    } catch (erro) {
        console.error(erro);
    }
});


app.put("/usuarios/:id", (req, res) => {
    try {
        console.log("Alguém enviou um update com os dados:", req.body);//reqbody acessa o corpo do database tabela
        const id = req.params.id;
        const { nome, email, altura, peso } = req.body;
        client.query(
            "UPDATE Usuarios SET nome=$1, email=$2, altura=$3, peso=$4 WHERE id =$5 ",
            [nome, email, altura, peso, id],
            (err, result) => {
                if (err) {
                    res.send("Algum dado: " + req.body + " informado não é valido!");
                    return console.error("Erro ao executar a qry de UPDATE", err);
                } else {
                    res.setHeader("id", id);//como o send mas header
                    res.status(202).json({ "identificador": id });
                    console.log(result);
                    res.send("O usuario: " + req.params.id + "foi atualizado" );
                }
            }
        );
    } catch (erro) {
        console.error(erro);
    }
});


app.listen(config.port, () => console.log("Servidor funcionando na porta " + config.port)//a api esta escutando escutando a port ->(escutar=get,delete,...) utimo
);
module.exports = app;