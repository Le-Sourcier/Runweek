import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Calendar,
  Ruler,
  MapPin,
  Thermometer,
  CloudRain,
  Wind,
  Heart,
  Mountain,
  Tag,
  FileText,
  AlertCircle,
  X,
} from "lucide-react";
import { PersonalRecord } from "../../types/PsRecor";

interface PRFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PersonalRecord) => void;
  editingPR?: PersonalRecord | null;
}

const PRFormModal: React.FC<PRFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingPR,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Required fields
    distance: "",
    time: "",
    date: "",

    // Optional fields
    notes: "",
    location: "",
    weather: {
      temperature: "",
      conditions: "",
      humidity: "",
      windSpeed: "",
    },
    heartRate: {
      average: "",
      max: "",
      min: "",
    },
    elevation: {
      gain: "",
      loss: "",
      maxAltitude: "",
    },
    tags: [] as string[],
    tagInput: "",
  });

  useEffect(() => {
    if (editingPR && isOpen) {
      setFormData({
        distance: editingPR.distance.toString(),
        time: editingPR.time,
        date: editingPR.date,
        notes: editingPR.notes || "",
        location: editingPR.location || "",
        weather: {
          temperature: editingPR.weather?.temperature?.toString() || "",
          conditions: editingPR.weather?.conditions || "",
          humidity: editingPR.weather?.humidity?.toString() || "",
          windSpeed: editingPR.weather?.windSpeed?.toString() || "",
        },
        heartRate: {
          average: editingPR.heartRate?.average?.toString() || "",
          max: editingPR.heartRate?.max?.toString() || "",
          min: editingPR.heartRate?.min?.toString() || "",
        },
        elevation: {
          gain: editingPR.elevation?.gain?.toString() || "",
          loss: editingPR.elevation?.loss?.toString() || "",
          maxAltitude: editingPR.elevation?.maxAltitude?.toString() || "",
        },
        tags: editingPR.tags || [],
        tagInput: "",
      });
    } else if (isOpen) {
      // Reset form for new record
      setFormData({
        distance: "",
        time: "",
        date: "",
        notes: "",
        location: "",
        weather: {
          temperature: "",
          conditions: "",
          humidity: "",
          windSpeed: "",
        },
        heartRate: {
          average: "",
          max: "",
          min: "",
        },
        elevation: {
          gain: "",
          loss: "",
          maxAltitude: "",
        },
        tags: [],
        tagInput: "",
      });
    }
    setCurrentStep(1);
  }, [editingPR, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("weather.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        weather: {
          ...prev.weather,
          [field]: value,
        },
      }));
    } else if (name.startsWith("heartRate.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        heartRate: {
          ...prev.heartRate,
          [field]: value,
        },
      }));
    } else if (name.startsWith("elevation.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        elevation: {
          ...prev.elevation,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddTag = () => {
    if (
      formData.tagInput.trim() &&
      !formData.tags.includes(formData.tagInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, prev.tagInput.trim()],
        tagInput: "",
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    // Prepare the data for submission
    const submissionData: PersonalRecord = {
      distance: Number(formData.distance),
      time: formData.time,
      date: formData.date,
      ...(formData.notes && { notes: formData.notes }),
      ...(formData.location && { location: formData.location }),
      ...((formData.weather.temperature ||
        formData.weather.conditions ||
        formData.weather.humidity ||
        formData.weather.windSpeed) && {
        weather: {
          ...(formData.weather.temperature && {
            temperature: parseInt(formData.weather.temperature),
          }),
          ...(formData.weather.conditions && {
            conditions: formData.weather.conditions,
          }),
          ...(formData.weather.humidity && {
            humidity: parseInt(formData.weather.humidity),
          }),
          ...(formData.weather.windSpeed && {
            windSpeed: parseInt(formData.weather.windSpeed),
          }),
        },
      }),
      ...((formData.heartRate.average ||
        formData.heartRate.max ||
        formData.heartRate.min) && {
        heartRate: {
          ...(formData.heartRate.average && {
            average: parseInt(formData.heartRate.average),
          }),
          ...(formData.heartRate.max && {
            max: parseInt(formData.heartRate.max),
          }),
          ...(formData.heartRate.min && {
            min: parseInt(formData.heartRate.min),
          }),
        },
      }),
      ...((formData.elevation.gain ||
        formData.elevation.loss ||
        formData.elevation.maxAltitude) && {
        elevation: {
          ...(formData.elevation.gain && {
            gain: parseInt(formData.elevation.gain),
          }),
          ...(formData.elevation.loss && {
            loss: parseInt(formData.elevation.loss),
          }),
          ...(formData.elevation.maxAltitude && {
            maxAltitude: parseInt(formData.elevation.maxAltitude),
          }),
        },
      }),
      ...(formData.tags.length > 0 && { tags: formData.tags }),
    };

    onSubmit(submissionData);
    onClose();
  };

  const isStep1Valid = formData.distance && formData.time && formData.date;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {editingPR ? "Edit Personal Record" : "Add New Personal Record"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 pt-4">
          <div className="flex justify-between items-center mb-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {currentStep > step ? <CheckCircle size={16} /> : step}
                </div>
                <span className="text-xs mt-1 text-gray-600 dark:text-gray-300">
                  {step === 1 ? "Basics" : step === 2 ? "Details" : "Review"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 pb-6"
        >
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Distance (meters) *
                  </label>
                  <div className="relative">
                    <Ruler
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="number"
                      name="distance"
                      value={formData.distance}
                      onChange={handleInputChange}
                      placeholder="e.g., 5000 for 5km"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Time (HH:MM:SS) *
                  </label>
                  <div className="relative">
                    <Clock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      placeholder="HH:MM:SS or MM:SS"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date *
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <AlertCircle size={16} className="mr-2" />
                  All fields marked with * are required
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Additional Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Location */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3 flex items-center">
                  <MapPin size={20} className="mr-2 text-blue-500" />
                  Location
                </h3>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Where did you run?"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Weather */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3 flex items-center">
                  <Thermometer size={20} className="mr-2 text-blue-500" />
                  Weather Conditions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Temperature (°C)
                    </label>
                    <input
                      type="number"
                      name="weather.temperature"
                      value={formData.weather.temperature}
                      onChange={handleInputChange}
                      placeholder="e.g., 20"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Conditions
                    </label>
                    <select
                      name="weather.conditions"
                      value={formData.weather.conditions}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select conditions</option>
                      <option value="Sunny">Sunny</option>
                      <option value="Cloudy">Cloudy</option>
                      <option value="Rainy">Rainy</option>
                      <option value="Snowy">Snowy</option>
                      <option value="Windy">Windy</option>
                      <option value="Foggy">Foggy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Humidity (%)
                    </label>
                    <div className="relative">
                      <CloudRain
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="number"
                        name="weather.humidity"
                        value={formData.weather.humidity}
                        onChange={handleInputChange}
                        placeholder="e.g., 65"
                        min="0"
                        max="100"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Wind Speed (km/h)
                    </label>
                    <div className="relative">
                      <Wind
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="number"
                        name="weather.windSpeed"
                        value={formData.weather.windSpeed}
                        onChange={handleInputChange}
                        placeholder="e.g., 15"
                        min="0"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Heart Rate */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3 flex items-center">
                  <Heart size={20} className="mr-2 text-blue-500" />
                  Heart Rate
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Average (bpm)
                    </label>
                    <input
                      type="number"
                      name="heartRate.average"
                      value={formData.heartRate.average}
                      onChange={handleInputChange}
                      placeholder="e.g., 145"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max (bpm)
                    </label>
                    <input
                      type="number"
                      name="heartRate.max"
                      value={formData.heartRate.max}
                      onChange={handleInputChange}
                      placeholder="e.g., 175"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Min (bpm)
                    </label>
                    <input
                      type="number"
                      name="heartRate.min"
                      value={formData.heartRate.min}
                      onChange={handleInputChange}
                      placeholder="e.g., 120"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Elevation */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3 flex items-center">
                  <Mountain size={20} className="mr-2 text-blue-500" />
                  Elevation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Gain (m)
                    </label>
                    <input
                      type="number"
                      name="elevation.gain"
                      value={formData.elevation.gain}
                      onChange={handleInputChange}
                      placeholder="e.g., 250"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Loss (m)
                    </label>
                    <input
                      type="number"
                      name="elevation.loss"
                      value={formData.elevation.loss}
                      onChange={handleInputChange}
                      placeholder="e.g., 230"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Altitude (m)
                    </label>
                    <input
                      type="number"
                      name="elevation.maxAltitude"
                      value={formData.elevation.maxAltitude}
                      onChange={handleInputChange}
                      placeholder="e.g., 450"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3 flex items-center">
                  <Tag size={20} className="mr-2 text-blue-500" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 px-2 py-1 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-blue-600 dark:text-blue-200 hover:text-blue-800 dark:hover:text-blue-400"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={formData.tagInput}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tagInput: e.target.value,
                      }))
                    }
                    placeholder="Add a tag"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), handleAddTag())
                    }
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3 flex items-center">
                  <FileText size={20} className="mr-2 text-blue-500" />
                  Notes
                </h3>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any additional notes about this run..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                Review Your Record
              </h3>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                  Basic Information
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600 dark:text-gray-300">
                    Distance:
                  </div>
                  <div className="font-medium">{formData.distance} meters</div>

                  <div className="text-gray-600 dark:text-gray-300">Time:</div>
                  <div className="font-medium">{formData.time}</div>

                  <div className="text-gray-600 dark:text-gray-300">Date:</div>
                  <div className="font-medium">{formData.date}</div>
                </div>
              </div>

              {formData.location && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                    Location
                  </h4>
                  <p className="text-sm">{formData.location}</p>
                </div>
              )}

              {(formData.weather.temperature ||
                formData.weather.conditions ||
                formData.weather.humidity ||
                formData.weather.windSpeed) && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                    Weather Conditions
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {formData.weather.temperature && (
                      <>
                        <div className="text-gray-600 dark:text-gray-300">
                          Temperature:
                        </div>
                        <div>{formData.weather.temperature}°C</div>
                      </>
                    )}
                    {formData.weather.conditions && (
                      <>
                        <div className="text-gray-600 dark:text-gray-300">
                          Conditions:
                        </div>
                        <div>{formData.weather.conditions}</div>
                      </>
                    )}
                    {formData.weather.humidity && (
                      <>
                        <div className="text-gray-600 dark:text-gray-300">
                          Humidity:
                        </div>
                        <div>{formData.weather.humidity}%</div>
                      </>
                    )}
                    {formData.weather.windSpeed && (
                      <>
                        <div className="text-gray-600 dark:text-gray-300">
                          Wind Speed:
                        </div>
                        <div>{formData.weather.windSpeed} km/h</div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {(formData.heartRate.average ||
                formData.heartRate.max ||
                formData.heartRate.min) && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                    Heart Rate
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {formData.heartRate.average && (
                      <>
                        <div className="text-gray-600 dark:text-gray-300">
                          Average:
                        </div>
                        <div>{formData.heartRate.average} bpm</div>
                      </>
                    )}
                    {formData.heartRate.max && (
                      <>
                        <div className="text-gray-600 dark:text-gray-300">
                          Max:
                        </div>
                        <div>{formData.heartRate.max} bpm</div>
                      </>
                    )}
                    {formData.heartRate.min && (
                      <>
                        <div className="text-gray-600 dark:text-gray-300">
                          Min:
                        </div>
                        <div>{formData.heartRate.min} bpm</div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {(formData.elevation.gain ||
                formData.elevation.loss ||
                formData.elevation.maxAltitude) && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                    Elevation
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {formData.elevation.gain && (
                      <>
                        <div className="text-gray-600 dark:text-gray-300">
                          Gain:
                        </div>
                        <div>{formData.elevation.gain} m</div>
                      </>
                    )}
                    {formData.elevation.loss && (
                      <>
                        <div className="text-gray-600 dark:text-gray-300">
                          Loss:
                        </div>
                        <div>{formData.elevation.loss} m</div>
                      </>
                    )}
                    {formData.elevation.maxAltitude && (
                      <>
                        <div className="text-gray-600 dark:text-gray-300">
                          Max Altitude:
                        </div>
                        <div>{formData.elevation.maxAltitude} m</div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {formData.tags.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 px-2 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {formData.notes && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                    Notes
                  </h4>
                  <p className="text-sm whitespace-pre-wrap">
                    {formData.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </form>

        {/* Navigation Buttons */}
        <div className="flex justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() =>
              currentStep > 1 ? setCurrentStep((prev) => prev - 1) : onClose()
            }
            className="px-4 py-2 flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
          >
            <ChevronLeft size={20} className="mr-1" />
            {currentStep === 1 ? "Cancel" : "Back"}
          </button>

          <button
            type="button"
            onClick={
              currentStep < 3
                ? () => setCurrentStep((prev) => prev + 1)
                : handleSubmit
            }
            disabled={currentStep === 1 && !isStep1Valid}
            className={`px-4 py-2 flex items-center ${
              currentStep === 1 && !isStep1Valid
                ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            } rounded-lg`}
          >
            {currentStep < 3 ? "Next" : editingPR ? "Save Changes" : "Add PR"}
            {currentStep < 3 && <ChevronRight size={20} className="ml-1" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PRFormModal;
