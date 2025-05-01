# Architecture

## Hexagonal architecture

This project respect the principle of hexagonal architecture.

### backend

The core of the application is on routers/trpcProcedures, useCase is an Effect programme who respect the SOLID principle.
The useCase are :

- Pure
- use Dependency Injection pattern
- with a single responsability

The dependencies are manage with ports interface (providers) and adapters.
Example with emailing :

- The port is the mailer interface, it implements the sendEmail method
- The useCase who need to send an email inject the mail provider
- The adapter used is managed by the configuration (here Mailjet)
- So the sendEmail call with send the email through MailJet.

This process is respecting the SOLID principle.

#### tests

### frontend

The unique purpose of the frontend is to display data with a best UX and a nice UI.
The front could have a hexagonal architecture for example with the payment management. Each payment platform is an adapter (with component and hook), for example use Stripe and Lemonway
