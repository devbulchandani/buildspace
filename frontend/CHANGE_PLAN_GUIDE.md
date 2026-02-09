# Change Plan Feature - User Guide

## Overview
The "Change Plan" feature allows users to switch between their learning plans directly from the dashboard.

## How to Use

### Step 1: Access the Feature
On your dashboard, you'll see a "Change Plan" button in the project card area.

**Location:**
- Next to the GitHub repository link (if plan exists)
- Or as "Select Plan" button (if no plan is active)

### Step 2: Open Plan Selector
Click the "Change Plan" button to open the plan selector modal.

### Step 3: Browse Your Plans
The modal displays all your learning plans with:
- Plan name and description
- Duration (in days)
- Skill level (Beginner/Intermediate/Advanced)
- Number of milestones

### Step 4: Select a Plan
- Click on any plan card to select it
- The selected plan will be highlighted in blue with a checkmark
- Your current active plan is pre-selected

### Step 5: Confirm Selection
- Click the "Select Plan" button to switch to the chosen plan
- Or click "Cancel" or the X button to close without changing

### Step 6: View Updated Dashboard
- The dashboard automatically updates with the new plan
- Milestones are refreshed to show the new plan's roadmap
- You can start working on the new plan immediately

## Visual Indicators

### Selected Plan
- Blue border (`border-sky-500`)
- Light blue background (`bg-sky-50`)
- Checkmark icon in top-right corner
- Slightly elevated shadow

### Unselected Plans
- Gray border (`border-slate-200`)
- White background
- Hover effect with scale animation
- Light shadow on hover

### Loading State
- Spinning loader icon
- "Loading your plans..." message
- Disabled buttons

### Empty State
- Book icon illustration
- "No learning plans found" message
- Suggestion to create first plan

### Error State
- Red background alert
- Error message description
- Can retry by closing and reopening modal

## Keyboard Shortcuts (Future Enhancement)
- `Esc` - Close modal
- `Enter` - Confirm selection
- `Arrow keys` - Navigate between plans

## Mobile Experience
- Responsive design adapts to screen size
- Touch-friendly tap targets
- Scrollable plan list
- Full-screen modal on small devices

## Tips

1. **Quick Switch**: Use this feature to switch between different learning tracks
2. **Progress Tracking**: Each plan maintains its own progress
3. **Multiple Plans**: Create multiple plans for different technologies
4. **Organization**: Keep plans organized by skill level or project type

## Troubleshooting

### Modal Won't Open
- Ensure you're logged in
- Check your internet connection
- Refresh the page

### Plans Not Loading
- Check backend server is running
- Verify API endpoint is accessible
- Check browser console for errors

### Can't Select Plan
- Ensure you've clicked on a plan card
- Look for the blue highlight and checkmark
- Try clicking again if needed

### Changes Not Saving
- Ensure you clicked "Select Plan" button
- Don't close modal before confirming
- Check for error messages

## Backend Requirements

### API Endpoint
```
GET /api/plans/my-plans
```

### Authentication
- Requires valid JWT token
- Token automatically included in request
- Returns only current user's plans

### Response Format
```json
[
  {
    "id": 1,
    "projectName": "Plan Name",
    "projectDescription": "Description",
    "tech": "Technology",
    "durationDays": 5,
    "skillLevel": "Beginner",
    "milestones": [...]
  }
]
```

## Feature Benefits

1. **Flexibility**: Switch between learning paths easily
2. **Organization**: Manage multiple learning goals
3. **Efficiency**: No need to navigate away from dashboard
4. **Context**: See all plan details before switching
5. **Speed**: Quick selection with visual feedback

## Related Features

- **Create Plan**: Create new learning plans
- **Milestone Timeline**: View plan progress
- **Chat**: Get help with current plan
- **Verification**: Verify milestone completion

## Future Enhancements

- Search and filter plans
- Sort by date, name, or progress
- Delete plans from modal
- Edit plan details
- Duplicate existing plans
- Archive completed plans
- Share plans with others
- Import/export plans

## Support

If you encounter issues:
1. Check this guide
2. Verify backend is running
3. Check browser console
4. Clear browser cache
5. Contact support team
