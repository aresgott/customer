# 🟨 Node.js task


[x] CRUD operations for customers (Create, Read, Update, Delete) by email;

[x] Login and signup operations for customers;
- I add route for get user info

[x] Roles USER and ADMIN;

[x] Access token;

[x] Refresh token;

[x] Restrict access to get customers operation from unauthenticated users;
- For fun i add extra route for public access

[x] Restrict access to delete customer and update customer operations from unauthenticated users and customers with USER role;

[x] Ability to verify customer's account after signup with activation code;
- Activation code print in console (another idea was about using Mailgun)

[x] I Added some unit tests and integration tests, but because of time issues and my vacation I couldn't do full coverage, it is just an example :(

## Installation

```bash
npm install

npx prisma generate
```

## Local database

```bash
# Setup local postgres
docker run --name recruitment-task -e POSTGRES_PASSWORD=docker -p 5432:5432 -d postgres:11.16

#create .env file with your local database credentials

# Run migration
npx prisma migrate dev

# Run db seed
npx prisma db seed
```

## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

```

## Address for Swagger
```bash
http://localhost:8080/api/

```

## For test
```bash
npm run test:watch --customer
npm run test:e2e -- customer 
npm run test:coverage 

```
