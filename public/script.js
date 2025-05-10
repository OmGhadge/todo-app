

const media=window.matchMedia("(width<700px)");
const sideBar=document.querySelector('.sidebar');
media.addEventListener('change',(e)=>{updateNavbar(e)})

window.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/check-auth', { credentials: 'include' });
        const data = await res.json();

        if (data.authenticated) {
            document.getElementById('loginBtn').style.display = 'none';
            document.getElementById('loginBtnSB').style.display = 'none'
            document.getElementById('logoutBtn').style.display = 'block';
            document.getElementById('logoutBtnSB').style.display='block';
            render(); 
            updateProgressBar(); 
        } else {
            window.location.href = 'signup.html'; 
        }
    } catch (err) {
        console.error('Error checking auth:', err);
        showErrorMessage("Failed to verify authentication.");
    }
});

async function logout(){
    const res=await fetch('/logout',{
        method:'GET',
        credentials:'include',
        headers:{'Content-Type':'application/json'}
    });
    if (res.ok) {
        window.location.href = 'login.html'; 
    } else {
        console.error('Error logging out');
    }
}

document.getElementById("logoutBtnSB").addEventListener('click', (e)=>{
    e.preventDefault();
   logout();
})

document.getElementById('logoutBtn').addEventListener('click', (e)=>{
e.preventDefault();
logout();
});

document.addEventListener('keydown',(e)=>{
    if(e.key==='Escape'){
        const sideBar = document.querySelector('.sidebar');
        if (sideBar.style.display === 'flex') {
            hideSideBar();
        }
    }
});

function updateNavbar(e){
var isMobile=e.matches;
if(isMobile){
sideBar.setAttribute('inert','');
}
else{
    sideBar.removeAttribute('inert');
}
}



updateNavbar(media);

