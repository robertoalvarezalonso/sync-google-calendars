function syncCalendars() {
  let calendars;

  calendars = Calendar.CalendarList.list();
  if (!calendars.items || calendars.items.length === 0) {
    console.log('No calendars found.');
    return;
  }
  // Print the calendar id and calendar summary
  for (const calendar of calendars.items) {
    if (!calendar.primary) {
      console.log('ID: %s', calendar.id);
      logSyncedEvents(calendar.id, false);
    }
  }
}

function logSyncedEvents(calendarId, fullSync) {
  const properties = PropertiesService.getUserProperties();
  const syncTokenKey = `syncToken_${calendarId}`;
  const syncToken = properties.getProperty(syncTokenKey);

  // We can't do the recurring events, because some instances of the recurring event could have been modified
  const options = {
    singleEvents: true
  };

  if (syncToken && !fullSync) {
    options.syncToken = syncToken;
  } else {
    // Sync events up to thirty days in the past.
    //options.timeMin = new Date().toISOString();
    //options.timeMin = new Date(new Date().getFullYear(), 0, 1).toISOString()
    options.timeMin = getRelativeDate(-7, 0).toISOString();
    //options.timeMax = getRelativeDate(14, 0).toISOString();
    options.timeMax = getRelativeDate(180, 0).toISOString();
  }
  // Retrieve events one page at a time.
  let events;
  let pageToken;
  do {
    try {
      options.pageToken = pageToken;
      events = Calendar.Events.list(calendarId, options);
    } catch (e) {
      // Check to see if the sync token was invalidated by the server;
      // if so, perform a full sync instead.
      if (e.message === 'Sync token is no longer valid, a full sync is required.') {
        properties.deleteProperty('syncToken');
        logSyncedEvents(calendarId, true);
        return;
      }
      throw new Error(e.message);
    }
    if (events.items && events.items.length === 0) {
      console.log('No events found.');
      return;
    }
    events.items.forEach(event => {
      // Uppercase letters, 'z' and '_' are not valid characteres
      const eventId = event.getId().toLowerCase().replace(/_/g, '').replace(/z/g, '');

      if (event.status === 'cancelled') {
        Calendar.Events.remove('primary', eventId)
        return;
      }

      let start;
      if (event.start.date) {
        start = new Date(event.start.date);
      } else {
        // Events that don't last all day; they have defined start times.
        start = new Date(event.start.dateTime);
      }

      const updatedEvent = {
        summary: event.summary,
        description: event.description,
        location: event.location,
        start: event.start,
        end: event.end,
        transparency: event.transparency || 'opaque'
      }; try {
        Calendar.Events.update(updatedEvent, 'primary', eventId);
        console.log('Update %s (%s) [%s]', event.summary, start.toLocaleString(), eventId);
      } catch (error) {
        console.log('Failure trying to get %s (%s) [%s]: %s', event.summary, start.toLocaleDateString(), event.id, error.message)

        updatedEvent.id=eventId;
        Calendar.Events.insert(updatedEvent, 'primary');
        console.log('Insert %s (%s) [%s]', event.summary, start.toLocaleString(), eventId);
      }
    }
    )
    pageToken = events.nextPageToken;
  } while (pageToken);
  properties.setProperty(syncTokenKey, events.nextSyncToken);
}

/**
 * Helper function to get a new Date object relative to the current date.
 * @param {number} daysOffset The number of days in the future for the new date.
 * @param {number} hour The hour of the day for the new date, in the time zone
 *     of the script.
 * @return {Date} The new date.
 */
function getRelativeDate(daysOffset, hour) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hour);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
}

