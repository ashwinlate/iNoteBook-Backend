const connectToMongo = require('./db');
const express = require('express')

connectToMongo();
const app = express()
const port = process.env.PORT || 5000
var cors = require('cors')


app.use(cors())
app.use(express.json())

//Available Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes',require('./routes/note'))
app.use('/ping', (req, res) => {
    try {
        res.status(201).json({ 
            success : true,
            ping : "pong"
        })
    } catch (err) {
        console.log(err.message);
    }
})

app.listen(port, () => {
    console.log(`iNotebook backend listening at` + port);
})