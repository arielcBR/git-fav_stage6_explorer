import { GithubUser } from "./GithubUser.js"

// lógica dos dados
export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.table = document.querySelector('table')
        this.tbody = this.root.querySelector("table tbody")
        this.load()
        this.onAdd()
        this.emptyState()
    }

    async add(userLogin) {
        try {

            let userExist = this.users.find(user => user.login.toLowerCase() == userLogin.toLowerCase())

            if (userExist) 
                throw new Error('Usuário já consta na lista de favoritos!')
    
            if (userLogin == '')
                throw new Error('Digite um usuário válido')
            
            const githubUser = await GithubUser.search(userLogin)

            if (githubUser.login == undefined) throw new Error('Usuário não encontrado')
    
            this.users = [githubUser, ...this.users]
            this.update()
            
        } catch (error) {
            alert(error.message)
        }
    }

    save() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.users))
    }

    load() {
        this.users = JSON.parse(localStorage.getItem('@github-favorites:')) || []
        this.createTfoot()
    }

    delete(userToDelete) {
        userToDelete = userToDelete.replace('/', '')
        const filteredUsers = this.users.filter(user => user.login != userToDelete)

        this.users = filteredUsers
        this.update()
    }

    onAdd() {
        const addButton = document.querySelector('#addButton')

        addButton.addEventListener('click', (event) => {
            event.preventDefault()
            const inputSearch = document.querySelector('#inputSearch').value
            let userLogin = inputSearch.toLowerCase()
            this.add(userLogin)
        })
    }

}

// criar a visualização do html

export class FavoritesView extends Favorites{
    constructor(root) {
        super(root)
        this.update()
    }

    update() {
        this.emptyState()
        this.removeAllTr()
        this.users.forEach(user => {
            const row = this.createRow(user)
            this.tbody.appendChild(row)

            row.querySelector('.remove').onclick = () => {
                const isOk = confirm('Tem certeza que deseja deletar?')

                if (isOk) {
                    this.delete(row.querySelector('.userLogin').textContent)
                }
            }
        })

        this.save()
    }

    createRow(user) {
        const { login, name, avatar_url, public_repos, followers } = user
        const tr = document.createElement('tr')

        tr.innerHTML = `
            <td>
                <a href="https://github.com/${login}" target="_blank">
                    <img src="${avatar_url}" alt="Imagem de ${name}">
                </a>
                <div>
                    <p class="userName">${name}</p>
                    <p class="userLogin">/${login}</p>
                </div>
            </td>
            <td>${public_repos}</td>
            <td>${followers}</td>
            <td><a class="remove" href="#">Remover</a></td>    
        `
        return tr
    }

    removeAllTr() {
        this.tbody.querySelectorAll('tr')
            .forEach((tr) => {
                tr.remove()
            })
    }

    emptyState() {
        const isEmpty = this.users.length
        const tfootExist = this.table.querySelector('tfoot')

        if (!isEmpty && !tfootExist) 
            this.createTfoot()

        else if (isEmpty && tfootExist)
            this.removeTfoot()       
    }

    removeTfoot() {
        this.table.querySelector('tfoot').remove()
    }

    createTfoot() {
        const tfoot = document.createElement('tfoot')
        const td = document.createElement('td')

        td.colSpan = '4'
        td.innerHTML = `
            <div class="emptyTable">
                <img src="./images/star.svg" alt="imagem de uma estrela">
                    <p>Nenhum favorito ainda</p>
            </div>
        `
        tfoot.appendChild(td)
        this.table.appendChild(tfoot)
    }

}
