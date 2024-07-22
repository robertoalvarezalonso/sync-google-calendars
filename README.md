# sync-google-calendars
A Google Apps Script to synchronize events between multiple Google Calendars. The script checks for updates, deletions, and new events, ensuring that specified calendars remain consistent with each other.

## Background

This project arose from the need to display availability in Outlook, considering multiple personal Google Calendars. Since Outlook allows adding only one personal calendar, the solution was to create a new Google account, grant access to the calendars to be included for availability, and use this script to combine events into the primary calendar of that account. Finally, this primary calendar is [used in Outlook](https://support.microsoft.com/en-us/office/show-personal-events-on-your-work-or-school-calendar-6ffc71a9-0943-415a-8482-ce0122528a35) to reflect the combined availability.

## Features
* Synchronizes events from non-primary Google Calendars to the primary Google Calendar.
* Handles event creation, updates, and deletions.
*	Performs incremental sync using sync tokens for efficiency.
*	Falls back to a full sync if sync tokens are invalid or missing.
*	Syncs events from the last 7 days to 180 days in the future.

## Prerequisites
*	A Google account with access to the [Google Calendar API](https://developers.google.com/apps-script/advanced/calendar).
*	Google Apps Script environment set up.

## Usage

1. Open the Apps Script project in the Google Apps Script editor.
2. Set up a trigger for each shared calendar to run the syncCalendars function whenever an update occurs. This ensures the script runs every time there is an update in any of the shared calendars.
3. Save and authorize the script to access your Google Calendar.
4. The script will automatically sync events from non-primary calendars to the primary calendar.

## Setting Up Triggers

To set up a trigger for each shared calendar:

1. Open the Google Apps Script editor.
2. Go to Triggers (clock icon in the left sidebar).
3. Click on Add Trigger.
4. Set the syncCalendars function to run From calendar and choose the appropriate shared calendar.
5. Repeat the above steps for each shared calendar.

## Script Details

**syncCalendars()**

Main function to retrieve all calendars and sync each non-primary calendar with the primary calendar.

**logSyncedEvents(calendarId, fullSync)**

Retrieves events from the given calendar that have been modified since the last sync and updates the primary calendar accordingly.

**getRelativeDate(daysOffset, hour)**

Helper function to get a new Date object relative to the current date.
