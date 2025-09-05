# Styxy Exchange Backend

This is the backend for the **Styxy Exchange** project, which handles user profiles and wallet creation.

## Routes

### 1. **POST /profiles**

This route is used to create a new user profile.

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

````

**Response:**

- **201 Created** if the profile is successfully created.
- **400 Bad Request** if required fields are missing or invalid.

### 2. **GET /profiles/\:userID**

This route fetches the profile of a user by their `userID`.

- **URL Parameters**:

  - `userID`: The unique ID of the user.

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

**Example Request:**

```bash
POST /wallet/create
Content-Type: multipart/form-data
{
  image1: <image_file_1>,
  image2: <image_file_2>,
  image3: <image_file_3>
}
```

**Response:**

- **201 Created** with wallet details if the wallet is successfully created.
- **400 Bad Request** if any image is missing or invalid.

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

---

## Project Setup

### Prerequisites

Make sure you have the following installed:

- **Node.js** (v12.x or higher)
- **MongoDB** (locally or MongoDB Atlas)

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
- `PORT`: The port on which the backend will run (default is `3000`).

### Start the Server

To start the server, run the following command:

```bash
npm start
```

The server will run on `http://localhost:3000` by default.

---

## Technologies Used

- **Node.js**: JavaScript runtime for building the server.
- **Express**: Web framework for Node.js.
- **MongoDB**: Database to store user profiles and wallets.
- **Mongoose**: MongoDB ODM (Object Data Modeling) library for Node.js.

---

### Contributing

Feel free to fork the repository, create a branch, and submit a pull request with your improvements or bug fixes.

---

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```

---

You can copy and paste this directly into your `README.md` file. It includes:
1. Detailed route documentation.
2. Instructions on setting up the project and installing dependencies.
3. Basic information about the technologies used.
4. Contribution and licensing information.

Let me know if you need any further changes!
```
````
