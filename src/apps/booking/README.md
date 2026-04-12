# Booking App

Production-ready starter Booking app updated for the latest Totistack declarative structure.

## Design rules

- Declarative app only
- No runtime route registration
- No provider creation inside the app
- No root auth/rbac ownership inside the app
- Uses root store and generated collection actions
- Compatible with `src/generated/*` assembly

## Included

- `app.manifest.js`
- `routes.js`
- `index.js`
- `collections/bookings.collection.js`
- `services/bookingService.js`
- generic, extendable Vue starter components
- starter pages for list, detail, calendar, and create flows

## Extension path

Add more collection files only when you really need them, for example:

- `resources.collection.js`
- `availability.collection.js`
- `booking_reminders.collection.js`

Keep apps/features declarative and let Totistack root assemble them.
