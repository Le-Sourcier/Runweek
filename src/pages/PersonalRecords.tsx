import React, { useState, useEffect } from 'react'; // Added useEffect
import { usePRs } from '../context/PRContext';
import { PersonalRecord } from '../types';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal'; // Import Modal
import { Trophy, PlusCircle, Edit2, Trash2, CalendarDays, Clock, Waypoints } from 'lucide-react';

const PersonalRecords: React.FC = () => {
  const { prs, addPR, deletePR, updatePR } = usePRs();

  // State for the form inputs
  // State for the form inputs (will be used in modal)
  const [distance, setDistance] = useState<number | ''>('');
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Modal states
  const [isPREditorModalOpen, setIsPREditorModalOpen] = useState(false);
  const [editingPR, setEditingPR] = useState<PersonalRecord | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<PersonalRecord | null>(null);

  useEffect(() => {
    if (isPREditorModalOpen) {
      if (editingPR) {
        setDistance(editingPR.distance);
        setTime(editingPR.time);
        setDate(editingPR.date);
        setNotes(editingPR.notes || '');
      } else {
        // Reset for "Add New"
        setDistance('');
        setTime('');
        setDate('');
        setNotes('');
      }
    }
  }, [isPREditorModalOpen, editingPR]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (distance === '' || !time || !date) {
      alert('Please fill in distance, time, and date.'); // Consider a more integrated notification
      return;
    }
    const prData: Omit<PersonalRecord, 'id'> = {
      distance: Number(distance),
      time,
      date,
      notes,
    };

    if (editingPR) {
      updatePR({ ...prData, id: editingPR.id });
    } else {
      addPR(prData);
    }

    setIsPREditorModalOpen(false);
    setEditingPR(null);
    // Reset form fields (already done by useEffect when modal opens for new, but good for clarity if modal isn't immediately closed)
    setDistance('');
    setTime('');
    setDate('');
    setNotes('');
  };

  const handleDeleteConfirm = () => {
    if (showDeleteConfirmModal) {
      deletePR(showDeleteConfirmModal.id);
      setShowDeleteConfirmModal(null);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Personal Records</h1>
        <button
          onClick={() => { setEditingPR(null); setIsPREditorModalOpen(true); }}
          className="btn btn-primary"
        >
          <PlusCircle size={18} className="mr-2" /> Add New PR
        </button>
      </div>

      {/* PR Editor Modal */}
      <Modal
        isOpen={isPREditorModalOpen}
        onClose={() => { setIsPREditorModalOpen(false); setEditingPR(null); }}
        title={editingPR ? "Edit Personal Record" : "Add New Personal Record"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="modal-distance" className="block mb-1 font-medium text-sm text-muted-foreground">Distance (km):</label>
            <input
              type="number"
              id="modal-distance"
              value={distance}
              onChange={(e) => setDistance(e.target.value === '' ? '' : parseFloat(e.target.value))}
              className="input bg-background text-foreground border-border focus:ring-primary focus:border-primary w-full"
              required
            />
          </div>
          <div>
            <label htmlFor="modal-time" className="block mb-1 font-medium text-sm text-muted-foreground">Time (HH:MM:SS):</label>
            <input
              type="text"
              id="modal-time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="HH:MM:SS"
              className="input bg-background text-foreground border-border focus:ring-primary focus:border-primary w-full"
              required
            />
          </div>
          <div>
            <label htmlFor="modal-date" className="block mb-1 font-medium text-sm text-muted-foreground">Date:</label>
            <input
              type="date"
              id="modal-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input bg-background text-foreground border-border focus:ring-primary focus:border-primary w-full"
              required
            />
          </div>
          <div>
            <label htmlFor="modal-notes" className="block mb-1 font-medium text-sm text-muted-foreground">Notes (optional):</label>
            <textarea
              id="modal-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input bg-background text-foreground border-border focus:ring-primary focus:border-primary w-full"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => { setIsPREditorModalOpen(false); setEditingPR(null); }}
              className="btn btn-outline dark:border-muted dark:text-muted-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {editingPR ? 'Save Changes' : 'Add PR'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <Modal
          isOpen={!!showDeleteConfirmModal}
          onClose={() => setShowDeleteConfirmModal(null)}
          title="Confirm Deletion"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete this PR for {showDeleteConfirmModal?.distance} km? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirmModal(null)}
                className="btn btn-outline dark:border-muted dark:text-muted-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="btn btn-destructive"
              >
                <Trash2 size={16} className="mr-2" /> Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      <Card title="My Personal Records"
            className="bg-card text-card-foreground border-border"
            titleClassName="text-xl flex items-center"
            icon={<Trophy size={20} className="mr-2 text-primary" />}
      >
        {prs.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No personal records yet. Add one by clicking the button above!</p>
        ) : (
          <ul className="space-y-4">
            {prs.map((pr) => (
              <li key={pr.id} className="bg-background p-4 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                  {/* ... PR details ... */}
                  <div className="flex items-center space-x-2">
                    <Waypoints size={18} className="text-primary" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Distance</p>
                      <p className="text-md font-semibold text-foreground">{pr.distance} km</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock size={18} className="text-primary" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Time</p>
                      <p className="text-md font-semibold text-foreground">{pr.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarDays size={18} className="text-primary" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Date</p>
                      <p className="text-md font-semibold text-foreground">{pr.date}</p>
                    </div>
                  </div>
                  {pr.notes && (
                    <div className="md:col-span-2 lg:col-span-3 mt-2 pt-2 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground">Notes</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{pr.notes}</p>
                    </div>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-border flex justify-end space-x-2">
                  <button
                    onClick={() => { setEditingPR(pr); setIsPREditorModalOpen(true); }}
                    className="btn btn-ghost btn-sm text-xs p-1 h-auto hover:bg-muted"
                  >
                    <Edit2 size={14} className="mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirmModal(pr)}
                    className="btn btn-ghost btn-sm text-xs p-1 h-auto text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 size={14} className="mr-1" /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default PersonalRecords;
