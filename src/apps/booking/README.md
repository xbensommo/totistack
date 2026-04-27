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
- starter pages for list, detail, calendar, create, and public booking lookup flows

## Improvements in this version

- Guest and authenticated users can create bookings
- Reminder scheduling placeholders for email, SMS, and WhatsApp
- Public booking lookup by booking number or access code plus contact detail
- Richer booking schema for service, location, assignment, source, channel, and reminder tracking
- Expanded filters and operational visibility for booking teams

## Extension path

Add more collection files only when you really need them, for example:

- `resources.collection.js`
- `availability.collection.js`
- `booking_reminders.collection.js`

Keep apps/features declarative and let Totistack root assemble them.
