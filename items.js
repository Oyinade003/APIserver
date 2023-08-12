const http = require('http');
const fs = require('fs');
const path = require('path');

const itemsDbPath = path.join(__dirname, 'items.json');
let itemsdb = [];

const PORT = 4000
const HOST_NAME = 'localhost';

const requestHandler = function (req, res) {
    res.setHeader("Content-Type", "application/json");

    if (req.url === '/items' && req.method === 'GET') {
        getAllItems(req, res);
    } else if(req.url === '/items/:id' && req.method === 'GET') {
        getOneItem(req, res);
    } else if (req.url === '/items' && req.method === 'POST') {
        createItem(req, res);
    } else if (req.url === '/items' && req.method === 'PUT') {
        updateBook(req, res);
    } else if (req.url.startsWith('/items') && req.method === 'DELETE') {
        deleteBook(req, res);
    } else {
        res.writeHead(404);
        res.end('Action not Supported');
    }

}

//Create Item
const createItem = function (req, res) {
    const body = [];

    req.on('data', (chunk) => {
        body.push(chunk);
    });

    req.on('end', () => {
        const parsedBody = Buffer.concat(body).toString();
        const newItem = JSON.parse(parsedBody);

        const lastItem = itemsDB[itemsDB.length - 1];
        const lastItemId = lastItem.id;
        newItem.id = lastItemId + 1;

        booksDB.push(newItem);
        fs.writeFile(itemsDbPath, JSON.stringify(itemsDB), (err) => {
            if (err) {
                console.log(err);
                res.writeHead(500);
                res.end(JSON.stringify({
                    message: 'Internal Server Error.'
                }));
            }

            res.end(JSON.stringify(newItem));
        });
    });
}

//GET ALL ITEMS
const getAllItems = function (req, res) {
    fs.readFile(itemsDbPath, "utf8", (err, items)=> {
        if (err){
            console.log(err)
            res.writeHead(400)
            res.end("An error occured")
        }

        res.end(items);
    })
}

// GET ONE ITEM
const getOneItem = function (req, res) {
    fs.readFile(itemsDbPath, "utf8", (err, item) => {
        if (err) {
            res.writeHead(500);
            res.end(JSON.stringify({
                message: 'Internal Server Error'
            }));
            return;
        }

        const itemIdToFind = req.params.itemid;
        
        const Item = itemsDB.find(item => item.id === itemIdToFind);

        if (!Item) {
            res.writeHead(404);
            res.end(JSON.stringify({
                message: 'Item not found'
            }));
            return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(Item);
    });
}


//UPDATE ITEM
const editBook = function (req, res) {
    const body = [];

    req.on('data', (chunk) => {
        body.push(chunk);
    });

    req.on('end', () => {
        const parsedBody = Buffer.concat(body).toString();
        const itemToEdit = JSON.parse(parsedBody);

        const itemIndex = itemsDB.findIndex((item) => {
            return book.id === itemToEdit.id;
        });
        if (bookIndex === -1) {
            res.writeHead(404);
            res.end(JSON.stringify({
                message: 'Item not found'
            }));
            return;
        }

        itemsDB[itemIndex] = {...itemsDB[itemIndex], ...itemToEdit}; 

        fs.writeFile(itemsDbPath, JSON.stringify(itemsDB), (err) => {
            if (err) {
                console.log(err);
                res.writeHead(500);
                res.end(JSON.stringify({
                    message: 'Internal Server Error.'
                }));
            }

            res.end(JSON.stringify(itemToEdit));
        });
    });
}

//DELETE ITEM
const deleteItem = function (req, res) {
    const itemId = req.url.split('/')[2];

    const itemIndex = itemsDB.findIndex((item) => {
        return item.id === parseInt(itemId);
    })

    if (itemIndex === -1) {
        res.writeHead(404);
        res.end(JSON.stringify({
            message: 'Item not found'
        }));

        return;
    }

    itemsDB.splice(itemIndex, 1); 

    fs.writeFile(itemsDbPath, JSON.stringify(itemsDB), (err) => {
        if (err) {
            console.log(err);
            res.writeHead(500);
            res.end(JSON.stringify({
                message: 'Internal Server Error.'
            }));
        }

        res.end(JSON.stringify({
            message: 'Item deleted'
        }));
    });

}

const server = http.createServer(requestHandler)
server.listen(PORT, HOST_NAME, () => {
    itemsdb = JSON.parse(fs.readFileSync(itemsDbPath, 'utf8'));
    console.log('itemsdb')
    console.log(`Server is listening on ${HOST_NAME}:${PORT}`)
})