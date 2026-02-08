-- Update allowed actions for task_activities to support notes and progress updates
alter table task_activities
  drop constraint if exists task_activities_action_check;

alter table task_activities
  add constraint task_activities_action_check
  check (action in (
    'task_created',
    'task_assigned',
    'task_completed',
    'task_note_added',
    'task_progress_updated'
  ));
