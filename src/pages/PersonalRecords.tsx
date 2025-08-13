import React, { useState, useEffect } from 'react';
import { usePRs } from '../context/PRContext';
import { PersonalRecord } from '../types';
import { calculatePace, timeStringToSeconds, metersToKilometers } from '../utils/formatters';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { Trophy, PlusCircle, Edit2, Trash2, CalendarDays, Clock, Waypoints, Filter, ArrowDownUp } from 'lucide-react';

const DISTANCE_FILTER_OPTIONS = [
  { label: "All Records", value: "all" },
  { label: "1km", value: "1000" },
  { label: "5km", value: "5000" },
  { label: "10km", value: "10000" },
  { label: "Half Marathon", value: "21097.5" },
  { label: "Marathon", value: "42195" },
  // Add other common distances as needed
];

const PersonalRecords: React.FC = () => {
  const {
    processedPRs,
    addPR,
    deletePR,
    updatePR,
    setSortConfig,
    sortConfig,
    setDistanceFilter,
    distanceFilter
  } = usePRs();

  // State for the form inputs
  // State for the form inputs (will be used in modal)
  const [distance, setDistance] = useState<number | ''>(''); // Assuming distance is stored in meters in the form
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
        setDistance(editingPR.distance); // Assuming editingPR.distance is in meters
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
      alert('Please fill in distance (in meters), time, and date.'); // Consider a more integrated notification
      return;
    }
    const prData: Omit<PersonalRecord, 'id'> = {
      distance: Number(distance), // Store distance in meters
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
            <label htmlFor="modal-distance" className="block mb-1 font-medium text-sm text-muted-foreground">Distance (meters):</label>
            <input
              type="number"
              id="modal-distance"
              placeholder="e.g., 5000 for 5km"
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
            headerActions={
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Filter size={16} className="text-muted-foreground" />
                  <select
                    value={distanceFilter || "all"}
                    onChange={(e) => setDistanceFilter(e.target.value === "all" ? null : e.target.value)}
                    className="input input-sm bg-background text-foreground border-border focus:ring-primary focus:border-primary"
                  >
                    {DISTANCE_FILTER_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-1">
                  <ArrowDownUp size={16} className="text-muted-foreground" />
                  <select
                    onChange={(e) => {
                      const [key, direction] = e.target.value.split('-');
                      if (key && direction) {
                        setSortConfig(key as 'date' | 'distance' | 'time', direction as 'ascending' | 'descending');
                      } else if (key) {
                        setSortConfig(key as 'date' | 'distance' | 'time');
                      } else {
                         setSortConfig('date', 'descending'); // Default sort
                      }
                    }}
                    value={sortConfig ? `${sortConfig.key}-${sortConfig.direction}` : 'date-descending'}
                    className="input input-sm bg-background text-foreground border-border focus:ring-primary focus:border-primary"
                  >
                    <option value="date-descending">Date (Newest)</option>
                    <option value="date-ascending">Date (Oldest)</option>
                    <option value="distance-ascending">Distance (Shortest)</option>
                    <option value="distance-descending">Distance (Longest)</option>
                    <option value="time-ascending">Time (Fastest)</option>
                    <option value="time-descending">Time (Slowest)</option>
                  </select>
                </div>
              </div>
            }
      >
        {processedPRs.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            {distanceFilter && distanceFilter !== "all"
              ? `No records found for ${DISTANCE_FILTER_OPTIONS.find(opt => opt.value === distanceFilter)?.label || 'this distance'}. Try a different filter.`
              : "No personal records yet. Add one!"}
          </p>
        ) : (
          <ul className="space-y-4">
            {processedPRs.map((pr) => {
              const distanceInKm = metersToKilometers(pr.distance);
              const timeInSec = timeStringToSeconds(pr.time);
              const pace = calculatePace(distanceInKm, timeInSec);
              const displayDistance = distanceInKm >= 1 ? `${distanceInKm.toLocaleString()} km` : `${pr.distance} m`;

              return (
                <li key={pr.id} className="bg-background p-4 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start"> {/* Added Pace column */}
                    <div className="flex items-center space-x-2">
                      <Waypoints size={18} className="text-primary" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Distance</p>
                        <p className="text-md font-semibold text-foreground">{displayDistance}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock size={18} className="text-primary" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Time</p>
                        <p className="text-md font-semibold text-foreground">{pr.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2"> {/* Pace Column */}
                      <Clock size={18} className="text-green-500" /> {/* Different color for pace */}
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Pace</p>
                        <p className="text-md font-semibold text-foreground">{pace}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CalendarDays size={18} className="text-primary" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Date</p>
                        <p className="text-md font-semibold text-foreground">{new Date(pr.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {pr.notes && (
                      <div className="md:col-span-2 lg:col-span-4 mt-2 pt-2 border-t border-border"> {/* Span all columns */}
                        <p className="text-xs font-medium text-muted-foreground">Notes</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{pr.notes}</p>
                      </div>
                    )}
                  </div>
                <div className="mt-3 pt-3 border-t border-border flex justify-end space-x-2">
                  <button
                    onClick={() => { setEditingPR(pr); setIsPREditorModalOpen(true); }}
                    className="btn btn-ghost btn-sm text-xs p-1 h-auto hover:bg-muted" // Ensure these class names are valid
                  >
                    <Edit2 size={14} className="mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirmModal(pr)}
                    className="btn btn-ghost btn-sm text-xs p-1 h-auto text-destructive hover:bg-destructive/10" // Ensure these class names are valid
                  >
                    <Trash2 size={14} className="mr-1" /> Delete
                  </button>
                </div>
              </li>
            )})}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default PersonalRecords;
