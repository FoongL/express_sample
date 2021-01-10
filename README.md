# **Foong's Crypto.com Ops Team Back End Engineering Coding Challenge**
Welcomes to my submission for the Back End Engineering Coding Challenge.

This document will walk you through how the creation, details, and personal reflection towards my implementation of this challenge. The sections will be as follows:

1. Tech Stack of choice
1. Database architecture
1. How to start the application
1. Available routes and how to use them
1. Personal reflections


## 1. Tech Stack

This project was written and developed with Node, with an Express framework and is connected to a PostgreSQL database using Knex to connect them together. 

This project was also Dockerized for your convenience and can be easily run if you have both Docker and Docker-compose on your local machine

## 2. Database Architecture

Two tables were created to make this project to run.

### **Account**:

This table holds details of each account, such as the owner's name, their account number, account's hashed pin number (used for authentication, more on this later) and also a snapshot of the current balance of the account. This table acts like a traditional "users" table. Hence it was assumed for the sake of this exercise that each "user" can only have one account. Finally, is_admin wil indicate whether or not a user is an "admin", certain functions will only be granted access to accounts with this set as "true".

### **Transactions**:

This table holds details of each transaction that will change the balance of an account. The main transactions available (withdraw, deposit & transfer) each will be stored in "type" along with an admin only function (fix). This table also stores the status of each transaction. if a transaction succeeds, a "SUCCESSFUL" type will be placed there, and "FAILED" status for failed transactions. Finally a "FIXED" status will be updated to the transaction to indicate that an admin had gone into add a fix transaction that targets this (details to be further explained in routes sections)

### Database Diagram:
![DBDesign](/images/cryptoDb.PNG)


## 3.How to start up this application

As mentioned in an earlier Section, this app has been Dockerized and can be started easily if you have Docker and Docker-compose on your local machine. Other wise this would required your local machine to have both Node Postgres to start.

### **Starting with Docker**
Start by cloning the repo down from Github with the following command
```
$ git clone https://github.com/FoongL/CryptoTest.git && cd CryptoTest
```
Next you'll need to build out your DOcker containers locally
```
$ docker-compose up -d --build
```
This may take some time as it would need to build containers for the app based off a Node image and for the DB based on a postgres image. 

next you'll need to run the migrations and seeds with have been tied into the script ```npm run db```, this can be done with the following:

```
$ docker-compose exec crypto-api npm run db
```

Once up and running, you can now test it with the following:

```
$ docker-compose exec crypto-api npm test
```
A series of 36 tests will run to ensure each route is working as intended

Now you can go down below and start testing out the provided routes on ```localhost:3000```

future uses, simply run:
```
$ docker-compose up -d
```


### **Starting with local Node and Postgres**
Again we start with cloning down the Repo off Github
```
$ git clone https://github.com/FoongL/CryptoTest.git && cd CryptoTest
```

Then we install all necessary packages:
```
npm install
```

now copy out the .env.sample file and rename is as .env, please rename all variables marked with {{RENAME ME}} to variable names that suite your local machine

for reference, my .env files looks like the following

```
PORT=3000
PG_HOST=127.0.0.1
PG_DB_NAME=crypto
PG_PASSWORD=postgres
PG_USER=postgres
PG_PORT=5432
```

Next open up your postgres and create a new database with the same name you saved under ```PG_DB_NAME```

Now you're ready to run the migrations! in your terminal type in the following command

``` 
npm run db
```

you can also test the server with ```npm test```, otherwise you can now start the server with the following command:
```
npm start
```

The APIs will not be available on ```localhost:3000``` (unless you changed the PORT in .env file)

## 4. Available routes and how to use them

There are three routers available for in this service:
1. Account Routers
1. Transaction Routers
1. Admin Routers

### **Account Router**

Prefix:  ```/account```

### 1. Create Account:
POST ```/account/create```

This route will create a new regular bank account for user, and a system generated PIN will be created for the user, and just like a normal bank, a PIN cannot be re-retrieved, a PIN can only be reset by an admin account (more on this later). Please take note on given account and pin, as these will be used to verify all other available routes that require this


Auth: None

Body:
```json
{
    "fName":{{INSERT FIRST NAME HERE}},
    "lName":{{INSERT LAST NAME HERE}}
}
```

Response:
```json
{
    "accountDetails": {
        "account": 3,
        "fName": "first name",
        "lName": "last name",
        "balance": "0.00",
        "pin": "2198"
    }
}
```
### 2. Get Account Transaction History:

GET ```/account/history```

This Route will allow you to view your own transaction history (granted you have made some), optional query parameters are also provided in order to filter the type of transactions you wish to view, a list of optional queries are shown below

Auth in Headers:
```json
{   
    "account": account number,
    "pin": pin number
}
```

Optional query params:
* start: (mm/dd/yyyy) From when you want to find transactions
* end: (mm/dd/yyy) Till when you want to find transactions
* type: ['DEPOSIT','WITHDRAW','TRANSFER','FIX'] Type of transaction you want to get (default you get all)
* status: ['SUCCESSFUL', 'FAILED', 'FIXED'] Status of transaction you want to get (default you get all)

