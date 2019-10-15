const express = require('express')
const app = express()
const PORT = 3000

app.use('/src', express.static(__dirname+'/src'))
app.use('/styles', express.static(__dirname+'/styles'))

app.get('/', (req, res) => {
    res.sendFile(__dirname+'/index.html')
})

app.listen(PORT, () => {
    console.log('Listening on port ' + PORT)
})