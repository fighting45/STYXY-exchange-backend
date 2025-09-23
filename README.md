# Styxy Exchange Backend

This is the backend for the **Styxy Exchange** project, which handles:
1- User profile signups with socials or web3.
2- Unique web3 "Solana" & "Ethereum" wallet creation with 3 images provided by user on signup page.
3- Enables solana swaps via Jupiter.

## Routes

### 1. **POST /profiles**

This route is used to create a new user profile, when successfully created it sends the created profile and the access token valid for "15min" as a response.

- **Request Body**:
  - `email`: The email of the user (e.g., `"me1@gmail.com"`).
  - `fullname`: The full name of the user (e.g., `"Usaamaaas Hassan"`).
  - `speciality`: The speciality of the user, either `"patient"` or `"doctor"`.
  - `loginType`: The login type, either `"socials"` or `"web3_Wallet"`.

**Example Request:**

```json
{
  "email": "me1@gmail.com",
  "fullname": "Usaamaaas Hassan",
  "speciality": "patient",
  "loginType": "web3_Wallet"
}
```

**Response:**

- **201 Created** if the profile is successfully created.
- **400 Bad Request** if required fields are missing or invalid.

### 2. **GET /profiles/\:userID**

This route fetches the profile of a user by their `userID` and by providing access token in as the auth header as a bearer token.

- **URL Parameters**:

  - `userID`: The unique ID of the user.
  - `accessToken`: Passed as a bearer in the auth while sending request.

**Example Request:**

```bash
GET /profiles/12345
```

**Response:**

- **200 OK** with the user profile if found.
- **404 Not Found** if no profile exists for the given `userID`.

### 3. **PUT /profiles/\:userID**

This route updates an existing user profile. The user profile can be modified by providing new data for the fields.

- **URL Parameters**:

  - `userID`: The unique ID of the user whose profile needs to be updated.

- **Request Body**:

  - `email`: The updated email of the user.
  - `fullname`: The updated full name of the user.
  - `speciality`: The updated speciality of the user, either `"patient"` or `"doctor"`.
  - `loginType`: The updated login type, either `"socials"` or `"web3_Wallet"`.

**Example Request:**

```json
{
  "email": "newemail@gmail.com",
  "fullname": "Updated Name",
  "speciality": "doctor",
  "loginType": "web3_Wallet"
}
```

**Response:**

- **200 OK** with the updated profile if the update is successful.
- **400 Bad Request** if required fields are missing or invalid.
- **404 Not Found** if no profile exists for the given `userID`.

### 4. **POST /wallet/create**

This route creates a wallet for a user. It accepts **3 images** as part of the request body to generate a unique wallet based on them.

- **Request Body**:

  - **3 image files**: The images should be uploaded as files (e.g., `image1`, `image2`, `image3`).
  - **Network**: Provide the network i.e. "Ethereum" or "Solana".

**Example Request:**

```bash
POST /wallet/create
Content-Type: multipart/form-data
{
  image1: <image_file_1>,
  image2: <image_file_2>,
  image3: <image_file_3>
  Network: <Ethereum> or <Solana>
}

```

**Response:**

- **201 Created** with wallet details if the wallet is successfully created.
- **400 Bad Request** if any image is missing/invalid or the network is not provided.

### 5. **GET /wallets/\:userID**

This route retrieves the wallet associated with a specific user by their `userID`.

- **URL Parameters**:

  - `userID`: The unique ID of the user.

**Example Request:**

```bash
GET /wallets/12345
```

**Response:**

- **200 OK** with the wallet information if found.
- **404 Not Found** if no wallet exists for the given `userID`.

### 6. **POST /swap/**

This route sends a swap transaction via jupiter for a user. It takes following fileds as part of the request body to make a swap tx:

- **Request Body**:

  - **InputMint**: The token you want to swap.
  - **OutputMint**: The token you want your tokens to swap to.
  - **Amount**: The amount of input tokens to swap.
  - **Action**: Sell or Buy action.
  - **WalletAddress**: The WalletAddress of the owner of the swap.
  - **Network**: Provide the network i.e. "Ethereum" or "Solana".

**Example Request:**

```bash
POST /swap
Content-Type: raw/json
{
  "inputMint": "So11111111111111111111111111111111111111112",
  "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "amount": "1000000",
  "action": "buy",
  "network": "solana",
  "walletAddress": "8RR7P3s9mDynhJwWG3sSgwnujKV4Mrz8NLqP3Gy8gLcR"
}

```

**Response:**

- **200 Created** with swap details if the swap is successfull.
- **400 Bad Request** if swap fails.

### 7. **GET /swap/\:walletAddress**

This jwt protected route retrieves all the transactions associated with a specific wallet address.

- **URL Parameters**:

  - `walletAddress`: The wallet address of the user.
  - `jwt`: A valid access token in auth headers for authentication.

**Example Request:**

```bash
GET /swap/\:{walletAddress}
Content-Type: params
```

**Response:**

- **200 OK** with the wallet information if found.
- **401 Unauthorized** If accesstoken is not provided or is incorrect.
- **400 Not Found** if no wallet exists for the given `userID`.

---

## Project Setup

### Prerequisites

Make sure you have the following installed:

- **Node.js** (v12.x or higher)
- **MongoDB** (locally or MongoDB Atlas)
- **Docker**

### Install Dependencies

Run the following command to install the required dependencies:

```bash
npm install
```

### Environment Variables

You need to set up a `.env` file for the environment variables. Here is a sample `.env` file:

```
DB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/styxy-exchange
PORT=3000
```

- `DB_URI`: The connection string for your MongoDB database (local or Atlas).
- `ENCRYPTION_KEY`: The key used as a seed for encrypting private key.
- `ACCESS_TOKEN_SECRET`: The secret key used to create access token.

### Start the Server

To start the server, run the following command:

```bash
npm start
```

To start the server dev friendly, run the following command:

```bash
npm run dev
```

The server will run on `http://localhost:3000` by default.

---

## Technologies Used

- **Node.js**: JavaScript runtime for building the server.
- **Express**: Web framework for Node.js.
- **MongoDB**: Database to store user profiles and wallets.
- **Jupuiter**: Dex Aggregator for solana swaps.
- **Docker**: Docker vault used to store and fetch encrypted private key of the generated wallets.

---
