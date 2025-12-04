# HUMANLINK

This project is a MVP of a freelancing PF

## Main technos

- Next.js
- tRPC : **[link](https://trpc.io/)**
- TypeScript (v5)

## Other technos

- @mui/material : **[link](https://mui.com/)** , Component library
- prisma : **[link](https://www.prisma.io/)** , An ORM
- effect : **[link](https://effect.website/)** , A functionnal programming library
- valtio : **[link](https://valtio.dev/)** , state management
- @tanstack/react-query
- elasticsearch

## Principles

### TypeScript

This project implement TypeScript with a strict configuration.

### Lint & Prettier

This project use the typescript strandard linter rules and a prettier.

It's not possible to push a commit with an error build, a lint error and a unit test failed.

### hexagonal architecture

#### backend

The core of the application is on routers/trpcProcedures, useCase is an Effect programme who respect the SOLID principle.
The useCases are :

- pure
- used Dependency Injection pattern
- with a single responsability

The dependencies are manage with ports interface (providers) and adapters.
Example with emailing :

- The port is the mailer interface, it implements the sendEmail method
- The useCase who need to send an email inject the mail provider
- The adapter used is managed by the configuration (here Mailjet)
- So the sendEmail call with send the email through MailJet.

This process is respecting the SOLID principle.

#### frontend

The unique purpose of the frontend is to display data with a best UX and a nice UI.
The front could have a hexagonal architecture for example with the payment management. Each payment platform is an adapter (with component and hook), for example use Stripe and Lemonway