Response(sample):
```json
{
    "transactionHistory": [
        {
            "id": 3,
            "account_id": 4,
            "type": "DEPOSIT",
            "amount": "50.00",
            "status": "SUCCESSFUL",
            "receiver_account_id": null,
            "target_transaction": null,
            "description": "Sample Transaction",
            "created_at": "2021-01-10T05:20:48.227Z",
            "updated_at": "2021-01-10T05:20:48.227Z"
        },
        {
            "id": 2,
            "account_id": 4,
            "type": "DEPOSIT",
            "amount": "50.00",
            "status": "SUCCESSFUL",
            "receiver_account_id": null,
            "target_transaction": null,
            "description": "Sample Transaction",
            "created_at": "2021-01-10T05:20:45.362Z",
            "updated_at": "2021-01-10T05:20:45.362Z"
        }
    ],
    "totalTransaction": 2
}
```


### 3. Get Account Current Balance:

GET ```/account/balance```
This route will simply show the current balance you have in your account

Auth in Headers:
```json
{   
    "account": account number,
    "pin": pin number
}
```

Response(sample):
```json
{
    "account": "4",
    "balance": "150.00"
}
```

### **Transaction Router**

Prefix:  ```/transaction```

### 1. Deposit Money into your account:

POST ```/transaction/deposit```

This route allows users to make deposits into their accounts, only positive numbers are accepted as parameters to deposit money.

This query to the DB is built using transactions to ensure that multiple queries are implemented (insert transaction record and update account balance) following ACID properties.

Auth in Headers:
```json
{   
    "account": account number,
    "pin": pin number
}
```

Body: *note: Only accept positive numbers and decimals as params
```json
{
    "amount":{{INSERT AMOUNT HERE}},
}
```

Response(sample):
```json
{
    "transaction": {
        "transaction_id": 5,
        "type": "DEPOSIT",
        "account": 2,
        "status": "SUCCESSFUL",
        "description": "none"
    },
    "newBalance": "300.00"
}
```

### 2. Withdraw Money into your account:

POST ```/transaction/withdraw```

This route allows users to make withdraw into their accounts, only positive numbers are accepted as parameters to withdraw money.

For this challenge, it was assumed users may not "over draw" from their accounts.

This query to the DB is built using transactions to ensure that multiple queries are implemented (insert transaction record and update account balance) following ACID properties.

Auth in Headers:
```json
{   
    "account": account number,
    "pin": pin number
}
```

Body: *note: Only accept positive numbers and decimals as params
```json
{
    "amount":{{INSERT AMOUNT HERE}},
}
```

Response(sample):
```json
{
    "transaction": {
        "transaction_id": 6,
        "type": "WITHDRAW",
        "account": 2,
        "status": "SUCCESSFUL",
        "description": "none"
    },
    "newBalance": "200.00"
}
```

### 3. Transfer Money between two accounts:

POST ```/transaction/transfer```

This route allows users to make transfer money to another account, only positive numbers are accepted as parameters to transfer money.

It is assumed that a user may not transfer more money than what exists in their account. Additionally, this will also return error if you try to send money to your own account, and will also error if the account you're transferring to does not exist.

This query to the DB is built using transactions to ensure that multiple queries are implemented (insert transaction record and update account balance for both users) following ACID properties.

Auth in Headers:
```json
{   
    "account": account number,
    "pin": pin number
}
```

Body: *note: Only accept positive numbers and decimals as params
```json
{
    "amount":{{INSERT AMOUNT HERE}},
    "transferTo": {{INSERT TARGET RECEIVERS ACCOUNT NUMBER HERE}}
}
```

Response(sample):
```json
{
    "transaction": {
        "transaction_id": 7,
        "type": "TRANSFER",
        "sender": 4,
        "amount": "6.00",
        "receiver": 2,
        "status": "SUCCESSFUL",
        "description": "none"
    }
}
```

### **Admin Router**

Prefix:  ```/admin```

This router requires the same params for Authentication as the above except with an Admin account

Seed files have helped create an admin account already with the following details, you can use the account and pin in order to use all routes in this router

```json
        {
          "account_number": 1,  
          "f_name": "operations",
          "l_name": "team",
          "pin": "admin", // This is Hashed in the Database
          "is_admin": true,
        },
```

### 1. Get a user Accounts History

GET ```/admin/history```

This Route will allow you to view your own transaction history (granted you have made some), optional query parameters are also provided in order to filter the type of transactions you wish to view, a list of optional queries are shown below. However must insert a user account as a param for this route to work

Auth in Headers:
```json
{   
    "account": account number,
    "pin": pin number
}
```

Mandatory query Params:
* account: account Number of user you want to view history of

Optional query params:
* start: (mm/dd/yyyy) From when you want to find transactions
* end: (mm/dd/yyy) Till when you want to find transactions
* type: ['DEPOSIT','WITHDRAW','TRANSFER','FIX'] Type of transaction you want to get (default you get all)
* status: ['SUCCESSFUL', 'FAILED', 'FIXED'] Status of transaction you want to get (default you get all)

