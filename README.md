
## Run Locally

Clone the project

```bash
  git clone https://github.com/khalilannbiya/belajar-prisma-jwt.git
```

Go to the project directory

```bash
  cd belajar-prisma-jwt
```

Install dependencies

```bash
  npm install OR pnpm i
```

Create Database MySQL: express_prisma

Setting .env
```bash
    DATABASE_URL="mysql://root:@localhost:3306/express_prisma"
    JWT_SECRET_KEY=inicontohDariSecretKeyJWT
```

Run the command for the pull table

```bash
  pnpm prisma db pull
```

Run the command

```bash
  pnpm prisma generate
```


Start the server

```bash
  npm run start OR pnpm start
```

