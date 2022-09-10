// * ~~~~~~~~~~~~~~~~~~~ Api ~~~~~~~~~~~~~~~~~~~

const Api = (() => {
    const baseUrl = "http://localhost:3000";
    const todopath = "todos";

    const getTodos = () =>
        fetch([baseUrl, todopath].join("/")).then((response) =>
        response.json()
        );

    const deleteTodo = (id) =>
        fetch([baseUrl, todopath, id].join("/"), {
            method: "DELETE",
        });

    const addTodo = (todo) =>
        fetch([baseUrl, todopath].join("/"),{
            method:"POST",
            body: JSON.stringify(todo),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        }).then((response) => response.json());

    const updateTodoStatus = (id, title, completed) =>{

        const todo = {
            title: title,
            completed: completed
        }

        fetch([baseUrl, todopath, id].join("/"), {
            method: "PUT",
            body: JSON.stringify(todo),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        }).then((response) => response.json());
    };

    const updateTodoContents = (id, title, completed) => {
        const todo = {
            title: title,
            completed: completed
        }

        fetch([baseUrl, todopath, id].join("/"), {
            method: "PUT",
            body: JSON.stringify(todo),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        }).then((response) => response.json());
    }


    return {
        getTodos,
        deleteTodo,
        addTodo,
        updateTodoStatus,
        updateTodoContents
    };

})();


// * ~~~~~~~~~~~~~~~~~~~ View ~~~~~~~~~~~~~~~~~~~

const View = (() => {

    const pending = {
        pendingtaskcontainer:".pendingtask_container",
        inputbox:".todolist_input",
        submitbutton:".submitbtn",
        movebutton:".pendingmovebtn"
    };


    const completed = {
        completedtaskcontainer:".completedtask_container",

    }



    const render = (ele, tmp) => {
        
            ele.innerHTML = tmp;

    };

    const creatependingTmp = (arr) => {
        let pendingtmp = '';
        arr.forEach((todo) => {
            // console.log(todo);

            pendingtmp += `
            <li id="${todo.id}">
                <span class="pendingtitle" id="${todo.id}">${todo.title}</span>
                <input style="display:none"/>
                <button class="pendingeditbtn" id="${todo.id}">edit</button>
                <button class="pendingdeletebtn" id="${todo.id}">delete</button>
                <button class="pendingmovebtn" id="${todo.id}">move</button>
            </li>
        `;
        });
        return pendingtmp;
    };

    const createcompeletedTmp = (arr) => {
        let completedtmp = '';
        arr.forEach((todo) => {
            completedtmp += `
            <li id="${todo.id}">
                <button class="compmovebtn" id="${todo.id}">move</button>
                <span class="comptitle" id="${todo.id}">${todo.title}</span>
                <input style="display:none"/>
                <button class="compeditbtn" id="${todo.id}">edit</button>
                <button class="compdeletebtn" id="${todo.id}">delete</button>
                
            </li>
        `;
        });
        return completedtmp;
    }


    return {
        render,
        creatependingTmp,
        createcompeletedTmp,
        pending,
        completed

    };
})();


// * ~~~~~~~~~~~~~~~~~~~ Model ~~~~~~~~~~~~~~~~~~~

const Model = ((api, view) => {
    const {getTodos, deleteTodo, addTodo, updateTodoStatus, updateTodoContents} = api;

    class Todo {
        constructor(title) {
            this.title = title;
            this.completed = false;
        }
    }

    class State {
        #todolist = [];

        get todolist() {
            return this.#todolist;
        }

        set todolist(newtodolist) {
            this.#todolist = newtodolist;

            const pendingcontainer = document.querySelector(view.pending.pendingtaskcontainer);
            const completedcontainer = document.querySelector(view.completed.completedtaskcontainer);

            const pendingtmp = view.creatependingTmp(this.#todolist.filter(item => item.completed == false));
            const completedtmp = view.createcompeletedTmp(this.#todolist.filter(item => item.completed == true));



            view.render(pendingcontainer, pendingtmp);
            view.render(completedcontainer, completedtmp);
        }
    }



    return {
        getTodos,
        deleteTodo,
        addTodo,
        updateTodoStatus,
        updateTodoContents,
        State,
        Todo,
    };

})(Api, View);


// * ~~~~~~~~~~~~~~~~~~~ Controller ~~~~~~~~~~~~~~~~~~~

const Controller = ((model, view) => {
    const state = new model.State();

    const deleteTodo = () => {
		const pendingcontainer = document.querySelector(
			view.pending.pendingtaskcontainer
		);
        
		pendingcontainer.addEventListener("click", (event) => {
			if (event.target.className === "pendingdeletebtn") {

				state.todolist = state.todolist.filter(
					(todo) => +todo.id !== +event.target.id
				);
				model.deleteTodo(event.target.id);
			}
		});

        
        const completedcontainer = document.querySelector(
            view.completed.completedtaskcontainer
        );

        completedcontainer.addEventListener("click", (event) => {
            if (event.target.className === "compdeletebtn") {
                state.todolist = state.todolist.filter(
                    (todo) => +todo.id !== +event.target.id
                );
                model.deleteTodo(event.target.id);
            }
        });
	};


    const addTodo = () => {
		const submitbutton = document.querySelector(view.pending.submitbutton);
		submitbutton.addEventListener("click", (event) => {
            
			if (event.target.className === "submitbtn") {
                const newinput = document.querySelector(".todolist_input").value;
				const todo = new model.Todo(newinput);
                model.addTodo(todo).then(todofromBE => {
                state.todolist = [todofromBE, ...state.todolist];
        });
        event.target.value = '';
			}
		});
	};

    const moveToCompleted = () => {
        const pendingtaskcontainer = document.querySelector(view.pending.pendingtaskcontainer);
        
        pendingtaskcontainer.addEventListener("click", (event) => {

            if (event.target.className === "pendingmovebtn") {
                const id = event.target.id;
                const title = document.getElementById(id).children[0].innerHTML;
                model.updateTodoStatus(id, title, true).then(init);
            }
            
        });
    };

    const moveToPending = () => {
        const completedtaskcontainer =document.querySelector(view.completed.completedtaskcontainer);
        completedtaskcontainer.addEventListener("click", (event) => {

            if (event.target.className === "compmovebtn") {
                const id = event.target.id;
                const title = document.getElementById(id).children[1].innerHTML;
                model.updateTodoStatus(id, title, false).then(init);            
            }
        });
    };


    const editPending = () => {
        const pendingtaskcontainer = document.querySelector(view.pending.pendingtaskcontainer);

        pendingtaskcontainer.addEventListener("click", (event) => {

            const id = event.target.id;
            let input = document.getElementById(id).children[1];

            let isEditing = false;

            if (event.target.className === "pendingeditbtn" && isEditing == false) {
                
                document.getElementById(id).children[0].style.display = "none";
                
                input.display = "inline";
                input.value = document.getElementById(id).children[0].innerHTML;
                isEditing = true
                console.log(document.getElementById(id).children[0].innerHTML);
            }

            if(event.target.className === "pendingeditbtn" && isEditing == true) {
    
                isEditing = false;               
                input.display = "none";
                model.updateTodoContents(id, input.value, false).then(init);
                
            }

            // console.log(isEditing);

        })
    }





    const init = () => {
		model.getTodos().then((todos) => {
			state.todolist = todos.reverse();
		}); 
    };


    const bootstrap = () => {
        init();
        deleteTodo();
        addTodo();
        moveToCompleted();
        moveToPending();
        editPending();
    };

    return { bootstrap };
})(Model, View);

Controller.bootstrap();


