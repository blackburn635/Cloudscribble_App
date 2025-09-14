#!/bin/bash

# scripts/update-docs.sh
# Updates documentation for Things to Do/Reminders feature branch
# Date: September 2025

echo "📝 Updating CloudScribble documentation for Things to Do feature branch..."

# Update project-state.md
echo "Updating project-state.md..."
cat >> docs/project-state.md << 'EOF'

## Things to Do/Reminders Feature (In Progress - September 2025)

### 🚧 Feature Branch: todo-reminders-integration

#### Implementation Status: PARTIALLY COMPLETE (70%)
Feature postponed pre-launch for time considerations. Will be released as optional feature post-launch.

#### Completed Components:
- ✅ **PlannerTextProcessor.js** - Enhanced with todo extraction logic
- ✅ **QRDecoder.js** - Column layout definitions (50/50 split)
- ✅ **TodoReview.js** - Complete review/edit modal component
- ✅ **ReminderSelector.js** - iOS reminder list selection interface
- ✅ **RemindersManager.js** - Full EventKit integration for reminders
- ✅ **RemindersPermission.js** - Permission handling utility
- ✅ **App.js** - Integration code and state management

#### Known Issues:
- ❌ **Section vertical range detection** - Todos not being assigned to correct day sections
- ❌ **Calendar sync flow** - Returns to calendar selector after orphaned event handling
- ⚠️ **OCR block processing** - Need to verify section boundaries cover full page height

#### Technical Architecture:
```
Page Layout (Template 01):
├── Left 50%: Calendar Events
└── Right 50%: Things to Do
    ├── Flexible text recognition (bullets, checkboxes, plain text)
    ├── 5pm COB reminder scheduling
    └── Duplicate detection
```

#### Data Flow:
1. Single Azure OCR API call → Extracts both events and todos
2. Events processed → Calendar sync flow (existing)
3. Todos extracted → Review modal → Reminder list selection → Create at 5pm

#### Future Implementation Notes:
- **Make feature optional**: Add settings toggle in app preferences
- **Fix section boundaries**: Ensure all sections have proper bottomPosition values
- **Debug extraction**: "Take out Trash" detected but not extracted - check vertical ranges
- **Test with multiple templates**: Currently only Template 01 configured

#### Dependencies Added:
- expo-calendar (for EventKit Reminders integration)
- iOS permissions: NSRemindersUsageDescription

EOF

# Update development-log.md
echo "Updating development-log.md..."
cat >> docs/development-log.md << 'EOF'

### Phase 14: Things to Do/Reminders Integration (Partial)
**Objective:** Extract Things to Do items and create iOS Reminders
**Date:** September 2025
**Status:** POSTPONED - Feature branch created for post-launch implementation

**Work Completed:**

#### Architecture Design
- Designed 50/50 column split detection (calendar left, todos right)
- Single API transaction maintained for cost optimization
- 5pm COB scheduling for all reminders
- Flexible text extraction (bullets, checkboxes, numbers, plain text)

#### Components Created
1. **TodoReview.js** - Full-featured review/edit modal
   - Checkbox selection per todo
   - Inline text editing
   - Delete functionality
   - Day grouping

2. **ReminderSelector.js** - List selection interface
   - Defaults to "General Reminders"
   - Color-coded list display
   - Permission handling

3. **RemindersManager.js** - EventKit integration
   - Batch reminder creation
   - Duplicate detection
   - Error handling per reminder

#### Files Modified
- **PlannerTextProcessor.js**: Added `processTodosForSections()`, `findTodoBlocks()`, `extractTodosFromBlock()`
- **QRDecoder.js**: Added column layout to template definitions
- **App.js**: Integrated todo flow with state management

#### Issues Encountered
1. **Section Boundary Problem**: Todos detected by OCR but not assigned to sections
   - Root cause: Section vertical ranges not covering full page height
   - Debug showed "Take out Trash" at position 2133 outside section ranges
   
2. **Data Structure Mismatch**: Initial implementation passed wrong object structure
   - Fixed: Changed `processTodosForSections(ocrResult)` to `processTodosForSections(ocrResult.data)`

3. **Calendar Sync Loop**: After orphaned event handling, returns to calendar selector
   - Need to fix CalendarSelector component flow

#### Lessons Learned
- **Vertical Range Coverage**: Must ensure sections extend to page boundaries
- **Debug Early**: Should have added comprehensive logging from start
- **Feature Flags**: Complex features should be optional from design phase
- **Integration Testing**: Need test data with known positions for debugging

#### Code Quality Notes
- All components follow CloudScribble design system
- Maintains single API transaction optimization
- Proper error handling and user feedback
- Clean separation of concerns

#### Time Investment
- ~8 hours design and implementation
- ~2 hours debugging section detection
- Decision to postpone based on pre-launch timeline priorities

EOF

# Update backlog.md
echo "Updating backlog.md..."
cat >> docs/backlog.md << 'EOF'

## High Priority (Post-Launch)

### Complete Things to Do/Reminders Integration
**Branch:** todo-reminders-integration
**Estimated Time:** 4-6 hours
**Tasks:**
- [ ] Fix section vertical range detection
  - Ensure all sections have bottomPosition set
  - Verify sections cover full page height
  - Test with "Take out Trash" at position 2133
- [ ] Fix calendar sync flow to prevent loop
- [ ] Add feature toggle in app settings
- [ ] Comprehensive testing with multiple page layouts
- [ ] Add telemetry for extraction success rates
- [ ] Create user onboarding for feature

**Technical Debt:**
- Refactor section boundary calculation into dedicated method
- Add unit tests for todo extraction logic
- Consider extracting todo processing into separate class

**User Experience:**
- Add tutorial overlay on first use
- Show extraction confidence for todos
- Allow manual todo addition in review modal
- Add time customization (not just 5pm)

## Completed Tasks

### ✅ Calendar Sync Feature (December 2024)
- Orphaned event detection
- Write-in-planner reminders
- Dual action system (Delete/Write)

### ✅ Edit Event Feature (September 12, 2025)
- Complete CRUD operations
- Day movement between sections
- Time picker implementation

EOF

# Create commit summary
echo "Creating commit summary..."
cat > commit-summary.md << 'EOF'
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
EOF

echo "✅ Documentation updated successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Review the documentation updates"
echo "2. Commit changes to feature branch:"
echo "   git add -A"
echo "   git commit -F commit-summary.md"
echo "3. Push feature branch to GitHub:"
echo "   git push origin todo-reminders-integration"
echo "4. Switch back to main branch:"
echo "   git checkout main"
echo "5. Continue with launch preparations"
echo ""
echo "🎯 Post-launch action items:"
echo "- Complete section boundary fixes (4-6 hours)"
echo "- Add settings toggle for feature"
echo "- Comprehensive testing"
echo "- User onboarding flow"