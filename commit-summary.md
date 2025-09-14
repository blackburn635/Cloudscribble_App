feat: Partial implementation of Things to Do/Reminders extraction

POSTPONED FOR POST-LAUNCH

Components created:
- TodoReview modal for editing extracted tasks
- ReminderSelector for iOS reminder list selection  
- RemindersManager utility for EventKit integration
- Enhanced PlannerTextProcessor with todo extraction

Known issues:
- Section vertical ranges need fixing
- Calendar sync flow requires adjustment

All work preserved in branch: todo-reminders-integration

Files modified:
- utils/PlannerTextProcessor.js
- utils/QRDecoder.js
- App.js
- components/TodoReview.js (new)
- components/ReminderSelector.js (new)
- utils/RemindersManager.js (new)
- utils/RemindersPermission.js (new)
- docs/project-state.md
- docs/development-log.md
- docs/backlog.md
