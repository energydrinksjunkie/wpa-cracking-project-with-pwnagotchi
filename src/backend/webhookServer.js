const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 4000;

// Middleware za parsiranje JSON tela
app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
    const { result } = req.body;

    // Obradi podatke iz webhooka
    console.log(`Received result: ${result}`);

    res.status(200).send('Received');
});

app.listen(port, () => {
    console.log(`Webhook server is running on port ${port}`);
});