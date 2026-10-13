# Lab 2: Library Management API - HE173589

Hoàng Minh Việt - HE173589

# Run
1. Start MongoDB (service on 127.0.0.1:27017).
2. `npm install`
3. `npm run seed`   
4. `npm start`      

## Endpoints
- /api/books      GET, GET/:id, POST, PUT/:id, DELETE/:id
- /api/members    GET, GET/:id, POST, PUT/:id, DELETE/:id
- /api/loans      GET, GET/:id, POST, GET /member/:memberId, PUT /:id/return
