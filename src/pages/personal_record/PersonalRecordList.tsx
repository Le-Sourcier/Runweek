import React, { useState } from 'react';
import { Waypoints, Clock, CalendarDays, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { metersToKilometers, timeStringToSeconds, calculatePace } from '../../utils/formatters';
import { PersonalRecord } from '../../types/PsRecor';
import Spiner from '../../components/ui/Spiner';


interface PersonalRecordListProps {
  processedPRs: PersonalRecord[];
  setEditingPR: (pr: PersonalRecord) => void;
  setIsPREditorModalOpen: (open: boolean) => void;
  setShowDeleteConfirmModal: (pr: PersonalRecord) => void;
  isPRDeleting: boolean;
}

export const PersonalRecordList: React.FC<PersonalRecordListProps> = ({
  processedPRs,
  setEditingPR,
  setIsPREditorModalOpen,
  setShowDeleteConfirmModal,
  isPRDeleting,
}) => {
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedRecords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <ul className="space-y-4">
      {processedPRs.map((pr) => {
        const distanceInKm = metersToKilometers(pr.distance);
        const timeInSec = timeStringToSeconds(pr.time);
        const pace = calculatePace(distanceInKm, timeInSec);
        const displayDistance =
          distanceInKm >= 1
            ? `${distanceInKm.toLocaleString()} km`
            : `${pr.distance} m`;
        const isExpanded = pr.id ? expandedRecords.has(pr.id) : false;

        return (
          <li
            key={pr.id}
            className="bg-background p-4 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
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
              <div className="flex items-center space-x-2">
                <Clock size={18} className="text-green-500" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Pace</p>
                  <p className="text-md font-semibold text-foreground">{pace}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarDays size={18} className="text-primary" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Date</p>
                  <p className="text-md font-semibold text-foreground">
                    {new Date(pr.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {pr.notes && (
                <div className="md:col-span-2 lg:col-span-4 mt-2 pt-2 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground">Notes</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{pr.notes}</p>
                </div>
              )}
            </div>

            {/* Collapsible Section */}
            {(pr.location || pr.weather || pr.heartRate || pr.elevation || pr.splits || pr.tags || pr.createdAt || pr.updatedAt) && (
              <div className="mt-4">
                <button
                  onClick={() => pr.id && toggleExpand(pr.id)}
                  className="flex items-center justify-center w-full text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp size={16} className="mr-1" /> Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} className="mr-1" /> Show Details
                    </>
                  )}
                </button>
                {isExpanded && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pr.location && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Location</p>
                        <p className="text-sm text-foreground">{pr.location}</p>
                      </div>
                    )}
                    {pr.weather && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Weather</p>
                        <div className="text-sm text-foreground">
                          {pr.weather.temperature && <p>Temp: {pr.weather.temperature}°C</p>}
                          {pr.weather.conditions && <p>Conditions: {pr.weather.conditions}</p>}
                          {pr.weather.humidity && <p>Humidity: {pr.weather.humidity}%</p>}
                          {pr.weather.windSpeed && <p>Wind: {pr.weather.windSpeed} km/h</p>}
                        </div>
                      </div>
                    )}
                    {pr.heartRate && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Heart Rate</p>
                        <div className="text-sm text-foreground">
                          {pr.heartRate.average && <p>Avg: {pr.heartRate.average} bpm</p>}
                          {pr.heartRate.max && <p>Max: {pr.heartRate.max} bpm</p>}
                          {pr.heartRate.min && <p>Min: {pr.heartRate.min} bpm</p>}
                        </div>
                      </div>
                    )}
                    {pr.elevation && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Elevation</p>
                        <div className="text-sm text-foreground">
                          {pr.elevation.gain && <p>Gain: {pr.elevation.gain} m</p>}
                          {pr.elevation.loss && <p>Loss: {pr.elevation.loss} m</p>}
                          {pr.elevation.maxAltitude && <p>Max Alt: {pr.elevation.maxAltitude} m</p>}
                        </div>
                      </div>
                    )}
                    {pr.splits && pr.splits.length > 0 && (
                      <div className="sm:col-span-2 lg:col-span-3">
                        <p className="text-xs font-medium text-muted-foreground">Splits</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                          {pr.splits.map((split, index) => (
                            <div key={index} className="text-sm text-foreground">
                              <p>Split {index + 1}:</p>
                              <p>Distance: {metersToKilometers(split.distance).toLocaleString()} km</p>
                              <p>Time: {split.time}</p>
                              <p>Pace: {split.pace}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {pr.tags && pr.tags.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Tags</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {pr.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {(pr.createdAt || pr.updatedAt) && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Timestamps</p>
                        <div className="text-sm text-foreground">
                          {pr.createdAt && (
                            <p>Created: {new Date(pr.createdAt).toLocaleString()}</p>
                          )}
                          {pr.updatedAt && (
                            <p>Updated: {new Date(pr.updatedAt).toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

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
  );
};