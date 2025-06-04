import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { UserGoal, GoalCategory } from '../../types'; // Assumes types are in src/types/index.ts
import { useEffect } from 'react';

export type UserGoalFormData = {
  title: string;
  description?: string;
  category: GoalCategory;
  target: string; // String for input, will parse to number
  unit: string;
  deadline: string; // YYYY-MM-DD format
};

interface AddEditGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserGoalFormData) => void;
  goalToEdit?: UserGoal;
  isLoading?: boolean;
}

const AddEditGoalModal: React.FC<AddEditGoalModalProps> = ({ isOpen, onClose, onSubmit, goalToEdit, isLoading }) => {
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<UserGoalFormData>({
    defaultValues: {
      title: '',
      description: '',
      category: 'distance',
      target: '',
      unit: '',
      deadline: '',
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (goalToEdit) {
        reset({
          title: goalToEdit.title,
          description: goalToEdit.description || '',
          category: goalToEdit.category,
          target: String(goalToEdit.target), // Convert number to string for input
          unit: goalToEdit.unit,
          // Ensure deadline is in YYYY-MM-DD for date input compatibility
          deadline: goalToEdit.deadline ? new Date(goalToEdit.deadline).toISOString().split('T')[0] : '',
        });
      } else {
        reset({ // Reset to default for new goal
          title: '',
          description: '',
          category: 'distance',
          target: '',
          unit: '',
          deadline: new Date().toISOString().split('T')[0], // Default to today for new goal
        });
      }
    }
  }, [isOpen, goalToEdit, reset]);

  const goalCategories: GoalCategory[] = ['distance', 'speed', 'consistency', 'event', 'other'];

  const internalFormSubmit: SubmitHandler<UserGoalFormData> = (data) => {
    onSubmit(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={goalToEdit ? 'Edit Goal' : 'Add New Goal'}>
      <form onSubmit={handleSubmit(internalFormSubmit)} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">Title</label>
          <Input id="title" {...register('title', { required: 'Title is required' })} className={errors.title ? 'border-destructive' : ''} />
          {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">Description (Optional)</label>
          <Textarea id="description" {...register('description')} />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1">Category</label>
          <Controller
            name="category"
            control={control}
            rules={{ required: "Category is required" }}
            render={({ field }) => (
              // The simplified Select component takes children directly
              <Select
                id="category"
                value={field.value}
                onValueChange={field.onChange}
                className={errors.category ? 'border-destructive' : ''}
              >
                <option value="" disabled>Select category</option>
                {goalCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                ))}
              </Select>
            )}
          />
          {errors.category && <p className="text-xs text-destructive mt-1">{errors.category.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="target" className="block text-sm font-medium text-foreground mb-1">Target</label>
            <Input id="target" type="number" {...register('target', { required: 'Target is required', valueAsNumber: true, min: { value: 0.01, message: 'Target must be positive' } })} className={errors.target ? 'border-destructive' : ''} />
            {errors.target && <p className="text-xs text-destructive mt-1">{errors.target.message}</p>}
          </div>
          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-foreground mb-1">Unit</label>
            <Input id="unit" {...register('unit', { required: 'Unit is required' })} placeholder="e.g., km, runs, minutes" className={errors.unit ? 'border-destructive' : ''} />
            {errors.unit && <p className="text-xs text-destructive mt-1">{errors.unit.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-foreground mb-1">Deadline</label>
          <Input id="deadline" type="date" {...register('deadline', { required: 'Deadline is required' })} className={errors.deadline ? 'border-destructive' : ''} />
          {errors.deadline && <p className="text-xs text-destructive mt-1">{errors.deadline.message}</p>}
        </div>

        {goalToEdit && (
          <p className="text-sm text-muted-foreground">Current Progress: {goalToEdit.current} {goalToEdit.unit}</p>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" disabled={isLoading} isLoading={isLoading}>
            {isLoading ? 'Saving...' : (goalToEdit ? 'Save Changes' : 'Add Goal')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEditGoalModal;
