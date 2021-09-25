const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const app = express()

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.use(express.static('public'))

// ###########################################################################################

var items = []
    // Set up mongoose
mongoose.connect('mongodb://localhost:27017/todoDb')
const todoSchema = new mongoose.Schema({
    name: String
})

const listSchema = new mongoose.Schema({
    name: String,
    todos: [todoSchema]
})
const List = new mongoose.model('List', listSchema)
const Todo = mongoose.model('Todo', todoSchema)

// const read = new Todo({
//     name: 'read'
// })
// const eat = new Todo({
//     name: 'eat'
// })
// const run = new Todo({
//     name: 'run'
// })
// const defaultTodo = [read, eat, run]
// Todo.insertMany(defaultTodo, (err, docs) => {
//     if (err) {
//         console.log(err)
//     } else {
//         console.log('Adding Successfull')
//     }
// })

// get date 
var today = new Date()
var options = {
    day: 'numeric',
    month: 'long'
}
var day = today.toLocaleDateString('en-US', options)

app.get('/', (req, res) => {
    items = []
        // trace data from mongodb
    Todo.find({}, (err, foundTodo) => {
        if (err) {
            console.log(err)
        } else {
            console.log(foundTodo)
                // foundTodo.forEach((todo) => {
                //     items.push(todo)
                // })
            res.render('list', { kindOfDay: day, newTodo: foundTodo })
        }
    })
})

app.get('/:customListName', (req, res) => {
    //Create custom todo list with route parameter
    const customListName = req.params.customListName

    const newList = new List({
        name: customListName,
        items: []
    })
    List.findOne({ name: customListName }, (err, docs) => {
        if (err) {
            newList.save()
            res.render('list', { kindOfDay: customListName, newTodo: items })
        } else {
            List.findOne({ name: customListName }, (err, docs) => {
                res.render('list', { kindOfDay: docs.name, newTodo: docs.todos })
                console.log(docs)
                console.log(docs.todos)
            })
        }
    })

})

app.post('/', (req, res) => {
    const item = req.body.todo
        // adding new item from web
    const newItem = new Todo({
        name: item
    })

    // items.push(item)
    console.log(req.body)
    if (req.body.list != day) {
        List.findOne({ name: req.body.list }, (err, docs) => {
            docs.todos.push(newItem)
            docs.save()
            res.redirect('/')
        })
    } else {
        newItem.save()
        res.redirect('/')
    }


})

app.post('/delete', (req, res) => {
    Todo.deleteOne({ name: req.body.checkbox }, (err) => {
        if (err) {
            console.log(err)
        } else {
            console.log('Deleting Complete')
            res.redirect('/')
        }
    })
})