Response(sample):
```json
{
    "transactionHistory": [
        {
            "id": 3,
            "account_id": 4,
            "type": "DEPOSIT",
            "amount": "50.00",
            "status": "SUCCESSFUL",
            "receiver_account_id": null,
            "target_transaction": null,
            "description": "Sample Transaction",
            "created_at": "2021-01-10T05:20:48.227Z",
            "updated_at": "2021-01-10T05:20:48.227Z"
        },
        {
            "id": 2,
            "account_id": 4,
            "type": "DEPOSIT",
            "amount": "50.00",
            "status": "SUCCESSFUL",
            "receiver_account_id": null,
            "target_transaction": null,
            "description": "Sample Transaction",
            "created_at": "2021-01-10T05:20:45.362Z",
            "updated_at": "2021-01-10T05:20:45.362Z"
        }
    ],
    "totalTransaction": 2
}
```

### 2. Fixing a withdraw or deposit transaction

PUT ```/admin/fix```

This route is provided to allow an admin account to help a user "fix" a withdraw or deposit account. It was decided to not allow users touch and change the history them selves as they may not be the most trusted source to simply claim they need to change the transaction.

A fix transaction will not fix the original transaction, however it would create a NEW transaction that would indicate which transaction it is indeed fixing. Amount in the fix transaction will completely override the amount in the original transaction, however if this new amount will cause a users account to go below zero, the fix will not be allowed to occur. Additionally, only WITHDRAWS and DEPOSITS are allowed to be fixed, and if a transaction has previously been fixed, it may not be fixed again.

This query to the DB is built using transactions to ensure that multiple queries are implemented (insert transaction record and update account balance for both users) following ACID properties.

Auth in Headers:

```json
{   
    "account": account number,
    "pin": pin number
}
```

Body: *note: Only accept positive numbers and decimals as params
```json
{
    "transactionId": 19,
    "account": 2,
    "amount": 250
}
```

Response(sample):
```json
{
    "transaction": {
        "id": 20,
        "account_id": 2,
        "type": "FIX",
        "amount": "250.00",
        "status": "SUCCESSFUL",
        "receiver_account_id": null,
        "target_transaction": 19,
        "description": "Fixing Transaction 19",
        "created_at": "2021-01-07T11:47:54.258Z",
        "updated_at": "2021-01-07T11:47:54.258Z"
    },
    "newBalance": "100.00",
    "adjustedAmount": -150 // this will indicate the difference between original transaction and new fix
}
```

### 3. Create another Admin Account

POST ```/admin/create```

This route allows for an admin to create other admin accounts. This is the only way to create a new admin account if more users are needed in the admin role.

Auth in Headers:

```json
{   
    "account": account number,
    "pin": pin number
}
```

Body:
```json
{
    "fName": "admin",
    "lName": "user",
    "pin": "1234"
}
```

Response(sample):
```json
{
    "accountDetails": {
        "account_number": 3,
        "fName": "admin",
        "lName": "user",
        "is_admin": true,
        "pin": "1234"
    }
}
```

### 4. Reset User pin

PUT ```/admin/resetPin```

Users forget their pin, that's jsut life. And if there is no way to get their pin back, all their fake money just disappears... and that sucks, SO here is the one way in which a user can reset their pin. the ```pin``` param in the body is optional, if none is passed in, a new random 4 number pin will be generated.

Auth in Headers:

```json
{   
    "account": account number,
    "pin": pin number
}
```

Body:
```json
{
    "account": 3,
    "pin":"newPin"
}
```

Response(sample):
```json
{
    "accountDetails": {
        "account": 3,
        "f_name": "example",
        "l_name": "user",
        "pin": "newPin"
    }
}
```

## 5. Personal Reflection

I have spent the better part of the last week on this challenge. I hope you enjoy my interpretation of what needed to be done.

I took some assumptions in this project, as mentioned in the beginning of which some I feel like I can improve on in future attemps or if I had more time to work on finer details. Some of the points include:

1. Each user only can have one account at a time:

In the future, It would be better to implement a third table for "users" and simply link that into an account. This would allow for greater flexibility into how many accounts a user can have, maybe even implement "joint accounts" if i wanted to

2. No over drafting for users:

Many banks today have over drafting policies, I had a strict no over drawing policies, but that could be changed in the future fo have a over draw fee that would kick in if tha bank goes below 0

3. What it means to "FIX" a transaction

This stumped me for a long time, why would you need to "fix" a withdraw or deposit... if i took soo much money out? i can just deposit it back in, if i deposit too much, i can withdraw some? maybe it is because I do not have the ability to deposit money into another persons account. My interpretation is some sort of "glitch" happened that by passed my transactions in Knex, hence on a "sensitive" transaction like that, only a staff, or admin in this case, will have the right to do so.

4. Testing

On a more technical side, I ran tests that targetted all the routers, it could be also good to test more specific services and functions in those areas to get a better idea


## 6. Thank you!

Thank you for taking the time to go through this, this is line 550 in the .md file and that is A LOT to read, I truly appreciate the time you have taken to review this project, it was more fun than I anticipated to build out from scratch, and I look forward to hearing from you.

-Foong