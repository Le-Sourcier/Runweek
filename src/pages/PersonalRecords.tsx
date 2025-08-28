import { useState, useEffect, FC } from "react";
import { PersonalRecord } from "../types";
import {
  calculatePace,
  timeStringToSeconds,
  metersToKilometers,
} from "../utils/formatters";
import Card from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import {
  PlusCircle,
  Edit2,
  Trash2,
  CalendarDays,
  Clock,
  Waypoints,
  Filter,
  ArrowDownUp,
} from "lucide-react";
import { usePRStore } from "../stores/usePRStore";
import PRFormModal from "../components/pr/PRFormModal";
import { useMessages } from "../hooks/useMessage";
import { extractErrorMessage } from "../utils/error-handler";
import Spiner from "../components/ui/Spiner";

const DISTANCE_FILTER_OPTIONS = [
  { label: "All Records", value: "all" },
  { label: "1km", value: "1000" },
  { label: "5km", value: "5000" },
  { label: "10km", value: "10000" },
  { label: "Half Marathon", value: "21097.5" },
  { label: "Marathon", value: "42195" },
];

const PersonalRecords: FC = () => {
  // Utilisation du store au lieu du contexte
  const {
    processedPRs,
    createRecord,
    deleteRecord,
    updateRecord,
    setSortConfig,
    sortConfig,
    setDistanceFilter,
    distanceFilter,
    getAllRecords,
    isLoading,
    error
  } = usePRStore();

  const { showMessage } = useMessages();

  // Modal states
  const [isPRSaving, setIsPRSaving] = useState(false);
  const [isPREditorModalOpen, setIsPREditorModalOpen] = useState(false);
  const [isPRDeleting, setIsPRDeleting] = useState(false);
  const [editingPR, setEditingPR] = useState<PersonalRecord | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] =
    useState<PersonalRecord | null>(null);

  // Charger les records au montage
  useEffect(() => {
    getAllRecords();
  }, [getAllRecords]);

  useEffect(() => {
    if (error) {
      showMessage(extractErrorMessage(error).message);
    }
  }, [error])

  const handleDeleteConfirm = async () => {
    if (showDeleteConfirmModal) {
      try {
        setIsPRDeleting(true);
        await deleteRecord(showDeleteConfirmModal.id!);
        setShowDeleteConfirmModal(null);
        showMessage("RECORD_DELETED");
      } catch (error) {
        showMessage(extractErrorMessage(error).message);
        setShowDeleteConfirmModal(null);
      } finally {
        setIsPRDeleting(false);
      }
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  const handlePRSaving = async (data: PersonalRecord) => {
    try {
      setIsPRSaving(true);
      if (editingPR) {
        await updateRecord(data);
        showMessage("RECORD_UPDATED");
      } else {
        await createRecord(data);
        showMessage("RECORD_CREATED");
      }
      setIsPREditorModalOpen(false);
      setEditingPR(null);
    } catch (error) {
      setIsPREditorModalOpen(true);
      showMessage(extractErrorMessage(error).message);
      return;
    } finally {
      setIsPRSaving(false);
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Personal Records</h1>
        <button
          onClick={() => {
            setEditingPR(null);
            setIsPREditorModalOpen(true);
          }}
          className="btn btn-primary"
        >
          <PlusCircle size={18} className="mr-2" /> Add New PR
        </button>
      </div>

      {/* PR Editor Modal */}
      <Modal
        isOpen={isPREditorModalOpen}
        onClose={() => {
          setIsPREditorModalOpen(false);
          setEditingPR(null);
        }}
        title={editingPR ? "Edit Personal Record" : "Add New Personal Record"}
        size="md"
      >
        <PRFormModal
          isOpen={isPREditorModalOpen}
          isPRSaving={isPRSaving}
          onClose={() => { setIsPREditorModalOpen(false); }}
          onSubmit={handlePRSaving}
          editingPR={editingPR}
        />
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
              Are you sure you want to delete this PR for{" "}
              {showDeleteConfirmModal?.distance} meters? This action cannot be
              undone.
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
                className="btn btn-destructive text-red-500 hover:text-red-500 border border-red-500 hover:border-red-500"
              >
                <Trash2 size={16} className="mr-2" /> Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      <Card
        title="My Personal Records"
        className="bg-card text-card-foreground border-border"
        // titleClassName="text-xl flex items-center"
        // action={<Trophy size={20} className="mr-2 text-primary" />}
        action={
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Filter size={16} className="text-muted-foreground" />
              <select
                value={distanceFilter || "all"}
                onChange={(e) =>
                  setDistanceFilter(
                    e.target.value === "all" ? null : e.target.value
                  )
                }
                className="input input-sm bg-background text-foreground border-border focus:ring-primary focus:border-primary"
              >
                {DISTANCE_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-1">
              <ArrowDownUp size={16} className="text-muted-foreground" />
              <select
                onChange={(e) => {
                  const [key, direction] = e.target.value.split("-");
                  if (key && direction) {
                    setSortConfig(
                      key as "date" | "distance" | "time",
                      direction as "ascending" | "descending"
                    );
                  }
                }}
                value={
                  sortConfig
                    ? `${sortConfig.key}-${sortConfig.direction}`
                    : "date-descending"
                }
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
              ? `No records found for ${DISTANCE_FILTER_OPTIONS.find(
                (opt) => opt.value === distanceFilter
              )?.label || "this distance"
              }. Try a different filter.`
              : "No personal records yet. Add one!"}
          </p>
        ) : (
          <ul className="space-y-4">
            {processedPRs.map((pr) => {
              const distanceInKm = metersToKilometers(pr.distance);
              const timeInSec = timeStringToSeconds(pr.time);
              const pace = calculatePace(distanceInKm, timeInSec);
              const displayDistance =
                distanceInKm >= 1
                  ? `${distanceInKm.toLocaleString()} km`
                  : `${pr.distance} m`;

              return (
                <li
                  key={pr.id}
                  className="bg-background p-4 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                    <div className="flex items-center space-x-2">
                      <Waypoints size={18} className="text-primary" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Distance
                        </p>
                        <p className="text-md font-semibold text-foreground">
                          {displayDistance}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock size={18} className="text-primary" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Time
                        </p>
                        <p className="text-md font-semibold text-foreground">
                          {pr.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock size={18} className="text-green-500" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Pace
                        </p>
                        <p className="text-md font-semibold text-foreground">
                          {pace}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CalendarDays size={18} className="text-primary" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Date
                        </p>
                        <p className="text-md font-semibold text-foreground">
                          {new Date(pr.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {pr.notes && (
                      <div className="md:col-span-2 lg:col-span-4 mt-2 pt-2 border-t border-border">
                        <p className="text-xs font-medium text-muted-foreground">
                          Notes
                        </p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {pr.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 p-2 border-t border-border flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setEditingPR(pr);
                        setIsPREditorModalOpen(true);
                      }}
                      className="btn btn-ghost btn-sm text-xs p-1 h-auto hover:bg-muted"
                    >
                      <Edit2 size={14} className="mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirmModal(pr)}
                      className="btn btn-ghost btn-sm text-xs p-1 h-auto text-destructive hover:bg-destructive/10"
                    >
                      {isPRDeleting ? (
                        <Spiner />
                      ) : (
                        <Trash2 size={14} className="mr-1" />
                      )}
                      {isPRDeleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default PersonalRecords;
