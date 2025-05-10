const fs = require('fs');
const express = require('express');

const {v4:uuidv4}=require('uuid');
const bcrypt=require('bcrypt');
const app = express();
const session=require("express-session");
app.use(session(
    {
        secret:"my-secret-key",
        resave:false,
        saveUninitialized:false,
        cookie:{maxAge:3600000}

    }
));




app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect('/signup.html');
  });
  

//Auth status
app.get('/check-auth',(req,res)=>{
  if(req.session.userId){
    return res.json({ authenticated: true });
  }
  return res.json({ authenticated: false });
})


// Auth requests
app.post('/signUp',async(req,res)=>{
    const saltRounds = 10;
    let data;
try{
    data=JSON.parse(fs.readFileSync('db.json','utf-8'));

}catch(err){
    console.error("Error reading db.json:", err);
    return res.status(500).send("Internal server error");
}

const {username , password}=req.body;

let userExists=data.users?.some((u)=>u.name===username);

if(userExists){
   return res.status(400).send("Username taken");
}

const hashedPass=await bcrypt.hash(password,saltRounds);
data.users=data.users || [];

const newUser={id:uuidv4(),name:username,password:hashedPass,createdAt: new Date().toISOString()};
data.users.push(newUser);

fs.writeFileSync('db.json',JSON.stringify(data,null,2));
res.status(201).send("Sign up successful");



});

// Auth requests
app.post('/login',async(req,res)=>{
    const saltRounds = 10;
    let data;
try{
    data=JSON.parse(fs.readFileSync('db.json','utf-8'));

}catch(err){
    console.error("Error reading db.json:", err);
    return res.status(500).send("Internal server error");
}

const {username,password}=req.body;

const user=data.users?.find((u)=>u.name===username);
if(!user){
  return res.status(400).send("Invalid username or password");
}

const isMatch = await bcrypt.compare(password, user.password);
if(!isMatch){
    return res.status(400).send("Invalid username or password");
}
req.session.userId=user.id;
res.status(200).json({redirect:"index.html"});

});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send("Error logging out");
      }
      res.redirect('/login.html'); 
    });
  });
  


app.get('/api/todos', (req, res) => {
    if(!req.session.userId){
        return res.status(401).send("Not authenticated");
    }
    let data;
    try {
        data = JSON.parse(fs.readFileSync('db.json', 'utf-8'));
    } catch (err) {
        console.error("Error reading db.json:", err);
        return res.status(500).send("Internal server error");
    }
   const userTodos= data.todos.filter((todo)=>todo.userId===req.session.userId);
    res.json(userTodos);
});

app.post('/api/todos', (req, res) => {
    if(!req.session.userId){
        return res.status(401).send("Not authenticated");
    }
    let data;
    try {
        data = JSON.parse(fs.readFileSync('db.json', 'utf8'));
    } catch (err) {
        console.error("Error reading db.json:", err);
        return res.status(500).send("Internal server error");
    }

   

        const { title, completed, createdAt } = req.body;
        const newTodo = {
            id: uuidv4(),
            title,
            completed,
            createdAt,
            userId: req.session.userId 
        };
        data.todos = data.todos || [];
        data.todos.push(newTodo);
        
   

    try {
        fs.writeFileSync('db.json', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error writing to db.json:", err);
        return res.status(500).send("Internal server error");
    }

    res.status(201).json(newTodo);
});

app.delete('/api/todos/:id', (req, res) => {
    if(!req.session.userId){
        return res.status(401).send("Not Authenticated");
    }
    const id = req.params.id;
    let data;

    try {
        data = JSON.parse(fs.readFileSync('db.json', 'utf8'));
    } catch (err) {
        console.error("Error reading db.json:", err);
        return res.status(500).send("Internal server error");
    }
    
    const todoToDelete = data.todos.find(todo => todo.id === id);
    if (!todoToDelete) {
        return res.status(404).send("Todo not found");
    }

    if (todoToDelete.userId !== req.session.userId) {
        return res.status(403).send("You are not authorized to delete this todo");
    }

    data.todos = data.todos.filter(todo => todo.id !== id);

    try {
        fs.writeFileSync('db.json', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error writing to db.json:", err);
        return res.status(500).send("Internal server error");
    }

    res.status(204).send();
});

app.patch('/api/todos/:id', (req, res) => {
    const id = req.params.id;
    const { title, completed } = req.body;

    // Check if the user is authenticated
    if (!req.session.userId) {
        return res.status(401).send("Not authenticated");
    }

    let data;
    try {
        // Read data from db.json
        data = JSON.parse(fs.readFileSync('db.json', 'utf8'));
    } catch (err) {
        console.error("Error reading db.json:", err);
        return res.status(500).send("Internal server error");
    }

    // Find the todo by ID
    const todoToEdit = data.todos.find((todo) => todo.id === id);
    
    // If the todo is not found
    if (!todoToEdit) {
        return res.status(404).send("Todo not found");
    }

    // Check if the todo belongs to the logged-in user
    if (todoToEdit.userId !== req.session.userId) {
        return res.status(403).send("You are not authorized to edit this todo");
    }

    // Update the todo fields
    if (typeof title !== 'undefined') {
        todoToEdit.title = title;
    }
    if (typeof completed !== 'undefined') {
        todoToEdit.completed = completed;
    }

    try {
        // Save the updated data back to db.json
        fs.writeFileSync('db.json', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error writing to db.json:", err);
        return res.status(500).send("Internal server error");
    }

    // Respond with the updated todo
    res.status(200).json(todoToEdit);
});


app.listen(3000, () => {
    console.log('Server running on port 3000');
});