function showSideBar(){
    const sideBar=document.querySelector('.sidebar');
    const sideBarUL=document.querySelector('.sidebarul');
    const overlay=document.querySelector('#overlay');
    const menuBtn = document.querySelector('.menu-icon-btn');

    sideBar.style.display='flex';
    sideBarUL.style.display='flex';
    overlay.style.display='block';

    menuBtn.setAttribute('aria-expanded','true');
    sideBar.removeAttribute('inert');

    const focusable = sideBar.querySelector('a, button, input, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();
}

function hideSideBar(){
    const sideBar=document.querySelector('.sidebar');
    const sideBarUL=document.querySelector('.sidebarul');
    const overlay=document.querySelector('#overlay');
    const menuBtn = document.querySelector('.menu-icon-btn');

   if(sideBar.contains(document.activeElement)){
    document.activeElement.blur();
   }




   if (menuBtn) {
     menuBtn.focus();
   }
 
    sideBar.style.display='none';
    sideBarUL.style.display='none';
    overlay.style.display='none';


    menuBtn.setAttribute('aria-expanded','false');
    sideBar.setAttribute('inert','');

   
}

function showErrorMessage(msg){
    const errorMsg=document.querySelector("#error-message");
    errorMsg.style.display='block';
    errorMsg.innerText=msg;
   }
   function hideErrorMessage() {
     const errorMessageDiv = document.getElementById('error-message');
     errorMessageDiv.style.display = 'none';
 }
    

     function delTodo(id){
         fetch(`api/todos/${id}`,{
             method:'Delete',
             credentials:'include'
         }).then(()=>{
             const el=document.querySelector(`#todo-${id}`)
             if(el)el.remove();
         })
         .catch((error) => {
             console.error('Error deleting todo:', error);
             showErrorMessage("Failed to delete todo. Please try again later.");
         });
        }

     function addTodo(){
         // this will just add the  inp value to the array and will be called by onclick
         let inp=document.querySelector("#inp1");
        if(!inp.value.trim()){
         showErrorMessage("Todo cannot be empty!");
         return;
        }
        hideErrorMessage();
       
         fetch('/api/todos',{
             method: 'POST',
             headers: {'Content-Type' : 'application/json'},
             credentials:'include',
             body : JSON.stringify({title:inp.value,completed:false,createdAt:new Date()})
         }).then((response)=>{
             if(!response.ok){
                 throw new Error('Failed to add todo');
              
             }
             return response.json();
       
         })
         .then((newTodo)=>{
             inp.value = "";
             const todoElement = createTodoComponent(newTodo);
             document.querySelector("#todos").prepend(todoElement);
          
         })
         .catch((error)=>{
             console.error('Error:', error);
             showErrorMessage("Failed to add todo. Please try again later.");
         })
   
     }

    function editTodo(todo,div,titleSpan){
    const updateInp=document.createElement("input");
       updateInp.type="text";
       updateInp.value=todo.title;
       
      const save_Btn=document.createElement("button");
      save_Btn.innerText="Save";
      save_Btn.onclick=()=>{
         const newTitle=updateInp.value.trim();
         if(!newTitle){
             showErrorMessage("Updated title cannot be empty!");
             return;
         }
         hideErrorMessage();
         fetch(`api/todos/${todo.id}`,{
             method:'PATCH',
             headers:{'Content-Type':'application/json'},
             credentials:'include',
             body:JSON.stringify({title:newTitle})
         }).then(()=>{
             titleSpan.textContent = newTitle;
             div.removeChild(updateInp);
             div.removeChild(save_Btn);
         })
           .catch((error)=>{
             console.log();
             console.error('Error updating todo:', error);
             showErrorMessage("Failed to update todo. Please try again later.");
           });
      };
      div.appendChild(updateInp);
      div.appendChild(save_Btn);

     }


     function createTodoComponent(todo){
     // This will create a todo componene cons of div butt etc from the arry element
     const template=document.getElementById("todo-template");
     const clone=template.content.cloneNode(true);
     const todoDiv = clone.querySelector(".todo");
     todoDiv.id = `todo-${todo.id}`;  // <-- Add this line
     
  
     const checkbox = clone.querySelector(".todo-checkbox");
     const titleSpan = clone.querySelector(".todo-title");
     const editBtn = clone.querySelector(".edit-btn");
     const delBtn = clone.querySelector(".del-btn");
     const customLabel = clone.querySelector(".customCheckbox");

     
     

     titleSpan.textContent = todo.title;

     
 
      
   
     checkbox.id=`check${todo.id}`;
     checkbox.checked = todo.completed;  
     customLabel.setAttribute('for',`check${todo.id}`)
    
    
     if (todo.completed) {
         titleSpan.style.textDecoration = "line-through";
     }
 


     checkbox.onchange = () => {
         fetch(`/api/todos/${todo.id}`, {
             method: 'PATCH',
             headers: { 'Content-Type': 'application/json' },
             credentials:'include',
             body: JSON.stringify({ completed: checkbox.checked })
         })
         .then(()=>{
             titleSpan.style.textDecoration = checkbox.checked ? "line-through" : "none";
           updateProgressBar();
         })
         .catch((error)=>{
             console.error("Error updating checkbox:", error);
             showErrorMessage("Failed to update status.");
         });
         
        
     };

     delBtn.onclick = () => delTodo(todo.id);
     editBtn.onclick = () => editTodo(todo, todoDiv,titleSpan);
 
     return todoDiv;

     }
 

 

   

     function updateProgressBar() {
        fetch('/api/todos', {
            method: 'GET'
        })
        .then(res => res.json())
        .then(data => {
            const totalCount = data.length;
            let completedCount = 0;
    
            for (let i = 0; i < totalCount; i++) {
                if (data[i].completed) {
                    completedCount += 1;
                }
            }
            
    
            let completedPerc = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
            completedPerc = completedPerc.toFixed(1); // e.g., 75.0%
             
            console.log(`totalCount: ${totalCount}`);
            console.log(`checkedCount: ${completedCount}`);
            console.log(`completedPerc: ${completedPerc}`)

            const pgPct = document.querySelector('#pgPct');
            if (pgPct) {
                pgPct.innerText = `${completedPerc}%`;
            }
            const progressFill = document.querySelector('.progressFill');
            if (progressFill) progressFill.style.width = `${completedPerc}%`;
        })
        .catch(error => console.error('Error fetching todos:', error));
    }
    


     function render(){

         fetch('/api/todos',{
            credentials:'include'
         })
             .then(res=>res.json())
             .then(data=>{
                 data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); 
                 document.querySelector("#todos").innerHTML="";
                 for(let i=0;i<data.length;i++){
                     let element=createTodoComponent(data[i]);
                     document.querySelector("#todos").appendChild(element);
                 }
                 })
                 .catch((error)=>{
                     console.error('Error fetching todos:', error);
                     showErrorMessage("Failed to load todos. Please try again later.");
                 });
 
  
     }
  