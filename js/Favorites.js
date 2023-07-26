// lógica dos dados
export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.tbody = this.root.querySelector("table tbody")
        this.load()
        this.onAdd()
        
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
                <img src="${avatar_url}" alt="Imagem de ${name}">
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
}

export class GithubUser {
    static search(username) {
        const endpoint = `https://api.github.com/users/${username}`
        
        return fetch(endpoint)
            .then(data => data.json())
            .then(({ login, name, public_repos, followers, avatar_url }) =>
                ({
                    login,
                    name,
                    public_repos,
                    followers,
                    avatar_url
                })
            )
    }
}