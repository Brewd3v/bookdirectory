const express = require('express')
const fs = require('fs')
const Joi = require('joi')
const bodyParser = require('body-parser')


const app = express()
app.use(bodyParser.json())


//Validate request body
const schema = Joi.object({
    title: Joi.string().required(),
    isbn: Joi.string().required()
})

const schema_deleting = Joi.object({
    isbn: Joi.string().required()
})


function getBooks(){
    const books = fs.readFileSync('books.json', 'utf8')
    return JSON.parse(books)
}


app.get('/', async (req, res) => {
    res.send("This is a simple books API")
})


app.get('/books', async (req, res) => {
    const books  = await getBooks()
    res.send(books)
})

app.get('/book/:isbn', async (req, res) =>{
    const books  = await getBooks()
    const book = books.filter(book => book.isbn === req.params.isbn)
    res.send(book)
})



app.post('/addbook/', async (req, res) =>{
    const { error, value } = schema.validate(req.body)

    if(error){
        return res.status(400).json(error.details[0].message)
    }


    const books  = await getBooks()
    const book = books.filter(book => book.isbn === req.body.isbn)

    if(book.length > 0){
        return res.send(`Book with ISBN of ${req.body.isbn} already exists`)
    }

    const newBooks = [...books, req.body]
    await fs.writeFileSync('books.json', JSON.stringify(newBooks))


    res.json(req.body)
})


app.delete('/deletebook', async (req, res) => {
    const { error, value } = schema_deleting.validate(req.body)

    if(error){
        return res.status(400).json(error.details[0].message)
    }

    const books  = await getBooks()
    const book = books.filter(book => book.isbn === req.body.isbn)

    console.log(book)

    if(book.length <= 0){
        return res.send(`Book with ISBN of ${req.body.isbn} not found`)
    }

    const updatedbooks = books.filter(book => book.isbn != req.body.isbn)

    await fs.writeFileSync('books.json', JSON.stringify(updatedbooks))

    res.json(book)

})



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`App listerning on port ${PORT}...`)
})