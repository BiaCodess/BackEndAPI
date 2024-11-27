const dotenv = require('dotenv');//a constante dotenv esta recebendo um import
dotenv.config();//metodo config = verifica se existe um arquivo .env perdo  (if-leia/else leia-var ambiente)

//.env
const {
PORT, //9082
pgConnection//usuario/senha do servido(local)
} = process.env;

//servidor
module.exports = {//require port exporta(nao local)
port: PORT,//9082
urlConnection: pgConnection//conexao do banco
}