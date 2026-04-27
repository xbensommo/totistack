/** @file src/apps/booking/booking.actions.js */

function getBookingService(context) {
  const service = context?.service || context?.services?.booking || context?.services?.bookingService
  if (!service) throw new Error('Booking service is not configured for this action.')
  return service
}

export function createBookingActionDefinitions() {
  return [
    {
      type: 'booking.update',
      confirm: ({ target }) => ({
        title: 'Update booking',
        message: `Update ${target?.bookingNumber || target?.title || 'this booking'}?`,
        confirmText: 'Update booking',
        cancelText: 'Cancel',
        variant: 'warning',
      }),
      run: (context) => getBookingService(context).update(context.target?.id || context.id, context.payload || {}),
    },
    {
      type: 'booking.reschedule',
      confirm: ({ target }) => ({
        title: 'Reschedule booking',
        message: `Reschedule ${target?.bookingNumber || target?.title || 'this booking'}?`,
        confirmText: 'Reschedule',
        cancelText: 'Cancel',
        variant: 'warning',
      }),
      run: (context) => getBookingService(context).reschedule(context.target?.id || context.id, context.payload || {}),
    },
    {
      type: 'booking.cancel',
      confirm: ({ target }) => ({
        title: 'Cancel booking',
        message: `Cancel ${target?.bookingNumber || target?.title || 'this booking'}?`,
        confirmText: 'Cancel booking',
        cancelText: 'Keep booking',
        variant: 'danger',
      }),
      run: (context) => getBookingService(context).cancel(context.target?.id || context.id, context.payload?.reason || ''),
    },
    {
      type: 'booking.confirm',
      confirm: ({ target }) => ({
        title: 'Confirm booking',
        message: `Confirm ${target?.bookingNumber || target?.title || 'this booking'}?`,
        confirmText: 'Confirm booking',
        cancelText: 'Cancel',
        variant: 'success',
      }),
      run: (context) => getBookingService(context).confirm(context.target?.id || context.id),
    },
    {
      type: 'booking.check-in',
      confirm: ({ target }) => ({
        title: 'Check in booking',
        message: `Check in ${target?.bookingNumber || target?.title || 'this booking'}?`,
        confirmText: 'Check in',
        cancelText: 'Cancel',
        variant: 'warning',
      }),
      run: (context) => getBookingService(context).checkIn(context.target?.id || context.id),
    },
    {
      type: 'booking.complete',
      confirm: ({ target }) => ({
        title: 'Complete booking',
        message: `Mark ${target?.bookingNumber || target?.title || 'this booking'} as completed?`,
        confirmText: 'Complete booking',
        cancelText: 'Cancel',
        variant: 'success',
      }),
      run: (context) => getBookingService(context).complete(context.target?.id || context.id, context.payload || {}),
    },
  ]
}

export default createBookingActionDefinitions
