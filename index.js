    
    const serverless = require('serverless-http');
    const express = require('express');
    const UserService = require('./service/UserService');
    const ProductService = require('./service/ProductService');
    const OrderService = require('./service/OrderService');


    const app = express();
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    //user
    app.post('/createuser', async(req, res) => {
        userService = new UserService();
        response = await userService.register(req.body)
        console.log(response)
        res.send(response);
    });
    app.get('/userlogin', async(req, res) => {
        let email = req.query.email
        let pwd = req.query.pwd

        let userService = new UserService();
        response = await userService.login(email,pwd)
        console.log(response)
        res.send(response);
    });

    
    //product
    app.post('/createeditproduct', async(req, res) => {
        let productService = new ProductService();
        let response = await productService.add(req.body.data)
        console.log(response)
        res.send(response);
    });

    //delete product
    app.delete('/deleteproduct', async(req, res) => {
        let email = req.query.email
        let item_id = req.query.item_id
        let productService = new ProductService();
        response = await productService.delete(email,item_id)
        console.log(response)
        res.send(response);
    });


     //get all product
     app.get('/getalliproducts', async(req, res) => {
         let email = req.query.email
         let tab = req.query.tab
        productService = new ProductService();
        response = await productService.getAll(email,tab)
        console.log(response)
        res.send(response);
    });

    // https://v2bbyu7y28.execute-api.us-east-1.amazonaws.com/stage1/orderitem/
// let req = {"data":{"email":"sunil.kamble@forcepoint.com","item_id":"113","order_status":"ordered","quantity":"2"}};
app.post('/orderitem', async(req, res) => {
    orderService = new OrderService();
    let request = { "supplier_email": req.body.email, "item_id": req.body.item_id, "order_status": req.body.order_status, "quantity": req.body.quantity };
    let response = await orderService.orderitem(request);
    console.log(response);
    res.send(response);
});
// https://950za1oi60.execute-api.us-east-1.amazonaws.com/stage1/getordereditems?email=sunil.kamble%40forcepoint.com
app.get('/getordereditems', async(req, res) => {
    orderService = new OrderService();
    let response = await orderService.getordereditems(req.query.email);
    console.log(response);
    res.send(response);
});




    //app.listen(3000, () => console.log(`Listening on: 3000`));
    module.exports.handler = serverless(app);

