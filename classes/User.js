class User {
    constructor(nome, senha, email) {
        this.nome = nome;
        this.senha = senha;
        this.email = email;
    };

    getNome() {
        return this.nome;
    }
    getSenha() {
        return this.senha;
    }
    getEmail() {
        return this.email;
    }
    setNome(nome) {
        this.nome = nome;
    }
    setSenha(senha) {
        this.senha = senha;
    }
    setEmail(email) {
        this.email = email;
    }
    toString() {
        return {nome: this.nome, email: this.email, senha: this.senha}
    }
}

module.exports = User;